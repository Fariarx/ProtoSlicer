import * as THREE from 'three'
import {sceneStore} from "../Scene/SceneStore";
import {SupportDescription} from "../Scene/Entities/Supports/SupprotStruct/Body/SupportDescription";
import {
    CylinderSize, CylinderSizeCenter,
    SupportDescriptionCylinder
} from "../Scene/Entities/Supports/SupprotStruct/Body/SupportDescriptionCylinder";
import {Float32BufferAttribute, Material, Object3D, Vector3} from "three";
import {DrawDirLine} from "./Utils";
import {Directions, Log} from "../../Globals";
import {SupportDescriptionContact} from "../Scene/Entities/Supports/SupprotStruct/Contact/SupportDescriptionContact";
import {SupportDescriptionContactSphere} from "../Scene/Entities/Supports/SupprotStruct/Contact/SupportDescriptionContactSphere";
import {degToRad, radToDeg} from "three/src/math/MathUtils";
import {SupportSceneObject} from "../Scene/Entities/Supports/SupportSceneObject";

const temp: any = {};

export type GenerateSupportType = {
    positionStart: THREE.Vector3,
    quaternion: THREE.Quaternion,
    cylinder: SupportDescription | SupportDescriptionCylinder,
    meshes: THREE.Mesh[],
    isAuto?: boolean,
    isPreview?: boolean
}
export const generateSupport = (generate: GenerateSupportType) => {
    return generateSupportAlgorithm(generate.positionStart, generate.quaternion, generate.cylinder, generate.meshes, <boolean>generate.isAuto, <boolean>generate.isPreview);
}

const generateSupportAlgorithm = (positionStart: THREE.Vector3, quaternion: THREE.Quaternion, cylinder: SupportDescription | SupportDescriptionCylinder, meshes: THREE.Mesh[], isAuto: boolean, isPreview: boolean) => { //, cylinderCenter: CylinderSize, cylinderBottom: CylinderSize, substrate: SubstrateSizeBox
    if(cylinder instanceof SupportDescriptionCylinder)
    {
        // let date = Date.now();

        if(!temp.raysObj)
        {
            defineRaysObj(cylinder.sizeTop.diameterBottom);
        }

        let material = isPreview ? cylinder.materialPreview : cylinder.material;

        let calculated = calculateSupportRays(material, positionStart, quaternion, cylinder, meshes);
        if(!calculated)
        {
            return false;
        }


        let topCylinder = calculated.topCylinder;

        let topContact = createContactSphere(material, positionStart, topCylinder.trueDir, cylinder.contactWithModel as SupportDescriptionContactSphere);
        let centerContact = createContactSphere(material, topCylinder.end, null, cylinder.contact as SupportDescriptionContactSphere);
        let centerCylinder = createCylinder(material, topCylinder.end, Directions.Down, cylinder.sizeCenter, Math.abs( topCylinder.end.y ));
        let botCylinder = createCylinderBottom(material, centerCylinder.end, cylinder.sizeBottom);

        {
            const angleBetweenPlane = radToDeg(topCylinder.trueDir.angleTo(centerCylinder.trueDir));

            if(angleBetweenPlane > 90)
            {
                Log("Error generate support with ("+ angleBetweenPlane.toFixed(2) +") deg angle to plane", true);
                return false;
            }
            if(isAuto && angleBetweenPlane > cylinder.maximumAngle)
            {
                Log("Error generate support with ("+ angleBetweenPlane.toFixed(2) +") deg angle to plane. Maximum: " + cylinder.maximumAngle, true);
                return false;
            }
        }

        let support = new THREE.Group();

        support.add(topContact.mesh);
        support.add(topCylinder.mesh);
        support.add(centerCylinder.mesh);
        support.add(centerContact.mesh);
        support.add(botCylinder.mesh);

        //console.log(Date.now() - date)

        return new SupportSceneObject(support);
    }

    return false;
};

const calculateIntersects = (positionStart: Vector3, quaternion: THREE.Quaternion | Vector3, meshes: THREE.Mesh[]) => {
    let raysObj = temp.raysObj;

    raysObj.position.set(positionStart.x,positionStart.y, positionStart.z );

    if(quaternion instanceof THREE.Quaternion)
    {
        raysObj.rotation.setFromQuaternion(quaternion);
    }
    else
    {
        raysObj.rotation.setFromVector3(quaternion);
    }

    let raycaster = new THREE.Raycaster();
    let intersects: THREE.Intersection[] = [];

    for(let obj of temp.raysArr)
    {
        let dir = new Vector3();
        let pos = new Vector3();

        obj.getWorldDirection(dir);
        obj.getWorldPosition(pos);

        raycaster.ray.direction = dir;
        raycaster.ray.origin = pos;

        let arr = raycaster.intersectObjects(meshes);

        if(arr.length) {
            intersects = [...intersects, ...arr];
        }

        //for debug
        //DrawDirLine(pos, dir)
    }

    intersects.sort((a, b) => {
        return a.distance < b.distance ? -1 : 1;
    });

    return intersects;
}
const calculateSupportRays = (material: Material, positionStart: Vector3 , quaternion: THREE.Quaternion, cylinder:  SupportDescriptionCylinder, meshes: THREE.Mesh[]) : null | any => {
    //for top cylinder
    let intersects = calculateIntersects(positionStart, quaternion, meshes);

    let maximumDistance = toUnits(cylinder.sizeTop.height[1]);

    if(intersects.length )
    {
        //need ignore intersect from start point
        for (let index = 0, distance; intersects[index]; index++)
        {
            distance = intersects[index].distance;

            if(distance > 0.0001)
            {
                maximumDistance = distance;
                break;
            }
        }
    }

    let minimumDistance = toUnits(cylinder.sizeTop.height[0]);


    if(minimumDistance > maximumDistance)
    {
        return null;
    }

    //check distance to plane
    const distanceStep = .05;

    let topCylinder;
    let hasTouchingToPlate = false;

    while (!hasTouchingToPlate && minimumDistance < maximumDistance)
    {
        topCylinder = createCylinder(material, positionStart, quaternion, {
            diameterTop : cylinder.sizeTop.diameterTop,
            diameterBottom : cylinder.sizeTop.diameterBottom,
            height: [ toMM(minimumDistance) , 0 ],
            radialSegments : cylinder.sizeTop.radialSegments
        } as CylinderSize);

        intersects = calculateIntersects( topCylinder.end, Directions.Down, meshes);

        if(intersects.length === 9)
        {
            hasTouchingToPlate = true;
            break;
        }

        minimumDistance += distanceStep;
    }

    if(!hasTouchingToPlate)
    {
        return null;
    }

    return {
        minimumDistance: minimumDistance,
        topCylinder: topCylinder
    };
}
const defineRaysObj = (size_mm) => {
    let rayDirections: Object3D[] = [];
    let group = new THREE.Group();

    const geometry = new THREE.CircleGeometry( toUnits( size_mm ), 7 );

    let buffer: Float32BufferAttribute = <Float32BufferAttribute>geometry.attributes.position;
    let array: Float32Array = <Float32Array>buffer.array;

    for(let i = 0; i < array.length; i += 3)
    {
        let obj = new THREE.Object3D();
        obj.position.set(array[i], array[i+1], array[i+2]);
        rayDirections.push(obj);
        group.add(obj);
    }

    /*for(let obj of rayDirections)
    {
        let dir = new Vector3();
        obj.getWorldDirection(dir);
         DrawDirLine(obj.position,dir)
    }*/

    temp.raysArr = rayDirections;
    temp.raysObj = group;
}

const createCylinderBottom = (material: Material, positionStart: THREE.Vector3, cylinderSize: CylinderSize ) => {
    const geometry = new THREE.CylinderGeometry( toUnits(cylinderSize.diameterTop ), toUnits(cylinderSize.diameterBottom), toUnits(cylinderSize.height[0]), cylinderSize.radialSegments ); //to mm
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
        height = toUnits((cylinderSize as CylinderSize).height[0] );
    }

    const geometry = new THREE.CylinderGeometry( toUnits(cylinderSize.diameterTop ), toUnits(cylinderSize.diameterBottom), height, cylinderSize.radialSegments ); //to mm
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
    const geometry = new THREE.SphereGeometry( toUnits(contact.diameter), contact.segments, contact.segments ); //to mm
    const mesh = new THREE.Mesh( geometry, material );

    mesh.position.set(positionStart.x, positionStart.y, positionStart.z);

    if(dir && contact.deepening)
    {
        mesh.rotation.setFromVector3(dir);
        mesh.position.add(dir.clone().multiplyScalar(-toUnits(contact.deepening)));
    }

    return {
        mesh: mesh
    };
}

const toUnits = (mm) =>  mm / 10;
const toMM = (units) => units * 10;