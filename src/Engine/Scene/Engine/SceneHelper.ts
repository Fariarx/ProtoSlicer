import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export type Grid = {
    obj: THREE.Object3D;
    mat: LineMaterial;
}

export function CreateGrid(size: THREE.Vector3, scene: THREE.Scene):THREE.Object3D {
    var positions: THREE.Vector3[] = [];

    let gridSizeX = size.x;
    let gridSizeY = size.y;
    let gridSizeZ = size.z;

    positions.push(0, 0, 0);

    for (let x = 1; x <= gridSizeX; x++) {
        for (let y = 1; y <= gridSizeY; y++) {
            positions.push(x, 0, 0);
            positions.push(x, 0, y);
            positions.push(0, 0, y);
            positions.push(0, 0, 0);
        }
    }

    positions.push(0, gridSizeZ, 0);
    positions.push(gridSizeX, gridSizeZ, 0);
    positions.push(gridSizeX, 0, 0);
    positions.push(gridSizeX, gridSizeZ, 0);
    positions.push(gridSizeX, gridSizeZ, gridSizeY);
    positions.push(gridSizeX, 0, gridSizeY);
    positions.push(gridSizeX, gridSizeZ, gridSizeY);
    positions.push(0, gridSizeZ, gridSizeY);
    positions.push(0, 0, gridSizeY);
    positions.push(0, gridSizeZ, gridSizeY);
    positions.push(0, gridSizeZ, 0);

    // Line2 ( LineGeometry, LineMaterial )

    var geometry = new LineGeometry();
    geometry.setPositions(positions);

    var matLine = new LineMaterial({
        color: "#424242",
        linewidth: 0.5
    });

    var line = new Line2(geometry, matLine);

    scene.add(line);

    return {
        obj: line,
        mat: matLine
    } as Grid;
}

export function CreateAxesHelper(scene: THREE.Scene):THREE.Object3D {
    var origin = new THREE.Vector3();
    var size = 3;

    var axesHelper = new THREE.Object3D();
    axesHelper.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, size, "#b80808"));
    axesHelper.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), origin, size, "#09b111"));
    axesHelper.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), origin, size, "#091ab1"));

    scene.add(axesHelper);

    return axesHelper;
}

export function FitCameraToObject( camera: THREE.PerspectiveCamera, object: THREE.Object3D, offset: number, controls: OrbitControls ) {
    const boundingBox = new THREE.Box3();
    boundingBox.setFromObject( object );

    var middle = new THREE.Vector3();
    var size = new THREE.Vector3();
    boundingBox.getSize(size);

    // figure out how to fit the box in the view:
    // 1. figure out horizontal FOV (on non-1.0 aspects)
    // 2. figure out distance from the object in X and Y planes
    // 3. select the max distance (to fit both sides in)
    //
    // The reason is as follows:
    //
    // Imagine a bounding box (BB) is centered at (0,0,0).
    // Camera has vertical FOV (camera.fov) and horizontal FOV
    // (camera.fov scaled by aspect, see fovh below)
    //
    // Therefore if you want to put the entire object into the field of view,
    // you have to compute the distance as: z/2 (half of Z size of the BB
    // protruding towards us) plus for both X and Y size of BB you have to
    // figure out the distance created by the appropriate FOV.
    //
    // The FOV is always a triangle:
    //
    //  (size/2)
    // +--------+
    // |       /
    // |      /
    // |     /
    // | F° /
    // |   /
    // |  /
    // | /
    // |/
    //
    // F° is half of respective FOV, so to compute the distance (the length
    // of the straight line) one has to: `size/2 / Math.tan(F)`.
    //
    // FTR, from https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
    // the camera.fov is the vertical FOV.

    const fov = camera.fov * ( Math.PI / 180 );
    const fovh = 2*Math.atan(Math.tan(fov/2) * camera.aspect);
    let dx = size.z / 2 + Math.abs( size.x / 2 / Math.tan( fovh / 2 ) );
    let dy = size.z / 2 + Math.abs( size.y / 2 / Math.tan( fov / 2 ) );
    let cameraZ = Math.max(dx, dy);

    // offset the camera, if desired (to avoid filling the whole canvas)
    if( offset !== undefined && offset !== 0 ) cameraZ *= offset;

    camera.position.set( 0, 0, cameraZ );

    // set the far plane of the camera so that it easily encompasses the whole object
    const minZ = boundingBox.min.z;
    const cameraToFarEdge = ( minZ < 0 ) ? -minZ + cameraZ : cameraZ - minZ;

    camera.far = cameraToFarEdge * 3;
    camera.updateProjectionMatrix();

    if ( controls !== undefined ) {
        // set camera to rotate around the center
        controls.target = new THREE.Vector3(0, 0, 0);

        // prevent camera from zooming out far enough to create far plane cutoff
        controls.maxDistance = cameraToFarEdge * 2;
    }
}
