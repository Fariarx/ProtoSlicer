import * as THREE from "three";
import {Euler, Vector3} from "three";
import {SceneObject} from "./Entities/SceneObject";
import {ISceneMaterial, SceneMaterials, Settings} from "../../Globals";
import {TransformInstrumentEnum} from "./ChildrenUI/SceneTransformBar";
import {action, makeAutoObservable} from "mobx";
import {AppEvents , EventEnum} from "../Managers/Events";
import {LinearGenerator, SceneHelper} from "../Utils/Utils";
import {MoveObject} from "../Managers/Entities/MoveObject";
import {Printer} from "../Configs/Printer";
import {OutlineEffect} from "three/examples/jsm/effects/OutlineEffect";
import {storeMain} from "../../Bridge";
import {SceneInitialization} from "./SceneInitialization";
import {AddingSupportsMode} from "./ChildrenUI/ContainerRight/AddingSupports";

export class CSceneStore {
    needUpdateFrame: boolean = false;
    needUpdateTransformTool: boolean = false;
    needUpdateSelectTool: boolean = false;

    renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha:true,
    });
    outlineEffectRenderer: OutlineEffect = new OutlineEffect( this.renderer, {
        defaultThickness:0.001
    });

    perspectiveCamera = new THREE.PerspectiveCamera(
        40,
        window.innerWidth / window.innerHeight,
        0.01,
        1000
    );
    orthographicCamera = new THREE.OrthographicCamera(
        window.innerWidth / - 2,
        window.innerWidth / 2,
        window.innerHeight / 2,
        window.innerHeight / - 2,
        0.01,
        1000,
    );
    activeCamera: THREE.OrthographicCamera | THREE.PerspectiveCamera = this.perspectiveCamera;

    ini: SceneInitialization;
    scene: THREE.Scene = new THREE.Scene();
    decorations: THREE.Group = new THREE.Group();
    objects: SceneObject[] = [];

    grid?: SceneHelper.Grid;
    gridSize: Vector3 = new Vector3(1, 1, 1);

    printerName: string = storeMain.get('printer');
    printer?: Printer;

    materialForPlaneShadow: THREE.Material = new THREE.ShadowMaterial({
        color: '#444444',
        side: THREE.FrontSide,
    });
    materialForPlane: THREE.Material = new THREE.MeshBasicMaterial({
        color: Settings().scene.workingPlaneColor,
        side: THREE.FrontSide
    });
    materialForPlaneLimit: THREE.Material = new THREE.MeshBasicMaterial({
        color: Settings().scene.workingPlaneLimitColor,
        side: THREE.FrontSide
    });
    materialForObjects: ISceneMaterial = SceneMaterials.default;

    supportsInstrumentState: AddingSupportsMode = AddingSupportsMode.none;

    transformInstrumentState: TransformInstrumentEnum = TransformInstrumentEnum.None;
    transformObjectGroupOld: THREE.Object3D = new THREE.Object3D();
    transformObjectGroup: THREE.Object3D = new THREE.Object3D();

    groupSelected: Array<SceneObject> = new Array<SceneObject>();

    constructor(_props: any) {
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio( window.devicePixelRatio );

        this.renderer.setClearColor(0x000000, 0);
        this.renderer.domElement.style.background =  'linear-gradient(to bottom,  '+Settings().ui.colorBackgroundScene+' 0%,'+ Settings().ui.colorBackgroundSceneBottom +' 100%)'

        this.scene.add(this.transformObjectGroup);
        this.scene.add(this.decorations);

        this.orthographicCamera.zoom = 70;

        this.ini = new SceneInitialization(this, _props );

        makeAutoObservable(this);
    }
}

export let sceneStore: CSceneStore;

export namespace SceneUtils {
    export const create = (props) => {
        sceneStore = new CSceneStore(props);
    }
    export const updateFrame = action(()=>{
        sceneStore.needUpdateFrame = true;
    });
    export const updateTransformTool = action(()=>{
        sceneStore.needUpdateTransformTool = true;
    });
    export const selectionChanged = action((updateSelectPanel: boolean = false)=> {
        sceneStore.ini.transformControls.detach();

        sceneStore.groupSelected = [];

        let changes: {
            uuid: string,
            state: {
                now:boolean
                was?:boolean
            }
        }[] = [];

        for (let object of sceneStore.objects) {
            if (object.isSelected) {
                sceneStore.groupSelected.push(object);
            }

            let state = object.SetSelection();

            changes.push({
                uuid:object.mesh.uuid,
                state: state
            })
        }

        if (sceneStore.groupSelected.length) {
            let centerGroup = SceneObject.CalculateGroupCenter(sceneStore.groupSelected);

            sceneStore.transformObjectGroup.position.set(centerGroup.x, 0, centerGroup.z);
            sceneStore.transformObjectGroupOld.position.set(centerGroup.x, 0, centerGroup.z);
        }

        updateTransformControls();

        if (updateSelectPanel) {
            sceneStore.needUpdateSelectTool = true;
        }

        AppEvents.Dispatch(EventEnum.SELECTION_CHANGED, changes);

        updateFrame();
    });
    export const updateTransformControls = action(() => {
        let isWorkingInstrument = sceneStore.transformInstrumentState !== TransformInstrumentEnum.None;

        sceneStore.transformObjectGroup.position.setX(sceneStore.gridSize.x / 2).setZ(sceneStore.gridSize.z / 2).setY(0);
        sceneStore.transformObjectGroupOld.position.setX(sceneStore.gridSize.x / 2).setZ(sceneStore.gridSize.z / 2).setY(0);
        sceneStore.transformObjectGroup.rotation.set(0,0,0);
        sceneStore.transformObjectGroupOld.rotation.set(0,0,0);

        if(isWorkingInstrument && sceneStore.groupSelected.length)
        {
            sceneStore.ini.transformControls.attach(sceneStore.transformObjectGroup);
        }
        else {
            sceneStore.ini.transformControls.detach();
        }
    })
    export const instrumentStateChanged = action((state: TransformInstrumentEnum = TransformInstrumentEnum.None)=>{
        sceneStore.transformInstrumentState = state;

        if(state !== TransformInstrumentEnum.None)
        {
            sceneStore.ini.transformControls.setMode(state);

            updateTransformControls();
        }
        else {
            sceneStore.ini.transformControls.detach();
        }

        updateFrame();
    })
    export const supportsInstrumentStateChanged = action((state: AddingSupportsMode = AddingSupportsMode.none)=> {
        sceneStore.supportsInstrumentState = state;

        switch (state)
        {
            case AddingSupportsMode.addSupports:
                for (let obj of sceneStore.objects)
                {
                    obj.mesh.geometry.normalizeNormals();
                    obj.mesh.geometry.computeVertexNormals();
                    obj.Update();
                }

                sceneStore.ini.isWorkingAddSupports = true;
                break;
            default:
                sceneStore.ini.isWorkingAddSupports = false;
                break;
        }

        updateFrame();
    })
    export const selectObjsAlignY = () => {
        if (sceneStore.groupSelected.length ) {
            for (let sceneObject of sceneStore.groupSelected) {
                sceneObject.AlignToPlaneY();
            }
        }

        updateFrame();
    }
    export const selectObjsResetRotation = () => {
        let id = LinearGenerator();

        if(sceneStore.groupSelected.length ) {
            for (let sceneObject of sceneStore.groupSelected) {
                AppEvents.Dispatch(EventEnum.TRANSFORM_OBJECT, {
                    from: sceneObject.mesh.rotation.clone(),
                    to: new Euler(0,0,0),
                    sceneObject: sceneObject,
                    instrument: TransformInstrumentEnum.Rotate,
                    id:id
                } as MoveObject)
            }
        }

        AppEvents.Dispatch(EventEnum.TRANSFORM_OBJECT, {
            from: sceneStore.transformObjectGroup.rotation.clone(),
            to: new Euler(0,0,0),
            sceneObject: sceneStore.transformObjectGroup,
            instrument: TransformInstrumentEnum.Rotate,
            id:id
        } as MoveObject)

        updateFrame();
        updateTransformTool();
    }
    export const selectObjsResetScale = () => {
        let id = LinearGenerator();

        if (sceneStore.groupSelected.length) {
            for (let sceneObject of sceneStore.groupSelected) {
                AppEvents.Dispatch(EventEnum.TRANSFORM_OBJECT, {
                    from: sceneObject.mesh.scale.clone(),
                    to: new Vector3(0.1,0.1,0.1),
                    sceneObject: sceneObject,
                    instrument: TransformInstrumentEnum.Scale,
                    id:id
                } as MoveObject)

                sceneObject.Update();
            }
        }

        AppEvents.Dispatch(EventEnum.TRANSFORM_OBJECT, {
            from: sceneStore.transformObjectGroup.scale.clone(),
            to: new Vector3(1,1,1),
            sceneObject: sceneStore.transformObjectGroup,
            instrument: TransformInstrumentEnum.Scale,
            id:id
        } as MoveObject)

        updateFrame();
        updateTransformTool();
    }
    export const selectObjsAlignXZ = () => {
        if(sceneStore.groupSelected.length ) {
            for (let sceneObject of sceneStore.groupSelected) {
                sceneObject.AlignToPlaneXZ(sceneStore.gridSize);
            }
        }

        updateFrame();
    }
}