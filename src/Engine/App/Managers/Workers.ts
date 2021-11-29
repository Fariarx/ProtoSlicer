import {Job, WorkerType} from "./Entities/Job";

import {proxy, wrap} from 'comlink';

import workerSliceFullScene from './Entities/SliceFullScene.worker';
import workerSliceLayerScene from './Entities/SliceLayerScene.worker';

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
    if(!isWorking)
    {
        isWorking = true;

        switch (job.name)
        {
            case WorkerType.SliceLayerScene:
                _sliceSingleLayer(job, finishJob, job.data.layerNum);
                break;
            case WorkerType.SliceFullScene:
                _sliceFullScene(job, finishJob);
                break;
        }
    }
    else
    {
        jobList.push(job);
    }
}

const finishJob = () => {
    isWorking = false;

    if(jobList.length > 0)
    {
        addJob(jobList[0]);
        jobList.splice(0, 1);
    }
}

let _sliceFullScene = (job: Job, finish: () => void) => {
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
    let layersInterval = 100;

    let result: SliceResult[] = [];

    let printerJson = JSON.stringify(sceneStore.printer);

    //let date = Date.now();

    let runWorker = (startLayerNum, stopLayerNum) => {
        let instance: Worker = new workerSliceFullScene();
        let instanceApi: any = wrap(instance);

        (async () => {
            await instanceApi.onStateSetup(proxy((percent: string)=>{
                job.onState(++layerIteratorFromThread / (maxLayers + 2));
            }))
        })();


        instanceApi.sliceLayers(printerJson, startLayerNum, stopLayerNum).then((arr: SliceResult[])=> {
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
                finish();
                //console.log(Date.now() - date )
            }
            return;

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
}
let _sliceSingleLayer = (job: Job, finish: () => void, layerNum: number) => {
    let printer = sceneStore.printer as Printer;
    printer.workerData = {};
    printer.workerData.gridSize = sceneStore.gridSize;
    printer.workerData.geometry = SceneObject.CalculateGeometry(sceneStore.objects);
    printer.workerData.geometry.computeBoundsTree();
    printer.workerData.voxelSize = calculateVoxelSizes(sceneStore.printer as Printer);


    let printerJson = JSON.stringify(sceneStore.printer);

    let instance: Worker = new workerSliceLayerScene();
    let instanceApi: any = wrap(instance);

    instanceApi.sliceLayer(printerJson, layerNum).then((sliceResult: SliceResult)=> {
        job.onResult(sliceResult);
        finish();
    });
}