import {observable, runInAction} from "mobx";
import { TransformInstrumentEnum} from "../Scene/ChildrenUI/SceneTransformBar";
import {ElementStepsSelect, StepsEnum} from "../Steps";
import {
    sceneStore,
    SceneUtils
} from "../Scene/SceneStore";
import {SceneObject} from "../Scene/Entities/SceneObject";
import {Settings} from "../../Globals";
import {MoveObject} from "./Entities/MoveObject";

export enum EventEnum {
    SELECT_TRANSFORM_MODE,
    SELECT_MENU_STEP,
    ADD_OBJECT,
    SELECTION_CHANGED,
    TRANSFORM_OBJECT,
    SELECT_SUPPORTS_MODE
}

type Message = {
    name:   EventEnum,
    args:   object | undefined,
    last:   any
}

const eventList = new Array<Message>();

export const Dispatch = (name: EventEnum, args?: object) => {
    let message = {
        name:name,
        args:args ?? undefined
    } as Message;

    if(Handler(message)) {
        eventList.push(message);
    }
}

const Handler = (message) => {
    switch (message.name) {
        case EventEnum.SELECT_TRANSFORM_MODE:
            message.last = sceneStore.transformInstrumentState;

            if (sceneStore.transformInstrumentState === message.args.value) {
                SceneUtils.instrumentStateChanged();
            } else {
                SceneUtils.instrumentStateChanged(message.args.value);
            }
            break;
        case EventEnum.TRANSFORM_OBJECT:
            let moveObject = message.args as MoveObject;
            let mesh = moveObject.sceneObject instanceof SceneObject ? moveObject.sceneObject.mesh : moveObject.sceneObject;

            moveObject.to = moveObject.to.clone();
            moveObject.from = moveObject.from.clone();

            if(!moveObject.actionBreak) {
                if(!moveObject.instrument) {
                    moveObject.instrument = sceneStore.transformInstrumentState;
                }

                switch (moveObject.instrument) {
                    case TransformInstrumentEnum.Move:
                        mesh.position.set(moveObject.to.x, moveObject.to.y, moveObject.to.z);
                        break;
                    case TransformInstrumentEnum.Rotate:
                        mesh.rotation.set(moveObject.to.x, moveObject.to.y, moveObject.to.z);
                        break;
                    case TransformInstrumentEnum.Scale:
                        let minScale = Settings().scene.sharpness;

                        if(moveObject.to.x < minScale)
                        {
                            moveObject.to.x = minScale;
                        }
                        if(moveObject.to.y < minScale)
                        {
                            moveObject.to.y = minScale;
                        }
                        if(moveObject.to.z < minScale)
                        {
                            moveObject.to.z = minScale;
                        }

                        mesh.scale.set(moveObject.to.x, moveObject.to.y, moveObject.to.z);
                        break;
                }

                if(moveObject.sceneObject === sceneStore.transformObjectGroup)
                {
                    sceneStore.transformObjectGroupOld.position.set(
                        sceneStore.transformObjectGroup.position.x,
                        sceneStore.transformObjectGroup.position.y,
                        sceneStore.transformObjectGroup.position.z,
                    );
                    sceneStore.transformObjectGroupOld.rotation.set(
                        sceneStore.transformObjectGroup.rotation.x,
                        sceneStore.transformObjectGroup.rotation.y,
                        sceneStore.transformObjectGroup.rotation.z,
                    );
                    sceneStore.transformObjectGroupOld.scale.set(
                        sceneStore.transformObjectGroup.scale.x,
                        sceneStore.transformObjectGroup.scale.y,
                        sceneStore.transformObjectGroup.scale.z,
                    );
                }
            }

            //console.log(moveObject);

            if(!moveObject.renderBreak)
            {
                SceneUtils.updateFrame();
            }

            SceneUtils.updateTransformTool();
            break;
        case EventEnum.ADD_OBJECT:
            sceneStore.objects.push(message.args);
            SceneUtils.selectionChanged();
            SceneUtils.instrumentStateChanged();
            break;
    }
    return true;
}
