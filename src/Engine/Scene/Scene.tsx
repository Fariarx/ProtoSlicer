import React, {Component } from "react";
import ReactDOM from "react-dom";
import 'semantic-ui-css/semantic.min.css'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import {Printer} from "../Configs/Printer";
import * as SceneHelper from "./SceneHelper";
import {Log, Materials} from "../Globals";
import DragAndDropModal from "./SceneDragAndDropModal";
import {File3DLoad} from "./SceneHelper";
import {BufferGeometry} from "three";

export default this;

export class Scene extends Component<any, any> {
    mount: any;
    material: any;

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        var thisObj = this;

        this.material = Materials.def;

        // BASIC THREE.JS THINGS: SCENE, CAMERA, RENDERER
        // Three.js Creating a scene tutorial
        // https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        var renderer = new THREE.WebGLRenderer({
            antialias:true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);

        function setupDragDrop() {
            var holder = renderer.domElement;

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
 

                            scene.add( mesh );
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

        const controls = new OrbitControls( camera, renderer.domElement );

        /*    orb.target.set( size.x / 2,size.z / 2, size.y * 2);
            orb.update();*/

        let axes: THREE.Object3D = SceneHelper.CreateAxesHelper(scene);

        let gridVec = new THREE.Vector3(10,7, 15);
        let grid: SceneHelper.Grid = SceneHelper.CreateGrid(gridVec, scene );
        camera.position.set(gridVec.x / 2, gridVec.z, gridVec.y * 2); // Set position like this
        controls.target = new THREE.Vector3(gridVec.x/ 2, 0 ,gridVec.y/2);
        controls.update();

        // MOUNT INSIDE OF REACT
        this.mount.appendChild(renderer.domElement); // mount a scene inside of React using a ref



        // ADD CUBE AND LIGHTS
        // https://threejs.org/docs/index.html#api/en/geometries/BoxGeometry
        // https://threejs.org/docs/scenes/geometry-browser.html#BoxGeometry
        /*var geometry = new THREE.BoxGeometry(2, 2, 2);
        var material = new THREE.MeshPhongMaterial( {
            color: 0x156289,
            emissive: 0x072534,
            side: THREE.DoubleSide,
            flatShading: true
        } );
        var cube = new THREE.Mesh(geometry, material);*/
        //scene.add(cube);

        const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.7 );
        directionalLight.castShadow = true;
        scene.add( directionalLight );

        scene.background = new THREE.Color( "#eceaea" );

        // SCALE ON RESIZE

        // Check "How can scene scale be preserved on resize?" section of Three.js FAQ
        // https://threejs.org/docs/index.html#manual/en/introduction/FAQ

        // code below is taken from Three.js fiddle
        // http://jsfiddle.net/Q4Jpu/

        // remember these initial values
        var tanFOV = Math.tan( ( ( Math.PI / 180 ) * camera.fov / 2 ) );
        var windowHeight = window.innerHeight;

        window.addEventListener( 'resize', onWindowResize, false );

        function onWindowResize( event ) {

            camera.aspect = window.innerWidth / window.innerHeight;

            // adjust the FOV
            camera.fov = ( 360 / Math.PI ) * Math.atan( tanFOV * ( window.innerHeight / windowHeight ) );

            camera.updateProjectionMatrix();
            camera.lookAt( scene.position );

            renderer.setSize( window.innerWidth, window.innerHeight );
            renderer.render( scene, camera );

        }

        // ANIMATE THE SCENE
        var animate = function() {
            requestAnimationFrame(animate);

            //cube.rotation.x += 0.01;
           // cube.rotation.y += 0.01;

            grid.mat.resolution.set( window.innerWidth, window.innerHeight );

            renderer.clearDepth(); // important!

            renderer.render(scene, camera);
            //Log(camera.rotation.x + " " + camera.rotation.y + " " + camera.rotation.z);
        };

        animate();

        Log("Scene loaded!");
    }
    render() {
        return <div ref={ref => (this.mount = ref)} style={{
            position:"fixed"
        }}>
        </div>;
    }
}
