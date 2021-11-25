import {Printer} from "../Configs/Printer";
import {acceleratedRaycast, MeshBVH} from 'three-mesh-bvh';
import {SceneObject} from "../Scene/SceneObject";
import {sceneStore} from "../Scene/SceneStore";
import {BufferGeometry, Float32BufferAttribute, Points, PointsMaterial, Raycaster, Vector3} from "three";
import * as THREE from "three";
import {DrawDirLine, DrawPoint} from "./Utils";
import Globals from "../../Globals";
import {fs} from "../../Bridge";
import Jimp from 'jimp';

export default {}

async function createImage(sizeX, sizeY) {
        let promise = new Promise((resolve, reject) => {
                new Jimp(sizeX, sizeY, 0xff0000ff, (err, image) => {
                        resolve(image);
                });
        });

        let result = await promise;

        return result as Jimp;
}

export function calculateVoxelSizes(printer: Printer) {
       return {
               voxelSizeX: .1 * printer.Workspace.sizeX / printer.Resolution.X,
               voxelSizeY: .1 * printer.PrintSettings.LayerHeight,
               voxelSizeZ: .1 * printer.Workspace.sizeY / printer.Resolution.Y,
       }
}

export type SliceResult = {
        image: Uint8Array,
        voxelDrawCount: number
}

export async function slice(printer: Printer, layer: number) {
        const voxelSizes = calculateVoxelSizes(printer);

        const startPixelPositionX = sceneStore.gridSize.x / 2 - voxelSizes.voxelSizeX * printer.Resolution.X / 2;
        const startPixelPositionY = layer * voxelSizes.voxelSizeY;
        const startPixelPositionZ = sceneStore.gridSize.z / 2 - .1 * printer.Workspace.sizeY / 2;

        const raycaster = new Raycaster();
        const geometry = SceneObject.CalculateGeometry(sceneStore.objects);
        const mesh = new THREE.Mesh(geometry, sceneStore.materialForObjects.normal);
        geometry.computeBoundsTree();

        const imageBuffer = new Uint8Array(printer.Resolution.X * printer.Resolution.Y );

        imageBuffer.fill(0x00);

        let voxelDrawCount = 0;
        let indexPixelX = 0;

        raycaster.ray.direction.set(0, 0, 1);

        while (indexPixelX < printer.Resolution.X) {
                let newPixelPositionX = startPixelPositionX + voxelSizes.voxelSizeX * indexPixelX;

                raycaster.ray.origin.set(newPixelPositionX, startPixelPositionY, startPixelPositionZ);

                let intersection: any[] = [];

                mesh.raycast(raycaster, intersection);

                //DrawDirLine(raycaster.ray.origin, raycaster.ray.direction, sceneStore.scene)

                intersection.sort((a, b) => {
                        return a.distance < b.distance ? -1 : 1;
                })

                //console.log(intersection)

                for (let i = 0; i < intersection.length; i++) {

                        const isFrontFacing = intersection[i].face.normal.dot(raycaster.ray.direction) < 0;

                        if (!isFrontFacing) {
                                continue;
                        }

                        let numSolidsInside = 0;
                        let j = i + 1;

                        while (j < intersection.length) {
                                const isFrontFacing = intersection[j].face.normal.dot(raycaster.ray.direction) < 0;

                                if (!isFrontFacing) {
                                        if (numSolidsInside === 0) {
                                                // Found it
                                                break;
                                        }
                                        numSolidsInside--;
                                } else {
                                        numSolidsInside++;
                                }

                                j++;
                        }

                        if (j >= intersection.length) {
                                continue;
                        }



                        const indexStartZ = Math.floor((intersection[i].point.z - (startPixelPositionZ)) / voxelSizes.voxelSizeZ);
                        const indexFinishZ = Math.ceil((intersection[j].point.z - (startPixelPositionZ)) / voxelSizes.voxelSizeZ)
                        const bufferStartIndexX = printer.Resolution.X * indexPixelX;

                        voxelDrawCount += indexFinishZ - indexPixelX;
                        
                        imageBuffer.fill(0xff, bufferStartIndexX + indexStartZ, bufferStartIndexX +  indexFinishZ);

                        i = j;
                }

                indexPixelX += 1;
        }


        let promise = new Promise<SliceResult>((resolve, reject) => {
                resolve( {
                        image:imageBuffer,
                        voxelDrawCount: voxelDrawCount
                } as SliceResult);
        });

        let result = await promise;

        return result;
}