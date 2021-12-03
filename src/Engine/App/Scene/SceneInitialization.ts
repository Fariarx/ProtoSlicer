import {Key} from "ts-keycode-enum";
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {TransformControls} from "three/examples/jsm/controls/TransformControls";
import {Log, Settings} from "../../Globals";
import {SceneHelper} from "../Utils/Utils";
import {runInAction} from "mobx";
import {TransformInstrumentEnum} from "./ChildrenUI/SceneTransformBar";
import {BufferGeometry, Raycaster, Vector3} from "three";
import {Dispatch, EventEnum} from "../Managers/Events";
import {MoveObject} from "../Managers/Entities/MoveObject";
import {dirname, path, url} from "../../Bridge";
import {SceneObject} from "./Entities/SceneObject";
import {isKeyPressed} from "../Utils/Keys";
import {Printer} from "../Configs/Printer";
import {CSceneStore, SceneUtils} from "./SceneStore";

export class SceneInitialization {
    sceneStore: CSceneStore;
    props: any;

    orbitControls: OrbitControls;
    transformControls: TransformControls;
    axisHelper: THREE.Object3D;
    addSupportsCursor: THREE.LineSegments;

    cameraRig: THREE.Group;

    lightGroup: THREE.Group;
    lightShadow: THREE.DirectionalLight;
    lightFromCamera: THREE.DirectionalLight;

    stats = Stats();

    isTransformWorking = false;
    isWorkingAddSupports = true;

    private temp: any = {};

    constructor(_sceneStore: CSceneStore, _props: any) {
        this.sceneStore = _sceneStore;
        this.props = _props;

        this.setupPrinter();
        this.updatePrinter();

        this.temp.listners = [];
        this.temp.addListener = (name, callback) => {
            window.addEventListener(name, callback);
            this.temp.listners.push([name, callback]);
        }

        this.stats.setMode(0);
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.left = '0';
        this.stats.domElement.style.top = '0';

        this.lightGroup = new THREE.Group();
        this.lightShadow = new THREE.DirectionalLight(0xffffff, 0.2  );
        this.lightFromCamera = new THREE.DirectionalLight(0xffffff, 0.3);
        this.setupLight();

        this.axisHelper = SceneHelper.CreateAxesHelper(this.sceneStore.scene);

        this.cameraRig = new THREE.Group();
        this.setupCameraRig();

        this.setupWindowResize();

        this.orbitControls = new OrbitControls(this.sceneStore.activeCamera, this.sceneStore.renderer.domElement);
        this.transformControls = new TransformControls(this.sceneStore.activeCamera, this.sceneStore.renderer.domElement);
        this.setupOrbitController();
        this.setupTransformControls();

        this.addSupportsCursor = new THREE.LineSegments();
        this.setupAddSupportCursor();

        this.setupCameraType(Settings().scene.setStartupPerspectiveCamera, true);
        this.updateCameraLookPosition();

        this.dev();

        Log("SceneComponent loaded!");
    }

    setupCanvas(canvas) {
        canvas.appendChild(this.sceneStore.renderer.domElement);
        canvas.appendChild(this.stats.domElement);
    }
    setupPrinter() {
        let printer;

        if(this.sceneStore.printerName)
        {
            printer = Printer.LoadConfigFromFile(this.sceneStore.printerName);
        }

        if(printer)
        {
            this.sceneStore.printer = printer;
        }
        else
        {
            Log("Configuration empty!");
        }
    }
    setupDragNDrop = () => {
        let _this = this;

        let holder = this.sceneStore.renderer.domElement;

        holder.ondragover = function() {
            _this.props.dragAndDropSetState(true);
            return false;
        };

        holder.ondragleave = function() {
            _this.props.dragAndDropSetState(false);
            //Log("Drag and drop leave" )
            return false;
        };

        holder.ondrop = function(e) {
            _this.props.dragAndDropSetState(false);

            if(e.dataTransfer)
            {
                Log('Drop ' + e.dataTransfer.files.length + ' file(s) event');

                for(let file of e.dataTransfer.files)
                {
                    let result = SceneHelper.File3DLoad(file, function (geometry: BufferGeometry) {
                        let obj = new SceneObject(geometry, file.name, _this.sceneStore.objects, true);
                        obj.AlignToPlaneXZ(_this.sceneStore.gridSize);
                        obj.AlignToPlaneY();
                        obj.AddToScene(_this.sceneStore.scene);
                        Dispatch(EventEnum.ADD_OBJECT, obj);
                        _this.animate();
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
    setupMouse() {
        const vec = new THREE.Vector3();
        const titleBarX = 36;

        let _this = this;
        let mouseTrack: any;
        let normalZ = new THREE.Vector3( 0, 0, 1 );

        this.temp.addListener("mousemove", (e)=> {
            if (_this.isWorkingAddSupports) {
                let raycaster = new Raycaster();

                vec.set(
                    ((e.clientX) / window.innerWidth) * 2 - 1,
                    -((e.clientY - titleBarX) / window.innerHeight) * 2 + 1,
                    0.5);

                raycaster.setFromCamera(vec, this.sceneStore.activeCamera);

                let intersects = raycaster.intersectObjects(SceneObject.GetMeshesFromObjs(this.sceneStore.groupSelected), false);

                intersects.sort((a, b) => {
                    return a.distance < b.distance ? -1 : 1;
                })

                if (intersects.length && intersects[0].face) {
                    _this.addSupportsCursor.visible = true;
                    _this.addSupportsCursor.quaternion.setFromUnitVectors(normalZ, intersects[0].face.normal);
                    _this.addSupportsCursor.position.set(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z)

                    _this.animate();
                } else {
                    _this.addSupportsCursor.visible = false;
                }
            }
        })
        this.temp.addListener("mousedown", (e)=> {
            if(e.button !== 0 || !this.sceneStore.printerName) {
                return;
            }

            mouseTrack = {
                start: {
                    x: e.clientX,
                    y: e.clientY
                }
            }
        })
        this.temp.addListener('mouseup', (e)=> {
            if(e.button !== 0 || !this.sceneStore.printerName) {
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

            let raycaster = new Raycaster();

            raycaster.setFromCamera(vec, this.sceneStore.activeCamera);

            let intersects = raycaster.intersectObjects(SceneObject.GetMeshesFromObjs(this.sceneStore.objects), false);

            intersects.sort((a, b) => {
                return a.distance < b.distance ? -1 : 1;
            })

            if(intersects.length && intersects[0].face )
            {
                let sceneObjIndex = SceneObject.SearchObject(this.sceneStore.objects, intersects[0].object as THREE.Mesh)

                if(sceneObjIndex < -1)
                {
                    return;
                }

                let sceneObj  = this.sceneStore.objects[sceneObjIndex];

                if(!isKeyPressed(Key.Ctrl) && !isKeyPressed(Key.Shift) && !sceneObj.isSelected) {
                    this.sceneStore.objects.forEach((t, i) => {
                        if(i === sceneObjIndex)
                        {
                            return;
                        }

                        t.isSelected = false;
                    })
                }

                sceneObj.isSelected = !sceneObj.isSelected;
                SceneUtils.selectionChanged(true);
                _this.animate();
            }

        })
    }
    setupAddSupportCursor() {
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

        this.addSupportsCursor.scale.set(.08, .08, .08)
        this.addSupportsCursor.geometry.setFromPoints( brushSegments );
        // @ts-ignore
        this.addSupportsCursor.material.color.set( 0xfb8c00 );
        this.sceneStore.scene.add( this.addSupportsCursor );

        this.addSupportsCursor.visible = false;
    }
    setupCameraRig() {
        this.sceneStore.perspectiveCamera.position.set(this.sceneStore.gridSize.x , this.sceneStore.gridSize.y , this.sceneStore.gridSize.z );
        this.sceneStore.orthographicCamera.position.set(this.sceneStore.gridSize.x * 2 , this.sceneStore.gridSize.y * 2 , this.sceneStore.gridSize.z * 2 );
    }
    setupCameraType (isPerspective: boolean, isIni = false) {
        if(isPerspective)
        {
            this.sceneStore.activeCamera = this.sceneStore.perspectiveCamera;
        }
        else
        {
            this.sceneStore.activeCamera = this.sceneStore.orthographicCamera;
        }

        this.orbitControls.object = this.sceneStore.activeCamera;
        this.orbitControls.target = new THREE.Vector3(this.sceneStore.gridSize.x / 3, 0, this.sceneStore.gridSize.z / 3);
        this.orbitControls.update();

        this.transformControls.camera = this.sceneStore.activeCamera;

        this.updateCameraWindowSize();

        if(!isIni)
        {
            this.animate();
        }
    }
    setupTransformControls() {
        this.transformControls .addEventListener( 'change', (event) => {
            let transformObj = this.sceneStore.transformObjectGroup;
            let transformObjOld = this.sceneStore.transformObjectGroupOld;

            runInAction(() => {
                if (transformObj !== null && this.sceneStore.groupSelected.length) {
                    let now, old;

                    switch (this.sceneStore.transformInstrumentState) {
                        case TransformInstrumentEnum.Move:
                            now = transformObj.position;
                            old = transformObjOld.position;

                            if (!now.equals(old)) {
                                let differenceVector3 = new Vector3(old.x - now.x, old.y - now.y, old.z - now.z);

                                transformObjOld.position.set(now.x, now.y, now.z);

                                for (let sceneObject of this.sceneStore.groupSelected) {
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
                            now = transformObj.rotation;
                            old = transformObjOld.rotation;

                            if (!now.equals(old)) {
                                let differenceVector3 = new Vector3(old.x - now.x, old.y - now.y, old.z - now.z);

                                transformObjOld.rotation.set(now.x, now.y, now.z);

                                for (let sceneObject of this.sceneStore.groupSelected) {
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
                            now = transformObj.scale;
                            old = transformObjOld.scale;

                            if (!now.equals(old)) {
                                let differenceVector3 = new Vector3(old.x - now.x, old.y - now.y, old.z - now.z);

                                transformObjOld.scale.set(now.x, now.y, now.z);

                                for (let sceneObject of this.sceneStore.groupSelected) {
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
                    Log('Error of \'change\': transformObj is null or this.sceneStore.groupSelected.length = 0');
                }

            });
        });

        this.transformControls .setSize(0.85);
        this.transformControls .setSpace('world');

        this.transformControls .setTranslationSnap( 0.25 );
        this.transformControls .setRotationSnap( THREE.MathUtils.degToRad( 5 ) );
        this.transformControls .setScaleSnap( 0.001 );

        this.sceneStore.scene.add(this.transformControls );

        let _this = this;

        this.transformControls .addEventListener( 'dragging-changed', function ( event ) {
            _this.orbitControls.enabled = !event.value;

            _this.isTransformWorking = event.value;

            if (!event.value && Settings().scene.transformAlignToPlane) {
                SceneUtils.selectObjsAlignY();
            }

            _this.animate();
        });
    }
    setupOrbitController() {
        const orbitControls = new OrbitControls(this.sceneStore.activeCamera, this.sceneStore.renderer.domElement);

        this.temp.wasChangeLook = false;

        orbitControls.addEventListener( 'change', () => {
            this.temp.wasChangeLook = true;
            this.animate();
        });
    }
    setupWindowResize() {
        this.temp.windowHeight = window.innerHeight;

        let onWindowResize = (event) => {
            this.updateCameraWindowSize();

            this.sceneStore.activeCamera.lookAt(this.sceneStore.scene.position);
            this.sceneStore.renderer.setSize(window.innerWidth, window.innerHeight);
            this.sceneStore.renderer.render(this.sceneStore.scene, this.sceneStore.activeCamera);

            this.orbitControls.update();

            this.animate();
        }

        this.temp.addListener('resize', onWindowResize, false);
    }
    setupLight() {
        this.lightFromCamera.castShadow = false;
        this.lightGroup.attach( this.lightFromCamera );

        const light1 = new THREE.AmbientLight( 0xffffff , 0.3); // soft white light
        this.lightGroup.attach( light1 );

        this.lightShadow.position.set( this.sceneStore.gridSize.x / 2, 10, this.sceneStore.gridSize.z / 2 ); //default; light shining from top
        this.lightShadow.castShadow = true; // default false

        const target = new THREE.Object3D();

        target.position.set(this.sceneStore.gridSize.x / 2, 0, this.sceneStore.gridSize.z / 2);

        this.lightShadow.target = target;
        this.lightFromCamera.target = target;

        this.lightGroup.attach(target);

        const value = this.sceneStore.gridSize.x > this.sceneStore.gridSize.z ? this.sceneStore.gridSize.x : this.sceneStore.gridSize.z;

        this.lightShadow.shadowCameraLeft = -value;
        this.lightShadow.shadowCameraRight = value;
        this.lightShadow.shadowCameraTop = value;
        this.lightShadow.shadowCameraBottom = -value;

        this.lightFromCamera.shadowCameraLeft = -value;
        this.lightFromCamera.shadowCameraRight = value;
        this.lightFromCamera.shadowCameraTop = value;
        this.lightFromCamera.shadowCameraBottom = -value;

        this.lightGroup.attach(this.lightShadow);

        this.sceneStore.scene.add(this.lightGroup);
    }

    dispose() {
        for(let listener of this.temp.listners)
        {
            window.removeEventListener(listener[0], listener[1]);
        }
    }

    updateCameraLookPosition() {
        this.orbitControls.target = new THREE.Vector3(this.sceneStore.gridSize.x / 3, 0, this.sceneStore.gridSize.z / 3);
        this.orbitControls.update();
    }
    updateCameraWindowSize () {
        if(this.sceneStore.activeCamera instanceof THREE.PerspectiveCamera) {
            this.sceneStore.activeCamera.aspect = window.innerWidth / window.innerHeight;
            this.sceneStore.activeCamera.fov = (360 / Math.PI) * Math.atan(Math.tan(((Math.PI / 180) * this.sceneStore.perspectiveCamera.fov / 2)) * (window.innerHeight / this.temp.windowHeight));

        }
        else {
            this.sceneStore.activeCamera.left = window.innerWidth / -2;
            this.sceneStore.activeCamera.right = window.innerWidth / 2;
            this.sceneStore.activeCamera.top = window.innerHeight / 2;
            this.sceneStore.activeCamera.bottom = window.innerHeight / -2;

        }

        this.sceneStore.activeCamera.updateProjectionMatrix();
    }
    updatePrinter() {
        if(this.sceneStore.grid)
        {
            this.sceneStore.grid.dispose();
        }

        this.sceneStore.decorations.clear();

        if(this.sceneStore.printer) {
            this.sceneStore.gridSize.set(Math.ceil(this.sceneStore.printer.Workspace.sizeX * 0.1), this.sceneStore.printer.Workspace.height * 0.1, Math.ceil(this.sceneStore.printer.Workspace.sizeY * 0.1));

            let loader = new THREE.TextureLoader();
            let materialForText;
            let _this = this;

            //1cm
            loader.load(
                url.format({
                    pathname: path.join(dirname, './Engine/App/Pictures/10mm.png'),
                    protocol: 'file:',
                    slashes: true,
                }),
                function (texture) {
                    materialForText = new THREE.MeshBasicMaterial({
                        map: texture,
                        transparent: true,
                        opacity:0.4
                    });

                    const geometry = new THREE.PlaneGeometry(1, 1);

                    let plane;

                    plane = new THREE.Mesh(geometry, materialForText);
                    plane.rotateX(-Math.PI / 2);
                    plane.rotateZ(Math.PI / 2);
                    plane.position.set(1.5, 0.01, 1.5);
                    plane.scale.set(.75,.75,.75)
                    _this.sceneStore.decorations.add(plane);
                },
                undefined,
                function (err) {
                    console.error(err);
                }
            );


            const geometry = new THREE.PlaneGeometry(this.sceneStore.printer.Workspace.sizeX * 0.1, this.sceneStore.printer.Workspace.sizeY * 0.1);
            const plane = new THREE.Mesh(geometry, this.sceneStore.materialForPlane);
            plane.rotateX(-Math.PI / 2);
            plane.position.set(this.sceneStore.gridSize.x / 2, -0.01, this.sceneStore.gridSize.z / 2);
            this.sceneStore.decorations.add(plane);

            const geometry1 = new THREE.PlaneGeometry(Math.ceil(this.sceneStore.printer.Workspace.sizeX * 0.1), Math.ceil(this.sceneStore.printer.Workspace.sizeY * 0.1));
            const plane1 = new THREE.Mesh(geometry1, this.sceneStore.materialForPlaneLimit);
            plane1.rotateX(-Math.PI / 2);
            plane1.position.set(this.sceneStore.gridSize.x / 2, -0.02, this.sceneStore.gridSize.z / 2);
            this.sceneStore.decorations.add(plane1);

            const plane2 = new THREE.Mesh(geometry1, this.sceneStore.materialForPlaneShadow);
            plane2.rotateX(-Math.PI / 2);
            plane2.receiveShadow = true;
            plane2.position.set(this.sceneStore.gridSize.x / 2, 0, this.sceneStore.gridSize.z / 2);
            this.sceneStore.decorations.add(plane2);
        }
        else {
            this.sceneStore.gridSize.set(1,1,1);
        }

        this.sceneStore.grid = SceneHelper.CreateGrid(this.sceneStore.gridSize, this.sceneStore.scene);
    }
    animate () {
        const _animate = () => {
            this.sceneStore.grid?.mat.resolution.set(window.innerWidth, window.innerHeight);

            this.sceneStore.renderer.clearDepth(); // important!

            this.lightFromCamera.position.set(this.sceneStore.activeCamera.position.x, this.sceneStore.activeCamera.position.y, this.sceneStore.activeCamera.position.z);

            this.sceneStore.renderer.render(this.sceneStore.scene, this.sceneStore.activeCamera);

            if (this.temp.outlineTimer) {
                clearTimeout(this.temp.outlineTimer);
                delete this.temp.outlineTimer;
            }

            this.temp.outlineTimer = setTimeout(() => {
                this.sceneStore.renderer.render(this.sceneStore.scene, this.sceneStore.activeCamera);
                this.sceneStore.outlineEffectRenderer.renderOutline(this.sceneStore.scene, this.sceneStore.activeCamera);
            }, 100);

            this.stats.update();

            if (this.isTransformWorking) {
                requestAnimationFrame(_animate);
            }
        }

        requestAnimationFrame(_animate);
    }
    dev() {
        let _this = this;

        SceneHelper.File3DLoad(url.format({
            pathname: path.join(dirname, '../test.stl'),
            protocol: 'file:',
            slashes: true,
        }), function (geometry: BufferGeometry) {
            let obj = new SceneObject(geometry, 'test.stl', _this.sceneStore.objects, true);
            obj.AlignToPlaneXZ(_this.sceneStore.gridSize);
            obj.AlignToPlaneY();
            obj.AddToScene(_this.sceneStore.scene);
            Dispatch(EventEnum.ADD_OBJECT, obj);
            _this.animate();

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
    }
}