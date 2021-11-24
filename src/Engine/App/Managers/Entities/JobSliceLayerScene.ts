import {Job} from "./Job";

import {Mesh, Scene} from "three";
import {slice, SliceResult} from "../../Utils/Slice";
import {sceneStore} from "../../Scene/SceneStore";
import {Printer} from "../../Configs/Printer";
import Jimp from "jimp";
import _ from 'lodash'

export class JobSliceLayerScene extends Job
{
    numLayer: number;

    constructor(onResult: (sliceResult: SliceResult) => void, numLayer: number)
    {
        super(onResult, _.noop);
        this.numLayer = numLayer;
    }

    start() {
        slice(sceneStore.printer as Printer, this.numLayer).then((sliceResult : SliceResult)=>{
            this.onResult(sliceResult);
        });
    }
}