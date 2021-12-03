import React, {Component} from "react";
import 'semantic-ui-css/semantic.min.css'

import * as THREE from 'three'
import {BufferGeometry, PerspectiveCamera, Raycaster, Vector3} from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

import {Printer} from "../Configs/Printer";
import {dirname, path, storeMain, url} from "../../Bridge";
import {Log, Settings} from "../../Globals";
import {SceneObject} from "./Entities/SceneObject";
import ContainerPrinterConfigurator from "../PrinterConfigurators/ContainerPrinterConfigurator";
import {OutlineEffect} from "three/examples/jsm/effects/OutlineEffect";
import {Key} from "ts-keycode-enum";
import {TransformControls} from "three/examples/jsm/controls/TransformControls";
import {TransformInstrumentEnum} from "./ChildrenUI/SceneTransformBar";
import {runInAction} from "mobx";
import {observer} from "mobx-react";
import {Dispatch, EventEnum} from "../Managers/Events";
import {
    sceneStore,
    SceneUtils
} from "./SceneStore";
import {MoveObject} from "../Managers/Entities/MoveObject";
import {addJob} from "../Managers/Workers";
import {Job, WorkerType} from "../Managers/Entities/Job";
import {DrawDirLine, SceneHelper} from "../Utils/Utils";
import {MeshBVH} from "three-mesh-bvh";
import Stats from "three/examples/jsm/libs/stats.module";
import {isKeyPressed} from "../Utils/Keys";
import DragAndDropModal from "./ChildrenUI/SceneDragAndDropModal";


@observer
export class SceneComponent extends Component<any, any> {
    mount: any;

    state: any = {
        isActiveDragnDrop: false
    }

    constructor(props) {
        super(props);

        SceneUtils.create({
            dragAndDropSetState: (state: boolean) => {
                this.setState({
                    isActiveDragnDrop: state
                });
            }
        });
    }

    componentDidMount() {
        sceneStore.ini.setupCanvas(this.mount);
    }

    componentWillUnmount() {
        this.mount.removeChild(sceneStore.renderer.domElement)
        sceneStore.ini.dispose();
    }

    render() {
        console.log(2)
        if(sceneStore.needUpdateFrame)
        {
            runInAction(()=>{
                sceneStore.needUpdateFrame = false;
            })

            sceneStore.ini.animate();
        }

        return (
            <div>
                <div ref={ref => (this.mount = ref)} style={{
                    position: "fixed"
                }} />

                {this.state.isActiveDragnDrop && <DragAndDropModal/>}

                {!sceneStore.printer && <ContainerPrinterConfigurator setupConfiguration={(config: Printer)=>{
                    storeMain.set('printer', config.name);

                    sceneStore.printerName = config.name;
                    sceneStore.printer = config;

                    Log("Configuration loaded!");

                    sceneStore.ini.updatePrinter();
                    sceneStore.ini.updateCameraLookPosition();
                    sceneStore.ini.animate();

                    this.setState({});
                }}/>}

                {this.props.children}
            </div>
        );
    }
}
