export class Job
{
    onResult: (data: any) => void;

    constructor(onResult: (data: any) => void)
    {
        this.onResult = onResult;
    }
}