import React, {Component } from "react";
import ReactDOM from "react-dom";
import 'semantic-ui-css/semantic.min.css'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import {Printer, Config} from "../Configs/Printer";
import * as SceneHelper from "./SceneHelper";
import {dirname, isTheWindowWithFocus, path, storeMain, url} from "../../Bridge";
import {ISceneMaterial, Log, SceneMaterials, Settings} from "../../Globals";
import DragAndDropModal from "./SceneDragAndDropModal";
import {File3DLoad, ToScreenPosition} from "./SceneHelper";
import {Box3, BufferGeometry, Vector2, Vector3} from "three";
import {SceneObject} from "./SceneObject";
import ElementPrinterSelectConfiguration from "../PrinterConfigurators/ElementPrinterSelectConfiguration";
import ContainerPrinterConfigurator from "../PrinterConfigurators/ContainerPrinterConfigurator";
import LabelPopup from "../Notifications/ElementPopupLabel";
import ContainerRight from "../ContainerRight";
import {OutlineEffect} from "three/examples/jsm/effects/OutlineEffect";
import {Font} from "three/examples/jsm/loaders/FontLoader";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";
import * as png10mm from '../Pictures/10mm.png';
import {SelectionBox} from "three/examples/jsm/interactive/SelectionBox";
import {SelectionHelper} from "three/examples/jsm/interactive/SelectionHelper";
import {Key} from "ts-keycode-enum";
import {TransformControls} from "three/examples/jsm/controls/TransformControls";
import SceneTransform from "./SceneTransform";
import {action, autorun, makeAutoObservable, observable, runInAction} from "mobx";
import {observer} from "mobx-react";

export default this;

export interface ISceneStore {
    needUpdateFrame:boolean,

    objects:SceneObject[];
    objectGroupTransform: THREE.Group | null,

    materialForPlane: THREE.Material;
    materialForObjects: ISceneMaterial;
}

export const sceneStore: ISceneStore = makeAutoObservable({
    needUpdateFrame: false,
    objects:[],
    objectGroupTransform: null,
    materialForPlane: new THREE.MeshBasicMaterial( {color: Settings().scene.workingPlaneColor, side: THREE.FrontSide, opacity: 0.6, transparent: true} ),
    materialForObjects: SceneMaterials.default
} as ISceneStore);

export const sceneStoreSelectionChanged = action(()=>{
    for(let object of sceneStore.objects)
    {
        object.Update();
    }

    sceneStore.needUpdateFrame = true;
});

autorun(() => {

});

@observer
export class Scene extends Component<any, any> {
    mount: any;
    keysPressed: Array<Key> = [];
    isKeyPressed = (key: Key) => {
        return this.keysPressed.indexOf(key) !== -1;
    }

    scene: THREE.Scene = new THREE.Scene();
    renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
        antialias: true
    });
    outlineEffect?: OutlineEffect;

    printerName: string = storeMain.get('printer');
    printerConfig?: Printer;

    grid?: SceneHelper.Grid;
    gridSize: THREE.Vector3 = new Vector3(1,1,1);
    plane?: THREE.Mesh;
    updateCameraPositionRelativelyToGrid: Function = ()=>{};
    animate: Function = ()=>{};

    constructor(props) {
        super(props);

        let printer;

        if(this.printerName)
        {
            printer = Printer.LoadConfigFromFile(this.printerName);
        }

        if(printer)
        {
            this.printerConfig = printer;
        }
        else
        {
            Log("Configuration empty!");
        }
    }

    updatePrinter = (isStart: boolean = false) => {
        let thisObj = this;

        if(this.grid)
        {
            this.grid.dispose();
        }

        if(this.plane)
        {
            this.scene.remove(this.plane);
            this.plane.clear();
        }

        if(this.printerConfig)
        {
            this.gridSize.set(Math.ceil(this.printerConfig.Workspace.sizeX * 0.1), this.printerConfig.Workspace.height * 0.1, Math.ceil(this.printerConfig.Workspace.sizeY * 0.1));

            if(isStart) {
                var loader = new THREE.TextureLoader();
                var materialForText;

                //1cm
                loader.load(
                    // resource URL
                    url.format({
                        pathname: path.join(dirname, './Engine/App/Pictures/10mm.png'),
                        protocol: 'file:',
                        slashes: true,
                    }),

                    // onLoad callback
                    function (texture) {

                        materialForText = new THREE.MeshStandardMaterial({
                            map: texture,
                            transparent: true,
                            opacity: 0.7,
                            color: 0xFFFFFF
                        });

                        const geometry = new THREE.PlaneGeometry(1, 1);

                        let plane;

                        /*plane = new THREE.Mesh( geometry, materialForText );
                        plane.rotateX(- Math.PI/2);
                        plane.position.set(0.5,-0.001,-0.25);
                        thisObj.scene.add( plane ); */

                        plane = new THREE.Mesh(geometry, materialForText);
                        plane.rotateX(-Math.PI / 2);
                        plane.rotateZ(Math.PI / 2);
                        plane.position.set(1.5, 0.05, 1.5);
                        thisObj.scene.add(plane);
                    },

                    // onProgress callback currently not supported
                    undefined,

                    // onError callback
                    function (err) {
                        console.error(err);
                    }
                );


                const geometry = new THREE.PlaneGeometry(this.printerConfig.Workspace.sizeX * 0.1, this.printerConfig.Workspace.sizeY * 0.1);
                const plane = new THREE.Mesh(geometry, sceneStore.materialForPlane);
                plane.rotateX(-Math.PI / 2);
                plane.position.set(this.gridSize.x / 2, 0, this.gridSize.z / 2);
                this.scene.add(plane);
            }
        }

        this.grid = SceneHelper.CreateGrid(this.gridSize, this.scene);
    }

    setupDragNDrop = () => {
        let thisObj = this;

        let holder = this.renderer.domElement;

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
                        let obj = new SceneObject(geometry, file.name, sceneStore.objects, true);
                        obj.AlignToPlaneXZ(thisObj.gridSize);
                        obj.AlignToPlaneY();
                        obj.AddToScene(thisObj.scene);
                        sceneStore.objects.push(obj);
                        thisObj.animate();
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

    iniScene = () => {
        let thisObj = this;

        let gridSize = this.gridSize;

        let scene = this.scene;
        let camera = new THREE.PerspectiveCamera(
            40,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio( window.devicePixelRatio );

        this.outlineEffect = new OutlineEffect( this.renderer );

        const orbitControls = new OrbitControls(camera, this.renderer.domElement);

        let axes: THREE.Object3D = SceneHelper.CreateAxesHelper(scene);

        this.updateCameraPositionRelativelyToGrid = () => {
            if (gridSize.x >= gridSize.z) {
                camera.position.set(gridSize.x / 2, gridSize.z, gridSize.z / 2 + gridSize.z * 1.6);
            } else {
                camera.position.set(gridSize.x / 2 + gridSize.x * 1.6, gridSize.x, gridSize.z / 2);
            }
            orbitControls.target = new THREE.Vector3(gridSize.x / 2, 0, gridSize.z / 2);
            orbitControls.update();
        }

        this.mount.appendChild(this.renderer.domElement);

        const light0 = new THREE.DirectionalLight(0xffffff, 0.5);
        light0.castShadow = true;
        scene.add(light0);

        const light1 = new THREE.AmbientLight( 0xffffff , 0.4); // soft white light
        scene.add( light1 );

        /*var materialArray = [];
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/xpos.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/xneg.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/ypos.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/yneg.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/zpos.png' ) }));
	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/zneg.png' ) }));
	var MovingCubeMat = new THREE.MeshFaceMaterial(materialArray);
	var MovingCubeGeom = new THREE.CubeGeometry( 50, 50, 50, 1, 1, 1, materialArray );
	MovingCube = new THREE.Mesh( MovingCubeGeom, MovingCubeMat );
	MovingCube.position.set(0, 25.1, 0);
	scene.add( MovingCube );*/

        scene.background = new THREE.Color("#d2d2d2");

        let tanFOV = Math.tan(((Math.PI / 180) * camera.fov / 2));
        let windowHeight = window.innerHeight;



        let animate = function () {
            thisObj.grid?.mat.resolution.set(window.innerWidth, window.innerHeight);

            thisObj.renderer.clearDepth(); // important!

            light0.position.set(camera.position.x, camera.position.y, camera.position.z);

            thisObj.outlineEffect?.render(scene, camera);
        };

        let onWindowResize = (event) => {
            camera.aspect = window.innerWidth / window.innerHeight;

            // adjust the FOV
            camera.fov = (360 / Math.PI) * Math.atan(tanFOV * (window.innerHeight / windowHeight));

            camera.updateProjectionMatrix();
            camera.lookAt(scene.position);

            thisObj.renderer.setSize(window.innerWidth, window.innerHeight);
            thisObj.renderer.render(scene, camera);

            orbitControls.update();
            animate();
        }
        window.addEventListener('resize', onWindowResize, false);

        orbitControls.addEventListener( 'change', animate);




        const transform = new TransformControls(camera, this.renderer.domElement);
        transform.addEventListener( 'change', event => {
            animate();
        });
        transform.addEventListener( 'dragging-changed', function ( event ) {
            orbitControls.enabled = !event.value;
        });

        File3DLoad(url.format({
            pathname: path.join(dirname, '../test.stl'),
            protocol: 'file:',
            slashes: true,
        }), function (geometry: BufferGeometry) {
            let obj = new SceneObject(geometry, 'test.stl', sceneStore.objects, true);
            obj.AlignToPlaneXZ(thisObj.gridSize);
            obj.AlignToPlaneY();
            obj.AddToScene(thisObj.scene);
            sceneStore.objects.push(obj);
            animate();
        });

        transform.setMode('rotate')

        transform.setTranslationSnap( 0.5 );
        transform.setRotationSnap( THREE.MathUtils.degToRad( 15 ) );
        transform.setScaleSnap( 0.1 );

        window.addEventListener( 'keydown', (e)=>{
            if(thisObj.keysPressed.indexOf(e.keyCode as Key) === -1)
            {
                thisObj.keysPressed.push(e.keyCode as Key);
            }
        }, false);
        window.addEventListener( 'keyup',(e)=>{
            let index = thisObj.keysPressed.indexOf(e.keyCode as Key);

            if(index > -1)
            {
                thisObj.keysPressed.splice(index, 1);
            }
        }, false );

        animate();

        this.animate = animate;

        Log("Scene loaded!");
    }

    componentDidMount() {
        this.updatePrinter(true);
        this.iniScene();
        this.updateCameraPositionRelativelyToGrid();
        this.setupDragNDrop();
    }

    componentWillUnmount() {
        this.mount.removeChild(this.renderer.domElement)
    }

    render() {
        if(sceneStore.needUpdateFrame)
        {
            runInAction(()=>{
                sceneStore.needUpdateFrame = false;
            })
            this.animate();
        }

        return (
            <div>
                <div ref={ref => (this.mount = ref)} style={{
                    position: "fixed"
                }}>
                </div>

                <SceneTransform/>


                {!this.printerConfig && <ContainerPrinterConfigurator setupConfiguration={(config: Printer)=>{
                    storeMain.set('printer', config.name);

                    this.printerName = config.name;
                    this.printerConfig = config;

                    Log("Configuration loaded!");

                    this.updatePrinter();
                    this.updateCameraPositionRelativelyToGrid();
                    this.animate();

                    this.setState({});
                }}/>}

                {this.props.children}
            </div>
        );
    }
}
