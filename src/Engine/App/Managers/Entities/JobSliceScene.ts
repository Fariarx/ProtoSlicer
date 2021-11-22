import {Job} from "./Job";

export class JobSliceScene extends Job
{
    constructor(onResult: () => void)
    {
        super(onResult);
    }
}