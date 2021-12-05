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
import {Mesh} from "three";


type Message = {
    name:   EventEnum,
    args:   object | undefined,
    last:   any
}
export enum EventEnum {
    SELECT_TRANSFORM_MODE,
    SELECT_MENU_STEP,
    ADD_OBJECT,
    SELECTION_CHANGED,
    TRANSFORM_OBJECT,
    SELECT_SUPPORTS_MODE
}

const eventList = new Array<Message>();
const eventListeners: ((message: EventEnum, args?: object) => void)[] = [];

export namespace AppEvents {
    export const Dispatch = (name: EventEnum, args?: object) => {
        let message = {
            name:name,
            args:args ?? undefined
        } as Message;

        for(let index = 0; index < eventListeners.length; index++)
        {
            eventListeners[index](message.name, message.args);
        }

        if(Handler(message)) {
            eventList.push(message);
        }
    }

    const Handler = (message) => {
        switch (message.name) {
            case EventEnum.SELECT_SUPPORTS_MODE:
                if (sceneStore.supportsInstrumentState === message.args.mode) {
                    SceneUtils.supportsInstrumentStateChanged();
                } else {
                    SceneUtils.supportsInstrumentStateChanged(message.args.mode);
                }
                break;
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
                let mesh: Mesh = moveObject.sceneObject instanceof SceneObject ? moveObject.sceneObject.mesh : <Mesh>moveObject.sceneObject;
                let sceneObj = SceneObject.SearchSceneObjByMesh(sceneStore.objects, mesh);

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

                            if(sceneObj)
                            {
                                message.args.deletedSupports = {
                                    sceneObj: sceneObj,
                                    supports: sceneObj.supports
                                }

                                for(let obj of sceneObj.supports)
                                {
                                    sceneStore.scene.remove(obj.group);
                                }

                                sceneObj.supports = [];
                            }
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

    export const AddListener = (listener: (message: EventEnum, args?: object) => void) => {
        eventListeners.push(listener);
        return listener;
    }
    export const DeleteListener = (listener: object) => {
        for(let index = 0; index < eventListeners.length; index++)
        {
            if(eventListeners[index] === listener)
            {
                eventListeners.splice(Number(index), 1);
                index--;
            }
        }
    }
}