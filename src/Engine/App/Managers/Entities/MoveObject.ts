import {TransformInstrumentEnum} from "../../Scene/ChildrenUI/SceneTransformBar";
import {SceneObject} from "../../Scene/Entities/SceneObject";
import {Euler, Vector3} from "three";
import * as THREE from 'three'

export type MoveObject = {
    instrument?: TransformInstrumentEnum,
    from: Vector3 | Euler,
    to: Vector3 | Euler,
    sceneObject: SceneObject | THREE.Object3D,
    actionBreak: true | undefined,
    renderBreak: true | undefined,
    id: number | undefined,
}