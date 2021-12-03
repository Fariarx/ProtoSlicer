import * as THREE from 'three'
import {sceneStore} from "../Scene/SceneStore";
import {SupportDescription} from "../Scene/Entities/Supports/SupprotStruct/Body/SupportDescription";
import {
    CylinderSize,
    SupportDescriptionCylinder
} from "../Scene/Entities/Supports/SupprotStruct/Body/SupportDescriptionCylinder";
import {Vector3} from "three";
import {DrawDirLine} from "./Utils";

export type SubstrateSizeBox = {
    xSize: number,
    ySize: number,
    zSize: number
}

export const generateSupport = (position: THREE.Vector3, quaternion: THREE.Quaternion, cylinder: SupportDescription | SupportDescriptionCylinder) => { //, cylinderCenter: CylinderSize, cylinderBottom: CylinderSize, substrate: SubstrateSizeBox
    if(cylinder instanceof SupportDescriptionCylinder)
    {
        let top = createCylinder(position, quaternion, cylinder.sizeTop);

        sceneStore.scene.add(top.mesh);
    }
};

const createCylinder = (positionStart: THREE.Vector3, quaternion: THREE.Quaternion, cylinderSize: CylinderSize) => {
    const geometry = new THREE.CylinderGeometry( 0.1 * cylinderSize.radiusTop / 2, 0.1 * cylinderSize.radiusBottom / 2, 0.1 * <number>cylinderSize.height / 2, cylinderSize.radialSegments ); //to mm
    //geometry.applyQuaternion(quaternion);

    const material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    const mesh = new THREE.Mesh( geometry, material );

    mesh.rotation.setFromQuaternion(quaternion);
    mesh.position.set(positionStart.x, positionStart.y, positionStart.z);

    let dir = new Vector3();

    mesh.getWorldDirection(dir);
    //DrawDirLine(position,dir)
    mesh.position.add(dir.multiplyScalar(geometry.parameters.height / 2));

    mesh.rotateX(-Math.PI / 2);

    return {
        mesh: mesh,
        end: mesh.position.clone().add(dir.multiplyScalar(geometry.parameters.height / 2))
    };
}