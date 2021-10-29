import * as THREE from "three";
import {Box3, Vector3} from "three";

export class SceneObject {
    mesh: THREE.Mesh;
    bbox: THREE.BoxHelper;

    min: Vector3;
    max: Vector3;
    center: Vector3;

    constructor(_mesh: THREE.Mesh) {
        this.mesh = _mesh;
        this.bbox = new THREE.BoxHelper( _mesh, 0xffff00 );

        let nullVector = new Vector3();

        this.min = nullVector;
        this.max = nullVector;
        this.center = nullVector;

        this.Update();
        this.UpdateGeometryCenter();
    }

    Update() {
        this.bbox.update(this.mesh);

        this.mesh.geometry.computeBoundingBox();
        this.mesh.geometry.computeBoundingSphere();

        this.min = (this.mesh.geometry.boundingBox as Box3).min;
        this.max = (this.mesh.geometry.boundingBox as Box3).max;
        this.center = (this.mesh.geometry.boundingSphere as THREE.Sphere).center;
    }

    UpdateGeometryCenter() {
        this.mesh.geometry.applyMatrix4( new THREE.Matrix4().makeTranslation(   -this.center.x, -this.center.y, -this.center.z));
        this.Update();
    }

    AddToScene(scene: THREE.Scene, withBoxHelper?: boolean) {
        if(withBoxHelper) {
            scene.add( this.bbox );
        }

        scene.add( this.mesh );
    }

    AlignToPlaneY() {
        this.mesh.position.y = this.mesh.localToWorld(this.center).y - this.mesh.localToWorld(this.min).y;
    }

    AlignToPlaneXZ(gridVec: Vector3) {
        this.mesh.position.x = gridVec.x / 2;
        this.mesh.position.z = gridVec.z / 2;
    }

    IsEqual3dObject(_mesh: THREE.Mesh) {
        return _mesh == this.mesh;
    }

    static SearchObject(objs: SceneObject[], _mesh: THREE.Mesh)
    {
        let _index = -1;

        objs.every(function(element, index) {
            if(element.mesh === _mesh)
            {
                _index = index;
                return false;
            }

            return true;
        })

        return _index;
    }
}
