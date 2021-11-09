import * as THREE from "three";
import {Box3, Vector3} from "three";
import {sceneStore} from "./SceneStore";

export class SceneObject {
    name: string;
    mesh: THREE.Mesh;
    bbox: THREE.BoxHelper;

    min: Vector3;
    max: Vector3;
    center: Vector3;

    isSelected: boolean;
    private wasSelected: boolean;

    constructor(geometry: THREE.BufferGeometry, _name: string, objs: SceneObject[], selected: boolean = false) {
        if(SceneObject.GetByName(objs, _name) === null)
        {
            this.name = _name;
        }
        else {
            let index = 0;
            let newName = index + '-' + _name;

            while (SceneObject.GetByName(objs, newName) !== null)
            {
                index++;
                newName = index + '-' + _name;
            }

            this.name = newName;
        }

        this.mesh = new THREE.Mesh( geometry, sceneStore.materialForObjects.normal );
        this.bbox = new THREE.BoxHelper( this.mesh, 0xffff00 );

        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.scale.set(0.1, 0.1, 0.1);

        let nullVector = new Vector3();

        this.min = nullVector;
        this.max = nullVector;
        this.center = nullVector;

        this.Update();
        this.UpdateGeometryCenter();

        this.isSelected = selected;
        this.wasSelected = selected;
        this.SetSelection();
    }

    private SetSelection() {
        if(this.isSelected)
        {
            this.mesh.material = sceneStore.materialForObjects.select
        }
        else
        {
            this.mesh.material = sceneStore.materialForObjects.normal
        }
    }
    Update() {
        if(this.wasSelected !== this.isSelected)
        {
            this.SetSelection();
            this.wasSelected = this.isSelected;
        }

        this.mesh.updateMatrixWorld();
        this.bbox.update();

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
        return _mesh === this.mesh;
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
    static UpdateObjs(objs: SceneObject[]) {
        objs.every(function(element, index) {
            element.Update();
        });
    }
    static GetMeshesFromObjs(objs: SceneObject[]) : THREE.Mesh[] {
        let arr: THREE.Mesh[] = objs.map(function(element, index) {
            return element.mesh;
        });

        return arr;
    }
    static GetByName(objs: SceneObject[], name:string) : SceneObject | null
    {
        let _element: SceneObject | null = null;

        objs.every(function(element, index) {
            if(element.name === name)
            {
                _element = element;
                return false;
            }

            return true;
        })

        return _element;
    }
}
