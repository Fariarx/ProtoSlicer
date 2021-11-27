import {Job} from "./Job";

import {Mesh, Scene} from "three";
import {calculateVoxelSizes, slice, SliceResult} from "../../Utils/Slice";
import {sceneStore} from "../../Scene/SceneStore";
import {Printer} from "../../Configs/Printer";
import Jimp from "jimp";
import {SceneObject} from "../../Scene/SceneObject";

export class JobSliceFullScene extends Job
{
    constructor(onResult: (sliceResult: SliceResult[]) => void, onState: (percent: number) => boolean | void)
    {
        super(onResult, onState);
    }

    start() {
        let thisObj = this;

        const voxelSizes = calculateVoxelSizes(sceneStore.printer as Printer);
        const maxSize = SceneObject.CalculateGroupMaxSize(sceneStore.objects);
        const numLayers = Math.ceil(maxSize.y / voxelSizes.voxelSizeY);

        let index = 0;

        let result: SliceResult[] = [];

        let sliceNext = () => {
            slice(sceneStore.printer as Printer, index).then((sliceResult : SliceResult)=>{
                index++;

                if(sliceResult.voxelDrawCount > 0)
                {
                    result.push(sliceResult);
                }

                if(thisObj.onState(index / numLayers) === true)
                {
                    thisObj.onResult({
                        cancel:true
                    });
                    return;
                }

                if(index < numLayers) {
                    sliceNext();
                }
                else {
                    thisObj.onResult(result);
                }
            });
        }


        this.onState(index / numLayers);

        sliceNext();
    }
}


window.self.addEventListener('message', function(e) {
    e.data.instance.start();
}, false);