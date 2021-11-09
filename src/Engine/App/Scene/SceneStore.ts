import * as THREE from "three";
import {SceneObject} from "./SceneObject";
import {ISceneMaterial, SceneMaterials, Settings} from "../../Globals";
import {TransformControls} from "three/examples/jsm/controls/TransformControls";
import {TransformInstrumentEnum} from "./SceneTransform";
import {action, autorun, makeAutoObservable} from "mobx";
import {Vector3} from "three";

export interface ISceneStore {
    needUpdateFrame:boolean,

    scene: THREE.Scene;
    objects:SceneObject[];

    gridSize: Vector3;

    materialForPlane: THREE.Material;
    materialForObjects: ISceneMaterial;

    transformInstrument?: TransformControls;
    transformInstrumentState: TransformInstrumentEnum;
    transformObjectGroupOld: THREE.Object3D;
    transformObjectGroup: THREE.Object3D;

    groupSelected: Array<SceneObject>;
}

export const sceneStoreCreate = () => {
    sceneStore = makeAutoObservable({
        needUpdateFrame: false,
        scene:new THREE.Scene(),
        objects:[],
        materialForPlane: new THREE.MeshBasicMaterial( {color: Settings().scene.workingPlaneColor, side: THREE.FrontSide, opacity: 0.6, transparent: true} ),
        materialForObjects: SceneMaterials.default,
        transformInstrumentState: TransformInstrumentEnum.None,
        groupSelected: new Array<SceneObject>(),
        transformObjectGroup: new THREE.Object3D(),
        transformObjectGroupOld: new THREE.Object3D(),
        gridSize: new Vector3(1,1,1)
    } as ISceneStore);
}

export let sceneStore: ISceneStore;

export const sceneStoreUpdateFrame = action(()=>{
    sceneStore.needUpdateFrame = true;
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

    sceneStoreUpdateTransformControls();

    sceneStoreUpdateFrame();
});

export const sceneStoreUpdateTransformControls = () => {
    let isWorkingInstrument = sceneStore.transformInstrumentState !== TransformInstrumentEnum.None;

    if(isWorkingInstrument && sceneStore.groupSelected.length > 1)
    {
        sceneStore.transformObjectGroupOld = sceneStore.transformObjectGroup.clone();
        sceneStore.transformInstrument?.attach(sceneStore.transformObjectGroup);
    }
    else if(isWorkingInstrument && sceneStore.groupSelected.length === 1)
    {
        sceneStore.transformObjectGroupOld = sceneStore.groupSelected[0].mesh.clone();
        sceneStore.transformInstrument?.attach(sceneStore.groupSelected[0].mesh);
    }
    else {
        sceneStore.transformInstrument?.detach();
    }
}

export const sceneStoreGetTransformObj = () : THREE.Object3D | null => {
    if(sceneStore.groupSelected.length > 1)
    {
        return (sceneStore.transformObjectGroup);
    }
    else if(sceneStore.groupSelected.length === 1)
    {
        return (sceneStore.groupSelected[0].mesh);
    }
    else {
        return null;
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
    if (sceneStore.groupSelected.length === 1) {
        if (Settings().scene.transformAlignToPlane) {
            sceneStore.groupSelected[0].AlignToPlaneY();
        }
    } else {
        for (let sceneObject of sceneStore.objects) {
            if (Settings().scene.transformAlignToPlane) {
                sceneObject.AlignToPlaneY();
            }
        }
    }

    sceneStoreUpdateFrame();
}

export const sceneStoreSelectObjsAlignXZ = () => {
    if (sceneStore.groupSelected.length === 1) {
        if (Settings().scene.transformAlignToPlane) {
            sceneStore.groupSelected[0].AlignToPlaneXZ(sceneStore.gridSize);
        }
    } else {
        for (let sceneObject of sceneStore.objects) {
            if (Settings().scene.transformAlignToPlane) {
                sceneObject.AlignToPlaneXZ(sceneStore.gridSize);
            }
        }
    }
    
    sceneStoreUpdateFrame();
}

autorun(()=>{
    sceneStore.scene.add(sceneStore.transformObjectGroup);
})
