import {Job} from "./Entities/Job";

export {};

export let isWorking = false;

const jobList: Array<Job> = [];

export let addJob = (job: Job) =>
{
    jobList.push(job);

    let onResultHook = job.onResult;

    job.onResult = (data: any) => {
        jobList.splice(0, 1);

        if(jobList.length !== 0)
        {
            jobList[0].start();
            isWorking = true;
        }
        else {
            isWorking = false;
        }

        return onResultHook(data);
    }

    if(!isWorking)
    {
        job.start();
        isWorking = true;
    }
}