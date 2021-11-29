export enum WorkerType {
    'SliceLayerScene'
}

export class Job
{
    name: WorkerType;

    onResult: (data: any) => void;
    onState: (data: any) => boolean | void;

    constructor(name: WorkerType, onResult: (data: any) => void, onState: (percent: number) => boolean | void)
    {
        this.onResult = onResult;
        this.onState = onState;
        this.name = name;
    }
}