import {observable, runInAction} from "mobx";
import { TransformInstrumentEnum} from "./Scene/SceneTransform";
import {ElementStepsSelect, StepsEnum} from "./Steps";
import {
    sceneStore,
    sceneStoreInstrumentStateChanged,
    sceneStoreSelectionChanged,
    sceneStoreUpdateFrame, sceneStoreUpdateTransformTool
} from "./Scene/SceneStore";
import {Euler, Vector3} from "three";
import {SceneObject} from "./Scene/SceneObject";
import {Settings} from "../Globals";

export type MoveObject = {
    instrument?: TransformInstrumentEnum,
    from: Vector3 | Euler,
    to: Vector3 | Euler,
    sceneObject: SceneObject | THREE.Object3D,
    actionBreak: true | undefined,
    id: number | undefined,
}
export enum EventEnum {
    SELECT_TRANSFORM_MODE,
    SELECT_MENU_STEP,
    ADD_OBJECT,
    TRANSFORM_OBJECT
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

            sceneStoreUpdateFrame();
            sceneStoreUpdateTransformTool();
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
