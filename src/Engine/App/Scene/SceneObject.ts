import * as THREE from "three";
import {Box3, BufferGeometry, Vector3} from "three";
import {sceneStore} from "./SceneStore";
import {Dispatch, EventEnum  } from "../Managers/Events";
import {TransformInstrumentEnum} from "./SceneTransform";
import {MoveObject} from "../Managers/Entities/MoveObject";
import {Geometry} from "three/examples/jsm/deprecated/Geometry";
import {CENTER, MeshBVH, SAH, SplitStrategy} from "three-mesh-bvh";

export class SceneObject {
    name: string;
    mesh: THREE.Mesh;
    bbox: THREE.BoxHelper;

    min: Vector3;
    max: Vector3;
    center: Vector3;
    size: Vector3 = new Vector3();
    scaleFactor: number;

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

        this.scaleFactor = (0.1 / this.size.x + 0.1 / this.size.y + 0.1 / this.size.z) / 3;
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

        new THREE.Box3().setFromObject(this.mesh).getSize(this.size);

        this.mesh.updateMatrixWorld();
        this.bbox.update();

        this.mesh.geometry.computeBoundsTree();
        this.mesh.geometry.computeBoundingBox();
        this.mesh.geometry.computeBoundingSphere();

        this.min = (this.mesh.geometry.boundingBox as Box3).min;
        this.max = (this.mesh.geometry.boundingBox as Box3).max;
        this.center = (this.mesh.geometry.boundingSphere as THREE.Sphere).center;
    }
    UpdateSize() {
        new THREE.Box3().setFromObject(this.mesh).getSize(this.size);
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
        this.Update();

        Dispatch(EventEnum.TRANSFORM_OBJECT, {
            from: this.mesh.position.clone(),
            to: this.mesh.position.clone().setY(this.size.y / 2),
            sceneObject: this as SceneObject,
            instrument:TransformInstrumentEnum.Move
        } as MoveObject)
    }

    AlignToPlaneXZ(gridVec: Vector3) {
        this.Update();

        Dispatch(EventEnum.TRANSFORM_OBJECT, {
            from: this.mesh.position.clone(),
            to: this.mesh.position.clone().setX(gridVec.x / 2).setZ(gridVec.z / 2),
            sceneObject: this as SceneObject,
            instrument:TransformInstrumentEnum.Move
        } as MoveObject)
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
    static CalculateGroupMaxSize(objs: SceneObject[]) : Vector3
    {
        let deltaSize;

        objs.every(function(element, index) {
            let size = element.size;

            if(index === 0)
            {
                deltaSize = size.clone();
            }
            else {
                deltaSize.x = (deltaSize.x + size.x)/2;
                deltaSize.y = (deltaSize.y + size.y)/2;
                deltaSize.z = (deltaSize.z + size.z)/2;
            }
        })

        return deltaSize;
    }
    static CalculateGroupCenter(objs: SceneObject[]) : Vector3
    {
        let delta;

        objs.every(function(element, index) {
            let position = element.mesh.position;

            if(index === 0)
            {
                delta = position.clone();
            }
            else {
                delta.x = (delta.x + position.x)/2;
                delta.y = (delta.y + position.y)/2;
                delta.z = (delta.z + position.z)/2;
            }
        })

        return delta;
    }
    static CalculateGeometry(objs: SceneObject[]) : BufferGeometry
    {
        let geometry = objs[0].mesh.geometry.clone().applyMatrix4(objs[0].mesh.matrix);

        objs.forEach(function(element, index) {
            if(index !== 0) {
                geometry.merge(element.mesh.geometry.clone().applyMatrix4(objs[index].mesh.matrix));
            }
        })

        return geometry;
    }
}
