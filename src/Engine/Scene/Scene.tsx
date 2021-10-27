import React, {Component } from "react";
import ReactDOM from "react-dom";
import 'semantic-ui-css/semantic.min.css'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import {Printer, Config} from "../Configs/Printer";
import * as SceneHelper from "./SceneHelper";
import {Log, Materials} from "../Globals";
import {store} from "../Bridge";
import DragAndDropModal from "./SceneDragAndDropModal";
import {File3DLoad} from "./SceneHelper";
import {Box3, BufferGeometry, Vector3} from "three";
import {SceneObject} from "./SceneObject";
import SetupPrinter from "../UI/SetupPrinter";

export default this;

export class Scene extends Component<any, any> {
    mount: any;
    material: THREE.Material;
    renderer: THREE.WebGLRenderer;

    objects: SceneObject[];

    printerName: string;
    printerConfig?: Printer;

    constructor(props) {
        super(props);

        this.objects = [];
        this.material = Materials.def;
        this.printerName = store.get('printer');

        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
    }

    sceneCreate = () => {
        var thisObj = this;

        let gridVec = new THREE.Vector3(2, 2, 2);

        if(this.printerConfig)
        {
            gridVec.set(Math.ceil(this.printerConfig.workspace.sizeX * 0.1), this.printerConfig.workspace.height * 0.1, Math.ceil(this.printerConfig.workspace.sizeY * 0.1));
        }

        function setupDragDrop() {
            var holder = thisObj.renderer.domElement;

            holder.ondragover = function() {
                thisObj.props.dragAndDropSetState(true);
                //Log("Drag and drop over" )
                return false;
            };

            holder.ondragleave = function() {
                thisObj.props.dragAndDropSetState(false);
                //Log("Drag and drop leave" )
                return false;
            };

            holder.ondrop = function(e) {
                thisObj.props.dragAndDropSetState(false);

                if(e.dataTransfer)
                {
                    Log('Drop ' + e.dataTransfer.files.length + ' file(s) event');

                    for(let file of e.dataTransfer.files)
                    {
                        let result = File3DLoad(file, function (geometry: BufferGeometry) {
                            let mesh = new THREE.Mesh( geometry, thisObj.material );
                            mesh.castShadow = true;
                            mesh.receiveShadow = true;
                            mesh.scale.set(0.1, 0.1, 0.1);

                            let obj = new SceneObject(mesh);
                            obj.AlignToPlaneXZ(gridVec);
                            obj.AlignToPlaneY();
                            obj.AddToScene(scene);
                        });

                        if(result)
                        {
                            Log("File load " + file.name);
                        }
                        else {
                            Log("Error file format " + file.name);
                        }
                    }
                }
                else {
                    Log("DataTransfer is null, skip drag and drop" );
                }
            }
        }
        setupDragDrop();

        //scene
        {
            var scene = new THREE.Scene();
            var camera = new THREE.PerspectiveCamera(
                50,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );

            this.renderer.setSize(window.innerWidth, window.innerHeight);

            const controls = new OrbitControls(camera, this.renderer.domElement);

            let axes: THREE.Object3D = SceneHelper.CreateAxesHelper(scene);

            let grid: SceneHelper.Grid = SceneHelper.CreateGrid(gridVec, scene);

            if(gridVec.x >= gridVec.z) {
                camera.position.set(gridVec.x / 2, gridVec.z, gridVec.z / 2 + gridVec.z * 1.6);
            }
            else {
                camera.position.set(gridVec.x / 2 + gridVec.x * 1.6, gridVec.x, gridVec.z / 2);
            }
            controls.target = new THREE.Vector3(gridVec.x / 2, 0, gridVec.z / 2);
            controls.update();

            this.mount.appendChild(this.renderer.domElement);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
            directionalLight.castShadow = true;
            scene.add(directionalLight);

            scene.background = new THREE.Color("#eceaea");

            var tanFOV = Math.tan(((Math.PI / 180) * camera.fov / 2));
            var windowHeight = window.innerHeight;

            window.addEventListener('resize', onWindowResize, false);

            function onWindowResize(event) {

                camera.aspect = window.innerWidth / window.innerHeight;

                // adjust the FOV
                camera.fov = (360 / Math.PI) * Math.atan(tanFOV * (window.innerHeight / windowHeight));

                camera.updateProjectionMatrix();
                camera.lookAt(scene.position);

                thisObj.renderer.setSize(window.innerWidth, window.innerHeight);
                thisObj.renderer.render(scene, camera);

                controls.update();
            }

            var animate = function () {
                //requestAnimationFrame(animate);

                //cube.rotation.x += 0.01;
                // cube.rotation.y += 0.01;

                grid.mat.resolution.set(window.innerWidth, window.innerHeight);

                thisObj.renderer.clearDepth(); // important!

                thisObj.renderer.render(scene, camera);
                //Log(camera.rotation.x + " " + camera.rotation.y + " " + camera.rotation.z);

                directionalLight.position.set(camera.position.x, camera.position.y, camera.position.z);
            };

            controls.addEventListener( 'change', animate );

            animate();
        }

        Log("Scene loaded!");
    }

    componentDidMount() {
        let printer = Printer.LoadConfigFromFile(this.printerName);

        if(printer)
        {
            this.printerConfig = printer;

            Log("Printer '" + this.printerName + "' loaded.");

            console.log(this.printerConfig)
        }
        else
        {
            Log("Configuration empty!");
        }

        this.sceneCreate();
    }

    componentWillUnmount() {
        this.mount.removeChild(this.renderer.domElement)
    }

    render() {
        return (
            <div>
                <div ref={ref => (this.mount = ref)} style={{
                    position: "fixed"
                }}>
                </div>

                <SetupPrinter/>
            </div>
        );
    }
}
