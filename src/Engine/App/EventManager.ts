import {observable, runInAction} from "mobx";
import {ElementSceneTransformSelect, TransformInstrumentEnum} from "./Scene/SceneTransform";
import {ElementStepsSelect, StepsEnum} from "./Steps";

export enum EventEnum {
    SELECT_TRANSFORM_MODE,
    SELECT_MENU_STEP
}

type Message = {
    name:EventEnum,
    args:object | undefined
}

const EventList = observable(new Array<Message>());

export const Dispatch = (name: EventEnum, args?: object) =>
{
    let message = {
        name:name,
        args:args ?? undefined
    } as Message;

    if(Handler(message)) {
        EventList.push(message);
    }
}

const Handler = (message)=> {
    switch (message.name) {
        case EventEnum.SELECT_TRANSFORM_MODE:
            runInAction(()=>{
                if (ElementSceneTransformSelect.name === message.args.value) {
                    ElementSceneTransformSelect.name = TransformInstrumentEnum.None;
                } else {
                    ElementSceneTransformSelect.name = message.args.value;
                }
            })
            break;
        case EventEnum.SELECT_MENU_STEP:
            runInAction(()=>{
                ElementStepsSelect.name = message.args.value;
            })
            break;
    }
    return true;
}
