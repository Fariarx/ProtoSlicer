import * as THREE from 'three'
import {sceneStore} from "../Scene/SceneStore";
import {SupportDescription} from "../Scene/Entities/Supports/SupprotStruct/Body/SupportDescription";
import {
    CylinderSize, CylinderSizeCenter,
    SupportDescriptionCylinder
} from "../Scene/Entities/Supports/SupprotStruct/Body/SupportDescriptionCylinder";
import {Material, Vector3} from "three";
import {DrawDirLine} from "./Utils";
import {Directions, Log} from "../../Globals";
import {SupportDescriptionContact} from "../Scene/Entities/Supports/SupprotStruct/Contact/SupportDescriptionContact";
import {SupportDescriptionContactSphere} from "../Scene/Entities/Supports/SupprotStruct/Contact/SupportDescriptionContactSphere";
import {degToRad, radToDeg} from "three/src/math/MathUtils";

export type SubstrateSizeBox = {
    xSize: number,
    ySize: number,
    zSize: number
}

export const generateSupport = (positionStart: THREE.Vector3, quaternion: THREE.Quaternion, cylinder: SupportDescription | SupportDescriptionCylinder) => { //, cylinderCenter: CylinderSize, cylinderBottom: CylinderSize, substrate: SubstrateSizeBox
    if(cylinder instanceof SupportDescriptionCylinder)
    {
        let topCylinder = createCylinder(cylinder.material, positionStart, quaternion, cylinder.sizeTop);
        let topContact = createContactSphere(cylinder.material, positionStart, topCylinder.trueDir, cylinder.contact as SupportDescriptionContactSphere);
        let centerContact = createContactSphere(cylinder.material, topCylinder.end, null, cylinder.contactForSupport as SupportDescriptionContactSphere);
        let centerCylinder = createCylinder(cylinder.material, topCylinder.end, Directions.Down, cylinder.sizeCenter, Math.abs( topCylinder.end.y ));
        let botCylinder = createCylinderBottom(cylinder.material, centerCylinder.end, cylinder.sizeBottom);

        {
            const angleBetweenPlane = radToDeg(topCylinder.trueDir.angleTo(centerCylinder.trueDir));

            if(angleBetweenPlane > 90)
            {
                Log("Error generate support with ("+ angleBetweenPlane.toFixed(2) +") deg angle to plane", true);
                return false;
            }
            //console.log(radToDeg(angleBetweenPlane))
        }

        let support = new THREE.Group();

        support.add(topCylinder.mesh);
        support.add(topContact.mesh);
        support.add(centerCylinder.mesh);
        support.add(centerContact.mesh);
        support.add(botCylinder.mesh);

        return support;
    }

    return false;
};

const createCylinderBottom = (material: Material, positionStart: THREE.Vector3, cylinderSize: CylinderSize ) => {
    const geometry = new THREE.CylinderGeometry( 0.1 * cylinderSize.radiusTop / 2, 0.1 * cylinderSize.radiusBottom / 2, 0.1 * cylinderSize.height[0] / 2, cylinderSize.radialSegments ); //to mm
    const mesh = new THREE.Mesh( geometry, material );

    mesh.position.set(positionStart.x, 0 , positionStart.z);
    mesh.position.add(Directions.Down.clone().multiplyScalar(geometry.parameters.height / 2));

    return {
        mesh: mesh
    };
}
const createCylinder = (material: Material, positionStart: THREE.Vector3, quaternion: THREE.Quaternion | Vector3, cylinderSize: CylinderSize | CylinderSizeCenter, height?: number) => {
    if( !height )
    {
        height = 0.1 *  (cylinderSize as CylinderSize).height[0] / 2;
    }

    const geometry = new THREE.CylinderGeometry( 0.1 * cylinderSize.radiusTop / 2, 0.1 * cylinderSize.radiusBottom / 2, height, cylinderSize.radialSegments ); //to mm
    const mesh = new THREE.Mesh( geometry, material );

    if(quaternion instanceof THREE.Quaternion)
    {
        mesh.rotation.setFromQuaternion(quaternion);
    }
    else
    {
        mesh.rotation.setFromVector3(quaternion);
    }

    mesh.position.set(positionStart.x, positionStart.y, positionStart.z);

    const dir = new Vector3();
    mesh.getWorldDirection(dir);

    /*
        DrawDirLine(positionStart,dir)
     */

    const trueDir = dir.clone();
    const positionEnd = mesh.position.clone().add(dir.clone().multiplyScalar(geometry.parameters.height));
    mesh.position.add(dir.multiplyScalar(geometry.parameters.height / 2));
    mesh.rotateX(-Math.PI / 2);

    return {
        mesh: mesh,
        end: positionEnd,
        trueDir: trueDir
    };
}
const createContactSphere = (material: Material, positionStart: THREE.Vector3, dir: Vector3 | null,  contact: SupportDescriptionContactSphere) => {
    const geometry = new THREE.SphereGeometry( 0.1 * contact.radius / 2, contact.segments, contact.segments ); //to mm
    const mesh = new THREE.Mesh( geometry, material );

    mesh.position.set(positionStart.x, positionStart.y, positionStart.z);

    if(dir && contact.deepening)
    {
        mesh.rotation.setFromVector3(dir);
        mesh.position.add(dir.clone().multiplyScalar(-0.1 * contact.deepening / 2));
    }

    return {
        mesh: mesh
    };
}