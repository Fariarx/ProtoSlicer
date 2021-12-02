import React, {Component} from "react";
import 'semantic-ui-css/semantic.min.css'

import * as THREE from 'three'
import {BufferGeometry, PerspectiveCamera, Raycaster, Vector3} from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

import {Printer} from "../Configs/Printer";
import * as SceneHelper from "./SceneHelper";
import {File3DLoad} from "./SceneHelper";
import {dirname, path, storeMain, url} from "../../Bridge";
import {Log, Settings} from "../../Globals";
import {SceneObject} from "./SceneObject";
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
    sceneStoreCreate,
    sceneStoreSelectionChanged,
    sceneStoreSelectObjsAlignY
} from "./SceneStore";
import {MoveObject} from "../Managers/Entities/MoveObject";
import {addJob} from "../Managers/Workers";
import {Job, WorkerType} from "../Managers/Entities/Job";
import {DrawDirLine} from "../Utils/Utils";
import {MeshBVH} from "three-mesh-bvh";
import Stats from "three/examples/jsm/libs/stats.module";

sceneStoreCreate();

@observer
export class Scene extends Component<any, any> {
    mount: any;
    keysPressed: Array<Key> = [];
    isKeyPressed = (key: Key) => {
        return this.keysPressed.indexOf(key) !== -1;
    }

    renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha:true,
    });
    outlineEffect?: OutlineEffect;

    printerName: string = storeMain.get('printer');
    printerConfig?: Printer;

    grid?: SceneHelper.Grid;
    plane?: THREE.Mesh;

    animate: Function = ()=>{};
    updateCameraPositionRelativelyToGrid: Function = ()=>{};


    constructor(props) {
        super(props);

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

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
            sceneStore.scene.remove(this.plane);
            this.plane.clear();
        }

        if(this.printerConfig) {
            sceneStore.gridSize.set(Math.ceil(this.printerConfig.Workspace.sizeX * 0.1), this.printerConfig.Workspace.height * 0.1, Math.ceil(this.printerConfig.Workspace.sizeY * 0.1));

            var loader = new THREE.TextureLoader();
            var materialForText;

            sceneStore.decorations.clear();

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

                    materialForText = new THREE.MeshBasicMaterial({
                        map: texture,
                        transparent: true,
                        opacity:0.4
                    });

                    const geometry = new THREE.PlaneGeometry(1, 1);

                    let plane;

                    /*plane = new THREE.Mesh( geometry, materialForText );
                    plane.rotateX(- Math.PI/2);
                    plane.position.set(0.5,-0.001,-0.25);
                    sceneStore.scene.add( plane ); */

                    plane = new THREE.Mesh(geometry, materialForText);
                    plane.rotateX(-Math.PI / 2);
                    plane.rotateZ(Math.PI / 2);
                    plane.position.set(1.5, 0.01, 1.5);
                    plane.scale.set(.75,.75,.75)
                    sceneStore.decorations.add(plane);
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
            plane.position.set(sceneStore.gridSize.x / 2, -0.01, sceneStore.gridSize.z / 2);
            sceneStore.decorations.add(plane);

            const geometry1 = new THREE.PlaneGeometry(Math.ceil(this.printerConfig.Workspace.sizeX * 0.1), Math.ceil(this.printerConfig.Workspace.sizeY * 0.1));
            const plane1 = new THREE.Mesh(geometry1, sceneStore.materialForPlaneLimit);
            plane1.rotateX(-Math.PI / 2);
            plane1.position.set(sceneStore.gridSize.x / 2, -0.02, sceneStore.gridSize.z / 2);
            sceneStore.decorations.add(plane1);

            const plane2 = new THREE.Mesh(geometry1, sceneStore.materialForPlaneShadow);
            plane2.rotateX(-Math.PI / 2);
            plane2.receiveShadow = true;
            plane2.position.set(sceneStore.gridSize.x / 2, 0, sceneStore.gridSize.z / 2);
            sceneStore.decorations.add(plane2);

            sceneStore.printer = this.printerConfig;
        }

        this.grid = SceneHelper.CreateGrid(sceneStore.gridSize, sceneStore.scene);


        sceneStore.perspectiveCamera.position.set(sceneStore.gridSize.x , sceneStore.gridSize.y , sceneStore.gridSize.z );
        sceneStore.orthographicCamera.position.set(sceneStore.gridSize.x * 2 , sceneStore.gridSize.y * 2 , sceneStore.gridSize.z * 2 );
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
                        obj.AlignToPlaneXZ(sceneStore.gridSize);
                        obj.AlignToPlaneY();
                        obj.AddToScene(sceneStore.scene);
                        Dispatch(EventEnum.ADD_OBJECT, obj);
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
        const thisObj = this;

        const gridSize = sceneStore.gridSize;

        const scene = sceneStore.scene;

        const perspectiveCamera = sceneStore.perspectiveCamera;
        const orthographicCamera = sceneStore.orthographicCamera;

        const cameraRig = new THREE.Group();

        cameraRig.add( perspectiveCamera );
        cameraRig.add( orthographicCamera );

        scene.add( cameraRig );


        let windowHeight = window.innerHeight;

        const updateCameraWindowsSize = () => {

            if(sceneStore.activeCamera instanceof THREE.PerspectiveCamera) {
                sceneStore.activeCamera.aspect = window.innerWidth / window.innerHeight;
                sceneStore.activeCamera.fov = (360 / Math.PI) * Math.atan(Math.tan(((Math.PI / 180) * sceneStore.perspectiveCamera.fov / 2)) * (window.innerHeight / windowHeight));

            }
            else {
                sceneStore.activeCamera.left = window.innerWidth / -2;
                sceneStore.activeCamera.right = window.innerWidth / 2;
                sceneStore.activeCamera.top = window.innerHeight / 2;
                sceneStore.activeCamera.bottom = window.innerHeight / -2;

            }

            sceneStore.activeCamera.updateProjectionMatrix();
        }


        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio( window.devicePixelRatio );

        this.outlineEffect = new OutlineEffect( this.renderer, {
            defaultThickness:0.001
        } );

        const orbitControls = new OrbitControls(perspectiveCamera, this.renderer.domElement);
        const transform = new TransformControls(perspectiveCamera, this.renderer.domElement);

        sceneStore.switchCameraType = (isPerspective , isIni) => {
            if(isPerspective)
            {
                sceneStore.activeCamera = sceneStore.perspectiveCamera;
            }
            else
            {
                sceneStore.activeCamera = sceneStore.orthographicCamera;

            }


            orbitControls.object = sceneStore.activeCamera;
            orbitControls.target = new THREE.Vector3(gridSize.x / 3, 0, gridSize.z / 3);
            orbitControls.update();

            transform.camera = sceneStore.activeCamera;

            updateCameraWindowsSize();

            if(!isIni)
            {
                animate();
            }
        }

        sceneStore.switchCameraType(Settings().scene.setStartupPerspectiveCamera, true);

        let axes: THREE.Object3D = SceneHelper.CreateAxesHelper(scene);


        perspectiveCamera.position.set(gridSize.x , gridSize.y , gridSize.z );
        orthographicCamera.position.set(gridSize.x * 2 , gridSize.y * 2 , gridSize.z * 2 );

        this.updateCameraPositionRelativelyToGrid = () => {
            /*if (gridSize.x >= gridSize.z) {
                perspectiveCamera.position.set(gridSize.x / 2, gridSize.y * 1.5, gridSize.z * 1.5 + gridSize.z * 1.6);
            } else {
                perspectiveCamera.position.set(gridSize.x * 1.5 + gridSize.x * 1.6, gridSize.y * 1.5, gridSize.z / 2);
            }*/


            orbitControls.target = new THREE.Vector3(gridSize.x / 3, 0, gridSize.z / 3);
            orbitControls.update();
        }

        this.mount.appendChild(this.renderer.domElement);

        const light0 = new THREE.DirectionalLight(0xffffff, 0.3);
        light0.castShadow = false;
        scene.add(light0);

        const light1 = new THREE.AmbientLight( 0xffffff , 0.3); // soft white light
        scene.add( light1 );

        const light2 = new THREE.DirectionalLight(0xffffff, 0.2  );
        light2.position.set( sceneStore.gridSize.x / 2, 10, sceneStore.gridSize.z / 2 ); //default; light shining from top

        const target = new THREE.Object3D();
        target.position.set(sceneStore.gridSize.x / 2, 0, sceneStore.gridSize.z / 2);
        light2.target = target;
        light0.target = target;
        scene.add(target);

        light2.castShadow = true; // default false
        const value = gridSize.x > gridSize.z ? gridSize.x : gridSize.z;

        light2.shadowCameraLeft = -value;
        light2.shadowCameraRight = value;
        light2.shadowCameraTop = value;
        light2.shadowCameraBottom = -value;
        scene.add(light2);

        //const helper = new THREE.CameraHelper( light2.shadow.camera );
        //scene.add( helper );

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

       // scene.background = new THREE.Color(Settings().ui.colorBackgroundScene);

// initialize brush cursor
        const brushSegments = [ new THREE.Vector3(), new THREE.Vector3( 0, 0, 1 ) ];
        for ( let i = 0; i < 20; i ++ ) {

            const nexti = i + 1;
            const x1 = Math.sin( 2 * Math.PI * i / 20 );
            const y1 = Math.cos( 2 * Math.PI * i / 20 );

            const x2 = Math.sin( 2 * Math.PI * nexti / 20 );
            const y2 = Math.cos( 2 * Math.PI * nexti / 20 );

            brushSegments.push(
                new THREE.Vector3( x1, y1, 0 ),
                new THREE.Vector3( x2, y2, 0 )
            );

        }

        let brush = new THREE.LineSegments();
        brush.scale.set(.08, .08, .08)
        brush.geometry.setFromPoints( brushSegments );
        // @ts-ignore
        brush.material.color.set( 0xfb8c00 );
        scene.add( brush );

        brush.visible = false;

        let add_supports_mode = true;

        let transformWorking = false;

        let stats =  Stats();

        let outlineTimer: NodeJS.Timer | null = null;

        let wasChangeLook = false;

        const animate = function () {
            thisObj.grid?.mat.resolution.set(window.innerWidth, window.innerHeight);

            thisObj.renderer.clearDepth(); // important!

            light0.position.set(sceneStore.activeCamera.position.x, sceneStore.activeCamera.position.y, sceneStore.activeCamera.position.z);


            thisObj.renderer.render(scene, sceneStore.activeCamera);

            if(outlineTimer)
            {
                clearTimeout(outlineTimer);
            }

            outlineTimer = setTimeout(()=>{
                thisObj.renderer.render(scene, sceneStore.activeCamera);
                thisObj.outlineEffect?.renderOutline(scene, sceneStore.activeCamera);
            }, 100);

            stats.update();


            if(transformWorking)
            {
                requestAnimationFrame(animate);
            }
        };

        let onWindowResize = (event) => {
            updateCameraWindowsSize();

            sceneStore.activeCamera.lookAt(scene.position);

            thisObj.renderer.setSize(window.innerWidth, window.innerHeight);
            thisObj.renderer.render(scene, sceneStore.activeCamera);

            orbitControls.update();
            animate();
        }
        window.addEventListener('resize', onWindowResize, false);


        orbitControls.addEventListener( 'change', () => {
            wasChangeLook = true;
            requestAnimationFrame(animate);
        });

        this.renderer.setClearColor(0x000000, 0)

        this.renderer.domElement.style.background =  'linear-gradient(to bottom,  '+Settings().ui.colorBackgroundScene+' 0%,'+ Settings().ui.colorBackgroundSceneBottom +' 100%)'


        transform.addEventListener( 'change', (event) => {
            let transformObj = sceneStore.sceneStoreGetSelectObj;

            runInAction(() => {
                if (transformObj !== null && sceneStore.groupSelected.length) {
                    let now, old;

                    switch (sceneStore.transformInstrumentState) {
                        case TransformInstrumentEnum.Move:
                            now = sceneStore.transformObjectGroup.position;
                            old = sceneStore.transformObjectGroupOld.position;

                            if (!now.equals(old)) {
                                let differenceVector3 = new Vector3(old.x - now.x, old.y - now.y, old.z - now.z);

                                sceneStore.transformObjectGroupOld.position.set(now.x, now.y, now.z);

                                for (let sceneObject of sceneStore.groupSelected) {
                                    let oldPosition = sceneObject.mesh.position.clone();
                                    let newPosition = sceneObject.mesh.position.clone();

                                    newPosition.x -= differenceVector3.x;
                                    newPosition.y -= differenceVector3.y;
                                    newPosition.z -= differenceVector3.z;

                                    Dispatch(EventEnum.TRANSFORM_OBJECT, {
                                        from: oldPosition,
                                        to: newPosition,
                                        sceneObject: sceneObject,
                                        renderBreak: true
                                    } as MoveObject)
                                }
                            }

                            break;
                        case TransformInstrumentEnum.Rotate:
                            now = sceneStore.transformObjectGroup.rotation;
                            old = sceneStore.transformObjectGroupOld.rotation;

                            if (!now.equals(old)) {
                                let differenceVector3 = new Vector3(old.x - now.x, old.y - now.y, old.z - now.z);

                                sceneStore.transformObjectGroupOld.rotation.set(now.x, now.y, now.z);

                                for (let sceneObject of sceneStore.groupSelected) {
                                    let oldPosition = sceneObject.mesh.rotation.clone();
                                    let newPosition = sceneObject.mesh.rotation.clone();

                                    newPosition.x -= differenceVector3.x;
                                    newPosition.y -= differenceVector3.y;
                                    newPosition.z -= differenceVector3.z;

                                    Dispatch(EventEnum.TRANSFORM_OBJECT, {
                                        from: oldPosition,
                                        to: newPosition,
                                        sceneObject: sceneObject,
                                        renderBreak: true
                                    } as MoveObject)

                                }

                            }
                            break;
                        case TransformInstrumentEnum.Scale:
                            now = sceneStore.transformObjectGroup.scale;
                            old = sceneStore.transformObjectGroupOld.scale;

                            if (!now.equals(old)) {
                                let differenceVector3 = new Vector3(old.x - now.x, old.y - now.y, old.z - now.z);

                                sceneStore.transformObjectGroupOld.scale.set(now.x, now.y, now.z);

                                for (let sceneObject of sceneStore.groupSelected) {
                                    let oldPosition = sceneObject.mesh.scale.clone();
                                    let newPosition = sceneObject.mesh.scale.clone();

                                    newPosition.x -= differenceVector3.x;
                                    newPosition.y -= differenceVector3.y;
                                    newPosition.z -= differenceVector3.z;

                                    Dispatch(EventEnum.TRANSFORM_OBJECT, {
                                        from: oldPosition,
                                        to: newPosition,
                                        sceneObject: sceneObject,
                                        renderBreak: true
                                    } as MoveObject)

                                    sceneObject.UpdateSize();//for .size and CalculateGroupMaxSize()
                                }
                            }
                            break;
                    }
                } else {
                    Log('Error of \'change\': transformObj is null or sceneStore.groupSelected.length = 0');
                }

            });

        });


        transform.setSize(0.85);
        transform.setSpace('world');

        transform.addEventListener( 'dragging-changed', function ( event ) {
            orbitControls.enabled = !event.value;

            transformWorking = event.value;

            if (!event.value && Settings().scene.transformAlignToPlane) {
                sceneStoreSelectObjsAlignY();
            }

            //sceneStore.transformObjectGroup.rotation.set(0,0,0);
            //sceneStore.transformObjectGroupOld.rotation.set(0,0,0);

            requestAnimationFrame(animate);
        });

        File3DLoad(url.format({
            pathname: path.join(dirname, '../test.stl'),
            protocol: 'file:',
            slashes: true,
        }), function (geometry: BufferGeometry) {
            let obj = new SceneObject(geometry, 'test.stl', sceneStore.objects, true);
            obj.AlignToPlaneXZ(sceneStore.gridSize);
            obj.AlignToPlaneY();
            obj.AddToScene(sceneStore.scene);
            Dispatch(EventEnum.ADD_OBJECT, obj);
            animate();

            /*addJob(new Job({
                name: WorkerType.SliceFullScene,
                onResult: result => {
                    console.log(result)
                },
                onState: percent => {
                    console.log(percent)
                }
            }));*/
            /*.start();*/
        });

        transform.setTranslationSnap( 0.25 );
        transform.setRotationSnap( THREE.MathUtils.degToRad( 5 ) );
        transform.setScaleSnap( 0.001 );

        scene.add(transform);

        sceneStore.transformInstrument = transform;

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

        let mouseTrack: any;
        const vec = new THREE.Vector3();
        const titleBarX = 36;
        let normalZ = new THREE.Vector3( 0, 0, 1 );

        window.addEventListener("mousemove", (e)=>{

                let raycaster = new Raycaster();

                vec.set(
                    ( (e.clientX) / window.innerWidth ) * 2 - 1,
                    - ( (e.clientY -  titleBarX) / window.innerHeight ) * 2 + 1,
                    0.5 );

                raycaster.setFromCamera(vec, sceneStore.activeCamera);

                let intersects = raycaster.intersectObjects(SceneObject.GetMeshesFromObjs(sceneStore.groupSelected), false);


            intersects.sort((a, b) => {
                return a.distance < b.distance ? -1 : 1;
            })

            if(intersects.length && intersects[0].face )
            {
                brush.visible = true;
                brush.quaternion.setFromUnitVectors(normalZ, intersects[0].face .normal);
                brush.position.set(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z)

                requestAnimationFrame(animate);
            }
            else {
                brush.visible = false;
            }
        })

        window.addEventListener("mousedown", (e)=> {
            if(e.button !== 0 || !this.printerName) return;

            mouseTrack = {
                start: {
                    x: e.clientX,
                    y: e.clientY
                }
            }
        })
        window.addEventListener('mouseup', (e)=>{
            if(e.button !== 0 || !this.printerName) {
                return;
            }
            else if(mouseTrack)
            {
                let dist = Math.sqrt(Math.pow(Math.abs(e.clientX - mouseTrack.start.x), 2) + Math.pow(Math.abs(e.clientY - mouseTrack.start.y), 2));

                mouseTrack = null;

                if(dist > 2)
                {
                    return;
                }
            }
            else {
                return;
            }


            vec.set(
                ( (e.clientX) / window.innerWidth ) * 2 - 1,
                - ( (e.clientY -  titleBarX) / window.innerHeight ) * 2 + 1,
                0.5 );


            //sceneStore.activeCamera.updateProjectionMatrix();
            //sceneStore.activeCamera.updateMatrix();
            //sceneStore.activeCamera.updateMatrixWorld(true);
            //sceneStore.activeCamera.updateWorldMatrix(true, true)

            //vec.unproject( sceneStore.activeCamera );

            //vec.sub( sceneStore.activeCamera.position ).normalize();

           // var distance = - sceneStore.camera.position.z / vec.z;

            //pos.copy( sceneStore.camera.position ).add( vec.multiplyScalar( distance ) );


            let raycaster = new Raycaster();

            raycaster.setFromCamera(vec, sceneStore.activeCamera);


            let intersects = raycaster.intersectObjects(SceneObject.GetMeshesFromObjs(sceneStore.objects), false);

            intersects.sort((a, b) => {
                return a.distance < b.distance ? -1 : 1;
            })

            if(intersects.length && intersects[0].face )
            {
                let sceneObjIndex = SceneObject.SearchObject(sceneStore.objects, intersects[0].object as THREE.Mesh)

                if(sceneObjIndex < -1)
                {
                    return;
                }

                let sceneObj  = sceneStore.objects[sceneObjIndex];

                if(!this.keysPressed.includes(Key.Ctrl) && !this.keysPressed.includes(Key.Shift) && !sceneObj.isSelected) {
                    sceneStore.objects.forEach((t, i) => {
                        if(i === sceneObjIndex)
                        {
                            return;
                        }

                        t.isSelected = false;
                    })
                }

                sceneObj.isSelected = !sceneObj.isSelected;
                sceneStoreSelectionChanged(true);
                requestAnimationFrame(animate);
            }

        })

        animate();

        this.animate = animate;


        stats.setMode(0);

        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0';
        stats.domElement.style.top = '0';

        this.mount.appendChild(stats.domElement);

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
                }} />

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
