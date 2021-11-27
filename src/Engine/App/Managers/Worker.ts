import {Job} from "./Entities/Job";

export {};

export let isWorking = false;

const jobList: Array<Job> = [];

export let addJob = (job: Job) =>
{
    jobList.push(job);

    let worker = new Worker('./src/Engine/App/Managers/Entities/' + job.constructor.name + '.ts');

    let onResultHook = job.onResult;

    job.onResult = (data: any) => {
        jobList.splice(0, 1);

        if(jobList.length !== 0)
        {
            jobList[0].worker?.postMessage({ instance:jobList[0] });
            isWorking = true;
        }
        else {
            isWorking = false;
        }

        worker.terminate();

        return onResultHook(data);
    }

    if(!isWorking)
    {
        worker.postMessage({ instance:job });
        isWorking = true;
    }

    job.worker = worker;
}