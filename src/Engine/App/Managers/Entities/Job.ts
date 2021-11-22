export class Job
{
    onResult: () => void;

    constructor(onResult: () => void)
    {
        this.onResult = onResult;
    }
}