import {observable, runInAction} from "mobx";
import { TransformInstrumentEnum} from "./Scene/SceneTransform";
import {ElementStepsSelect, StepsEnum} from "./Steps";
import {sceneStore, sceneStoreInstrumentStateChanged, sceneStoreSelectionChanged} from "./Scene/SceneStore";

export enum EventEnum {
    SELECT_TRANSFORM_MODE,
    SELECT_MENU_STEP,
    ADD_OBJECT
}

type Message = {
    name:   EventEnum,
    args:   object | undefined,
    last:   any
}

const EventList = observable(new Array<Message>());

export const Dispatch = (name: EventEnum, args?: object) => {
    let message = {
        name:name,
        args:args ?? undefined
    } as Message;

    if(Handler(message)) {
        EventList.push(message);
    }
}

const Handler = (message) => {
    switch (message.name) {
        case EventEnum.SELECT_TRANSFORM_MODE:
            message.last = sceneStore.transformInstrumentState;

            if (sceneStore.transformInstrumentState === message.args.value) {
                sceneStoreInstrumentStateChanged();
            } else {
                sceneStoreInstrumentStateChanged(message.args.value);
            }
            break;
        case EventEnum.ADD_OBJECT:
            sceneStore.objects.push(message.args);
            sceneStoreSelectionChanged();
            sceneStoreInstrumentStateChanged();
            break;
        case EventEnum.SELECT_MENU_STEP:
            /*runInAction(()=>{
                ElementStepsSelect.name = message.args.value;
            })*/
            break;
    }
    return true;
}
