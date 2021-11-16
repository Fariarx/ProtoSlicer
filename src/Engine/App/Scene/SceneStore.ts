import * as THREE from "three";
import {SceneObject} from "./SceneObject";
import {ISceneMaterial, SceneMaterials, Settings} from "../../Globals";
import {TransformControls} from "three/examples/jsm/controls/TransformControls";
import {TransformInstrumentEnum} from "./SceneTransform";
import {action, autorun, makeAutoObservable} from "mobx";
import {Euler, Vector3} from "three";

export class CSceneStore {
    needUpdateFrame: boolean = false;
    needUpdateTransformTool: boolean = false;

    scene: THREE.Scene = new THREE.Scene();
    decorations: THREE.Group = new THREE.Group();
    objects: SceneObject[] = [];

    gridSize: Vector3 = new Vector3(1, 1, 1);

    materialForPlane: THREE.Material = new THREE.MeshBasicMaterial({
        color: Settings().scene.workingPlaneColor,
        side: THREE.FrontSide,
        opacity: 0.6,
        transparent: true
    });
    materialForObjects: ISceneMaterial = SceneMaterials.default;

    transformInstrument?: TransformControls;
    transformInstrumentState: TransformInstrumentEnum = TransformInstrumentEnum.None;
    transformObjectGroupOld: THREE.Object3D = new THREE.Object3D();
    transformObjectGroup: THREE.Object3D = new THREE.Object3D();

    groupSelected: Array<SceneObject> = new Array<SceneObject>();

    constructor() {
        makeAutoObservable(this);

        this.scene.add(this.transformObjectGroup);
        this.scene.add(this.decorations);
    }

    get sceneStoreGetSelectObj() {
        if (sceneStore.groupSelected.length) {
            return (sceneStore.transformObjectGroup);
        } else {
            return null;
        }
    }
}

export const sceneStoreCreate = () => {
    sceneStore = new CSceneStore();
}

export let sceneStore: CSceneStore;

export const sceneStoreUpdateFrame = action(()=>{
    sceneStore.needUpdateFrame = true;
});
export const sceneStoreUpdateTransformTool = action(()=>{
    sceneStore.needUpdateTransformTool = true;
});


export const sceneStoreSelectionChanged = action(()=>{
    sceneStore.transformInstrument?.detach();

    sceneStore.groupSelected = [];

    for(let object of sceneStore.objects)
    {
        if(object.isSelected)
        {
            sceneStore.groupSelected.push(object);
        }

        object.Update();
    }

    if( sceneStore.groupSelected.length) {
        let centerGroup = SceneObject.CalculateGroupCenter(sceneStore.groupSelected);

        sceneStore.transformObjectGroup.position.set(centerGroup.x, 0 , centerGroup.z);
        sceneStore.transformObjectGroupOld.position.set(centerGroup.x, 0 , centerGroup.z);
    }

    sceneStoreUpdateTransformControls();

    sceneStoreUpdateFrame();
});

export const sceneStoreUpdateTransformControls = () => {
    let isWorkingInstrument = sceneStore.transformInstrumentState !== TransformInstrumentEnum.None;

    if(isWorkingInstrument && sceneStore.groupSelected.length)
    {
        sceneStore.transformInstrument?.attach(sceneStore.transformObjectGroup);
    }
    else {
        sceneStore.transformInstrument?.detach();
    }
}

export const sceneStoreInstrumentStateChanged = action((state: TransformInstrumentEnum = TransformInstrumentEnum.None)=>{
    sceneStore.transformInstrumentState = state;

    if(state !== TransformInstrumentEnum.None)
    {
        sceneStore.transformInstrument?.setMode(state);

        sceneStoreUpdateTransformControls();
    }
    else {
        sceneStore.transformInstrument?.detach();
    }

    sceneStoreUpdateFrame();
})

export const sceneStoreSelectObjsAlignY = () => {
    if (sceneStore.groupSelected.length ) {
            for (let sceneObject of sceneStore.groupSelected) {
                sceneObject.AlignToPlaneY();
            }
        }

        sceneStoreUpdateFrame();
}

export const sceneStoreSelectObjsResetRotation = () => {
    if(sceneStore.groupSelected.length ) {
        for (let sceneObject of sceneStore.groupSelected) {
                sceneObject.mesh.rotation.set(0,0,0);
        }
    }

    sceneStoreUpdateFrame();
    sceneStoreUpdateTransformTool();
}

export const sceneStoreSelectObjsResetScale = () => {
    if (sceneStore.groupSelected.length) {
        for (let sceneObject of sceneStore.groupSelected) {
            sceneObject.mesh.scale.set(0.1, 0.1, 0.1);
            sceneObject.Update();
        }
    }

    sceneStoreUpdateFrame();
    sceneStoreUpdateTransformTool();
}

export const sceneStoreSelectObjsAlignXZ = () => {
    if(sceneStore.groupSelected.length ) {
        for (let sceneObject of sceneStore.groupSelected) {
                sceneObject.AlignToPlaneXZ(sceneStore.gridSize);
        }
    }

    sceneStoreUpdateFrame();
}
