import {Printer} from "../Configs/Printer";
import {acceleratedRaycast, MeshBVH} from 'three-mesh-bvh';
import {SceneObject} from "../Scene/SceneObject";
import {sceneStore} from "../Scene/SceneStore";
import {BufferGeometry, Float32BufferAttribute, Points, PointsMaterial, Raycaster, Vector3} from "three";
import * as THREE from "three";
import {DrawDirLine, DrawPoint} from "./Utils";
import Globals from "../../Globals";
import {fs} from "../../Bridge";

export default function slice(printer: Printer, layer: number) {
        const voxelSizeX = .1 * printer.Workspace.sizeX / printer.Resolution.X;
        const voxelSizeY = .1 * printer.PrintSettings.LayerHeight;
        const voxelSizeZ = .1 * printer.Workspace.sizeY / printer.Resolution.Y;

        const startPixelPositionX = sceneStore.gridSize.x / 2 - voxelSizeX * printer.Resolution.X / 2;
        const startPixelPositionY = layer * voxelSizeY;
        const startPixelPositionZ = sceneStore.gridSize.z / 2 - .1 * printer.Workspace.sizeY / 2;

        const raycaster = new Raycaster();
        const geometry = SceneObject.CalculateGeometry(sceneStore.objects);
        const mesh = new THREE.Mesh(geometry, sceneStore.materialForObjects.normal);
        geometry.computeBoundsTree();
        raycaster.ray.direction.set(0,0, 1);

        const image = new Uint8Array( printer.Resolution.X * printer.Resolution.Y );

        image.fill(0);

        let intersection: any[]  = [];
        let indexPixelX = 0;

        while (indexPixelX < printer.Resolution.X)
        {
                let newPixelPositionX = startPixelPositionX + voxelSizeX * indexPixelX;

                raycaster.ray.origin.set(newPixelPositionX, startPixelPositionY, startPixelPositionZ);


                mesh.raycast(raycaster, intersection);

                DrawDirLine(raycaster.ray.origin, raycaster.ray.direction, sceneStore.scene)

                intersection.sort((a,b)=> {
                        return a.distance < b.distance ? -1 : 1;
                })

                let pixelLineStartPoint: Vector3 | null = null;

                for(let i = 0; i < intersection.length; i++)
                {
                        if(!pixelLineStartPoint)
                        {
                                pixelLineStartPoint = intersection[i].point as Vector3;
                        }
                        else {
                                let pixelLineFinishPoint = intersection[i].point;

                                image.fill(255, Math.round(pixelLineStartPoint.x / voxelSizeX), Math.round(pixelLineFinishPoint.x / voxelSizeX))

                                pixelLineStartPoint = null;
                        }
                }

                indexPixelX += 43;
        }

        const data = btoa(
            image.reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        fs.writeFileSync(`texs.png`, 'data:image/png;base64' + data, 'binary');


        //console.log(intersection)

/*
        // Raycast layer section (no antialiasing)

        /!*
            Beware different coordinate system axis:
            X in machine is Z in Three.js
            Y in machine is X in Three.js
            Z in machine is Y in Three.js
        *!/
        const layerHeight = printer.PrintSettings.LayerHeight;
        const initialRayZ = printer.Workspace.height * 1.5;
        const resolutionX = printer.Resolution.X;
        const resolutionZ = printer.Resolution.Y;
        const voxelXSize = printer.Workspace.sizeX / resolutionX;
        const voxelZSize = printer.Workspace.sizeY / resolutionZ;
        const initialLayerRayX = printer.Workspace.sizeX * 0.5 - voxelXSize * 0.5;
        const pixelOffset = printer.Workspace.height * 0.5;

        const mesh = this.mesh;
        const raycaster = this.raycaster;
        const ray = raycaster.ray;
        const bvh = this.bvh;

        ray.direction.set( 0, 0, - 1 );

        // Clear image
        image.fill( 0 );

        // Cast rays across the layer
        for ( let layerRayIndex = 0; layerRayIndex < resolutionX; layerRayIndex ++ ) {

            let x = initialLayerRayX - layerRayIndex * voxelXSize;
            ray.origin.set( x, layerHeight * ( layerIndex + 0.5 ), initialRayZ );

            const intersections = [ ];
            bvh.raycast( mesh, raycaster, ray, intersections );

            // intersects[ i ]. distance point uv face.normal

            intersections.sort( ( a, b ) => {
                if ( a.distance === b.distance ) return 0;
                return a.distance < b.distance ? - 1 : 1;
            } );

            const firstPixelIndex = layerRayIndex * resolutionZ;

            // Set pixels which are inside the solids
            const numIntersections = intersections.length;
            let intersectionIndex0 = 0;
            while ( intersectionIndex0 < numIntersections ) {

                // Find front-facing intersection
                let intersection0;
                while ( intersectionIndex0 < numIntersections ) {

                    intersection0 = intersections[ intersectionIndex0 ];

                    //const isFrontFacing = intersection0.face.normal.x < 0;
                    const isFrontFacing = intersection0.face.normal.dot( ray.direction ) < 0;

                    // Found it
                    if ( isFrontFacing ) break;

                    intersectionIndex0 ++;

                }

                if ( intersectionIndex0 >= numIntersections ) break;

                // Find back-facing intersection after the ray has left all contained solids behind.
                let numSolidsInside = 0;
                let intersectionIndex1 = intersectionIndex0 + 1;
                let intersection1;
                while ( intersectionIndex1 < numIntersections ) {

                    intersection1 = intersections[ intersectionIndex1 ];

                    //const isFrontFacing = intersection1.face.normal.x < 0;
                    const isFrontFacing = intersection1.face.normal.dot( ray.direction ) < 0;

                    if ( ! isFrontFacing ) {

                        if ( numSolidsInside === 0 ) {
                            // Found it
                            break;
                        }

                        numSolidsInside --;

                    }
                    else numSolidsInside ++;

                    intersectionIndex1 ++;

                }

                if ( intersectionIndex1 >= numIntersections ) break;

                var minXIndex = Math.max( 0, Math.min( resolutionZ - 1, Math.round( ( - intersection0.point.z + pixelOffset ) / voxelZSize ) ) );
                var maxXIndex = Math.max( 0, Math.min( resolutionZ - 1, Math.floor( ( - intersection1.point.z + pixelOffset ) / voxelZSize ) ) );

                image.fill( 255, firstPixelIndex + minXIndex, firstPixelIndex + maxXIndex );

                intersectionIndex0 = intersectionIndex1 + 1;

            }

        }*/

}