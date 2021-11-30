import * as THREE from "three";
import {Euler, Vector3} from "three";
import {SceneObject} from "./SceneObject";
import {ISceneMaterial, SceneMaterials, Settings} from "../../Globals";
import {TransformControls} from "three/examples/jsm/controls/TransformControls";
import {TransformInstrumentEnum} from "./SceneTransformBar";
import {action, makeAutoObservable} from "mobx";
import {Dispatch, EventEnum  } from "../Managers/Events";
import {LinearGenerator} from "../Utils/Utils";
import {MoveObject} from "../Managers/Entities/MoveObject";
import {Printer} from "../Configs/Printer";

export class CSceneStore {
    needUpdateFrame: boolean = false;
    needUpdateTransformTool: boolean = false;
    needUpdateSelectTool: boolean = false;

    perspectiveCamera = new THREE.PerspectiveCamera(
        40,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    orthographicCamera = new THREE.OrthographicCamera(
        window.innerWidth / - 2,
        window.innerWidth / 2,
        window.innerHeight / 2,
        window.innerHeight / - 2,
        0.1,
        1000,
    );
    activeCamera: THREE.OrthographicCamera | THREE.PerspectiveCamera = this.perspectiveCamera;
    switchCameraType: Function = (isPerspective: boolean | undefined, isIni: boolean = false) => {};

    scene: THREE.Scene = new THREE.Scene();
    decorations: THREE.Group = new THREE.Group();
    objects: SceneObject[] = [];

    gridSize: Vector3 = new Vector3(1, 1, 1);

    printer?: Printer;

    materialForPlane: THREE.Material = new THREE.MeshBasicMaterial({
        color: Settings().scene.workingPlaneColor,
        side: THREE.FrontSide,
        transparent: true
    });
    materialForPlaneLimit: THREE.Material = new THREE.MeshBasicMaterial({
        color: Settings().scene.workingPlaneLimitColor,
        side: THREE.DoubleSide,
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

        this.orthographicCamera.zoom = 100;
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


export const sceneStoreSelectionChanged = action((updateSelectPanel: boolean = false)=>{
    sceneStore.transformInstrument?.detach();

    sceneStore.groupSelected = [];

    for(let object of sceneStore.objects)
    {
        if(object.isSelected)
        {
            sceneStore.groupSelected.push(object);
        }

        object.SetSelection();
    }

    if( sceneStore.groupSelected.length) {
        let centerGroup = SceneObject.CalculateGroupCenter(sceneStore.groupSelected);

        sceneStore.transformObjectGroup.position.set(centerGroup.x, 0 , centerGroup.z);
        sceneStore.transformObjectGroupOld.position.set(centerGroup.x, 0 , centerGroup.z);
    }

    sceneStoreUpdateTransformControls();

    if(updateSelectPanel)
    {
        sceneStore.needUpdateSelectTool = true;
    }

    sceneStoreUpdateFrame();
});

export const sceneStoreUpdateTransformControls = () => {
    let isWorkingInstrument = sceneStore.transformInstrumentState !== TransformInstrumentEnum.None;

    sceneStore.transformObjectGroup.position.setX(sceneStore.gridSize.x / 2).setZ(sceneStore.gridSize.z / 2).setY(0);
    sceneStore.transformObjectGroupOld.position.setX(sceneStore.gridSize.x / 2).setZ(sceneStore.gridSize.z / 2).setY(0);
    sceneStore.transformObjectGroup.rotation.set(0,0,0);
    sceneStore.transformObjectGroupOld.rotation.set(0,0,0);

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
    let id = LinearGenerator();

    if(sceneStore.groupSelected.length ) {
        for (let sceneObject of sceneStore.groupSelected) {
            Dispatch(EventEnum.TRANSFORM_OBJECT, {
                from: sceneObject.mesh.rotation.clone(),
                to: new Euler(0,0,0),
                sceneObject: sceneObject,
                instrument: TransformInstrumentEnum.Rotate,
                id:id
            } as MoveObject)
        }
    }

    Dispatch(EventEnum.TRANSFORM_OBJECT, {
        from: sceneStore.transformObjectGroup.rotation.clone(),
        to: new Euler(0,0,0),
        sceneObject: sceneStore.transformObjectGroup,
        instrument: TransformInstrumentEnum.Rotate,
        id:id
    } as MoveObject)

    sceneStoreUpdateFrame();
    sceneStoreUpdateTransformTool();
}

export const sceneStoreSelectObjsResetScale = () => {
    let id = LinearGenerator();

    if (sceneStore.groupSelected.length) {
        for (let sceneObject of sceneStore.groupSelected) {
            Dispatch(EventEnum.TRANSFORM_OBJECT, {
                from: sceneObject.mesh.scale.clone(),
                to: new Vector3(0.1,0.1,0.1),
                sceneObject: sceneObject,
                instrument: TransformInstrumentEnum.Scale,
                id:id
            } as MoveObject)

            sceneObject.Update();
        }
    }

    Dispatch(EventEnum.TRANSFORM_OBJECT, {
        from: sceneStore.transformObjectGroup.scale.clone(),
        to: new Vector3(1,1,1),
        sceneObject: sceneStore.transformObjectGroup,
        instrument: TransformInstrumentEnum.Scale,
        id:id
    } as MoveObject)

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
