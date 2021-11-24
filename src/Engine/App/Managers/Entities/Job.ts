export abstract class Job
{
    onResult: (data: any) => void;
    onState: (data: any) => boolean | void;

    protected constructor(onResult: (data: any) => void, onState: (percent: number) => boolean | void)
    {
        this.onResult = onResult;
        this.onState = onState;
    }

    start () {
        this.onResult({ null: null });
    }
}