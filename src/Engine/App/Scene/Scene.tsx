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
import {File3DLoad} from "./SceneHelper";
import {Box3, BufferGeometry, Vector3} from "three";
import {SceneObject} from "./SceneObject";
import PrinterSelectConfiguration from "../PrinterConfigurators/PrinterSelectConfiguration";
import PrinterConfigurator from "../PrinterConfigurators/PrinterConfigurator";
import LabelPopup from "../Notifications/PopupLabel";
import SceneGUI from "./SceneGUI";
import {OutlineEffect} from "three/examples/jsm/effects/OutlineEffect";
import {Font} from "three/examples/jsm/loaders/FontLoader";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";
import * as png10mm from '../Pictures/10mm.png';

export default this;

export class Scene extends Component<any, any> {
    mount: any;

    printerName: string = storeMain.get('printer');
    printerConfig?: Printer;

    scene: THREE.Scene = new THREE.Scene();
    renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
        antialias: true
    });

    grid?: SceneHelper.Grid;
    gridSize: THREE.Vector3 = new Vector3(1,1,1);
    updateCameraPositionRelativelyToGrid: Function = ()=>{};
    animate: Function = ()=>{};

    outlineEffect?: OutlineEffect;
    sceneObjects: SceneObject[] = [];
    materialForObjects: ISceneMaterial = SceneMaterials.default;
    materialForPlane: THREE.Material = new THREE.MeshBasicMaterial( {color: Settings().scene.workingPlaneColor, side: THREE.FrontSide, opacity: 0.6, transparent: true} );

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

    updatePrinter = () => {
        let thisObj = this;

        if(this.grid)
        {
            this.grid.dispose();
        }

        if(this.printerConfig)
        {
            this.gridSize.set(Math.ceil(this.printerConfig.Workspace.sizeX * 0.1), this.printerConfig.Workspace.height * 0.1, Math.ceil(this.printerConfig.Workspace.sizeY * 0.1));

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
                function ( texture ) {

                    materialForText = new THREE.MeshStandardMaterial( { map:texture, transparent: true, opacity: 0.6, color: 0xFF0000, alphaTest: 0.1 });

                    const geometry = new THREE.PlaneGeometry(1, 1);

                    let plane;

                    /*plane = new THREE.Mesh( geometry, materialForText );
                    plane.rotateX(- Math.PI/2);
                    plane.position.set(0.5,-0.001,-0.25);
                    thisObj.scene.add( plane );*/

                    plane = new THREE.Mesh( geometry, materialForText );
                    plane.rotateX(  - Math.PI/2);
                    plane.rotateZ(    Math.PI/2);
                    plane.position.set(0.5,-0.002,0.5);
                    thisObj.scene.add( plane );
                },

                // onProgress callback currently not supported
                undefined,

                // onError callback
                function ( err ) {
                    console.error( err );
                }
            );


            const geometry = new THREE.PlaneGeometry(this.printerConfig.Workspace.sizeX * 0.1, this.printerConfig.Workspace.sizeY * 0.1 );
            const plane = new THREE.Mesh( geometry, this.materialForPlane );
            plane.rotateX(- Math.PI/2);
            plane.position.set(this.gridSize.x/2, -0.01,this.gridSize.z/2);
            this.scene.add( plane );
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
                        let mesh = new THREE.Mesh( geometry, thisObj.materialForObjects.normal );
                        mesh.castShadow = true;
                        mesh.receiveShadow = true;
                        mesh.scale.set(0.1, 0.1, 0.1);

                        let obj = new SceneObject(mesh);
                        obj.AlignToPlaneXZ(thisObj.gridSize);
                        obj.AlignToPlaneY();
                        obj.AddToScene(thisObj.scene);
                        thisObj.sceneObjects.push(obj);
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

        var scene = this.scene;
        var camera = new THREE.PerspectiveCamera(
            40,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.outlineEffect = new OutlineEffect( this.renderer,  );

        const controls = new OrbitControls(camera, this.renderer.domElement);

        let axes: THREE.Object3D = SceneHelper.CreateAxesHelper(scene);

        this.updateCameraPositionRelativelyToGrid = () => {
            if (gridSize.x >= gridSize.z) {
                camera.position.set(gridSize.x / 2, gridSize.z, gridSize.z / 2 + gridSize.z * 1.6);
            } else {
                camera.position.set(gridSize.x / 2 + gridSize.x * 1.6, gridSize.x, gridSize.z / 2);
            }
            controls.target = new THREE.Vector3(gridSize.x / 2, 0, gridSize.z / 2);
            controls.update();
        }

        this.mount.appendChild(this.renderer.domElement);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        scene.background = new THREE.Color("#eceaea");

        var tanFOV = Math.tan(((Math.PI / 180) * camera.fov / 2));
        var windowHeight = window.innerHeight;
        var raycaster = new THREE.Raycaster();

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

        let animate = function () {
            thisObj.grid?.mat.resolution.set(window.innerWidth, window.innerHeight);

            thisObj.renderer.clearDepth(); // important!

            //thisObj.renderer.render(scene, camera);
/*
            for ( let i = 0; i < scene.children.length; i ++ ) {
                let obj = scene.children[ i ] as THREE.Mesh;

                if (obj instanceof THREE.Mesh && SceneObject.SearchObject(thisObj.sceneObjects, obj) !== -1){
                    obj.material = thisObj.materialForObjects.normal;
                }
            }*/

           /* raycaster.setFromCamera( mouse, camera );

            // calculate objects intersecting the picking ray
            const intersects = raycaster.intersectObjects( scene.children );

            for ( let i = 0; i < intersects.length; i ++ ) {
                let obj = intersects[ i ].object as THREE.Mesh;

                if (obj instanceof THREE.Mesh && SceneObject.SearchObject(thisObj.sceneObjects, obj) !== -1){
                    obj.material = thisObj.materialForObjects.select;
                }
            }*/

            directionalLight.position.set(camera.position.x, camera.position.y, camera.position.z);

            thisObj.outlineEffect?.render(scene, camera);
        };

        const update = () => {
            if(isTheWindowWithFocus()) {
                animate();
            }

            requestAnimationFrame(update);
        }

        requestAnimationFrame(update);

        thisObj.renderer.domElement.addEventListener('mousemove', ()=>{

        });
        thisObj.renderer.domElement.addEventListener('mouseout', ()=>{

        });
        thisObj.renderer.domElement.addEventListener('mouseleave', ()=>{

        });

        this.animate = animate;

        Log("Scene loaded!");
    }

    componentDidMount() {
        this.updatePrinter();
        this.iniScene();
        this.updateCameraPositionRelativelyToGrid();
        this.setupDragNDrop();
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

                <SceneGUI/>

                {!this.printerConfig && <PrinterConfigurator setupConfiguration={(config: Printer)=>{
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
