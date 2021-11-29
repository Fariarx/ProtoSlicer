export enum WorkerType {
    SliceLayerScene,
    SliceFullScene
}

export type JobSliceOneLayerOptions =
{
    layerNum: number
}


export class Job
{
    name: WorkerType;

    data: any;

    onResult: (data: any) => void;
    onState: (data: any) => boolean | void;

    constructor(name: WorkerType, onResult: (data: any) => void, onState: (percent: number) => boolean | void, _data?: JobSliceOneLayerOptions)
    {
        this.onResult = onResult;
        this.onState = onState;
        this.name = name;
        this.data = _data ? _data : {};
    }
}