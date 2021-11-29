import {Job} from "./Entities/Job";

import { wrap, proxy  } from 'comlink';

import SliceLayerScene from './Entities/SliceLayerScene.worker';
import SliceFullScene from './Entities/SliceFullScene.worker';

import {sceneStore} from "../Scene/SceneStore";
import {Printer} from "../Configs/Printer";
import {SceneObject} from "../Scene/SceneObject";
import {calculateVoxelSizes, SliceResult} from "../Utils/Slice";
import {Settings} from "../../Globals";
import * as THREE from "three";
import {Vector3} from "three";

export {};

export let isWorking = false;

const jobList: Array<Job> = [];

export let addJob = (job: Job) =>
{
    jobList.push(job);

    if(!isWorking)
    {
        let printer = sceneStore.printer as Printer;
        printer.workerData = {};
        printer.workerData.gridSize = sceneStore.gridSize;

        printer.workerData.geometry = SceneObject.CalculateGeometry(sceneStore.objects);
        printer.workerData.geometry.computeBoundsTree();
        printer.workerData.geometrySize = new Vector3();

        new THREE.Box3().setFromObject(new THREE.Mesh(printer.workerData.geometry)).getSize(printer.workerData.geometrySize);

        printer.workerData.voxelSize = calculateVoxelSizes(sceneStore.printer as Printer);

        let maxLayers = Math.ceil((printer.workerData.geometrySize.y / printer.workerData.voxelSize.voxelSizeY));

        let workerCountMax = Settings().workerCount;
        let workerCountNow = 0;

        let layerIteratorFromThread = 0;
        let layerIterator = 0;
        let layersInterval = 30;

        let result: SliceResult[] = [];

        let _printer = JSON.stringify(sceneStore.printer);
 
        let runWorker = (startLayerNum, stopLayerNum) => {
            let instance: Worker = new SliceFullScene();
            let instanceApi: any = wrap(instance);

            (async () => {
                await instanceApi.onStateSetup(proxy((percent: string)=>{
                    job.onState(++layerIteratorFromThread / (maxLayers + 2));
                }))
            })();


            instanceApi.sliceLayer(_printer, startLayerNum, stopLayerNum).then((arr: SliceResult[])=> {
                workerCountNow--;

                result = [...result, ...arr];

                instanceApi = null;
                instance.terminate();

                //console.log(layerIterator, maxLayers)
                //console.log(result)
                //console.log(workerCountNow)

                updateWorkers();

                if (layerIterator >= maxLayers && workerCountNow <= 0) {
                    job.onResult(result);
                }
                return;

                //console.log(Date.now() - date )
            });
        }

        let updateWorkers = () => {
            while (workerCountNow < workerCountMax)
            {
                if(layerIterator === maxLayers)
                {
                    break;
                }

                let startNum = layerIterator;

                layerIterator += layersInterval;

                if(layerIterator >= maxLayers)
                {
                    layerIterator = maxLayers;
                    runWorker(startNum, maxLayers);
                    workerCountNow++;
                    break;
                }
                else {
                    runWorker(startNum, layerIterator - 1);
                }

                workerCountNow++;
            }
        }

        updateWorkers();

        isWorking = true;
    }
}