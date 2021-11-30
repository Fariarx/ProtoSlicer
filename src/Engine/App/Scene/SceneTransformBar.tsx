import {Button, Card, Header, Icon, Input, Label, List, Menu, Segment, SegmentGroup} from "semantic-ui-react";
import {SaveSettings, Settings} from "../../Globals";
import React, {Component, RefObject} from "react";
import {inject, observer} from "mobx-react";
import {autorun, observable, runInAction} from "mobx";
import {Dispatch, EventEnum } from "../Managers/Events";
import {
    sceneStore,
    sceneStoreSelectionChanged,
    sceneStoreSelectObjsAlignXZ,
    sceneStoreSelectObjsAlignY,
    sceneStoreSelectObjsResetRotation,
    sceneStoreSelectObjsResetScale,
    sceneStoreUpdateFrame, sceneStoreUpdateTransformControls
} from "./SceneStore";
import {MathUtils, Vector3} from "three";
import {isFloat, isNumeric, LinearGenerator} from "../Utils/Utils";
import {SceneTransformInput} from "./SceneTransformInput";
import {SceneObject} from "./SceneObject";
import {MoveObject} from "../Managers/Entities/MoveObject";

export enum TransformInstrumentEnum {
    None = 0,
    Move = "translate",
    Rotate = 'rotate',
    Scale = 'scale'
}

const MenuItemStyleCenter = {marginLeft: 'auto', marginRight: 'auto', display: 'block'};


@observer
class SceneTransformBar extends Component<any, any> {
    handleItemClick = (e, obj) => {
        Dispatch(EventEnum.SELECT_TRANSFORM_MODE, {value: TransformInstrumentEnum[obj.name]});
    }

    render() {
        let instrumentEnum = sceneStore.transformInstrumentState;
        let instrumentMenu = <div/>;
        let selectObj = sceneStore.sceneStoreGetSelectObj;

        if (sceneStore.needUpdateTransformTool) {
            runInAction(() => {
                sceneStore.needUpdateTransformTool = false;
            })
        }

        let buttonAlignY = <Button inverted size={"tiny"} compact active={Settings().scene.transformAlignToPlane}
                                   color={Settings().scene.transformAlignToPlane ? 'teal' : undefined} onClick={() => {
            Settings().scene.transformAlignToPlane = !Settings().scene.transformAlignToPlane;
            SaveSettings();

            if (Settings().scene.transformAlignToPlane) {
                sceneStoreSelectObjsAlignY();
            }

            this.setState({});
        }}>
            <Button.Content>AlignZ</Button.Content>
        </Button>;

        switch (instrumentEnum) {
            case TransformInstrumentEnum.Move:
                instrumentMenu =
                    <SegmentGroup size={"tiny"} color='black' style={{
                        width: '100%',
                        height: 'auto',
                        marginTop: '1vmin'
                    }}>
                        <Segment inverted>
                            <Header as='h4'>
                                {instrumentEnum[0].toUpperCase() + instrumentEnum.slice(1)}
                            </Header>
                        </Segment>
                        <Segment inverted>
                            <div style={{
                                width: '100%',
                                height: 'auto',
                                overflow: "auto",
                                //backgroundColor:'red'
                            }}>
                                <div style={{
                                    width: 'auto',
                                    height: 'auto',
                                    //backgroundColor:'blue'
                                }}>
                                    <List>
                                        <List.Item>
                                            <SceneTransformInput
                                                selectObj={selectObj}
                                                unitsText={'cm'}
                                                axisColor={'red'}
                                                axisText={'X'}
                                                updateValue={() => Number(selectObj?.position.x).toFixed(2)}
                                                setValue={(number) => {
                                                    if (!selectObj) return;

                                                    let difference = selectObj?.position.x - number;
                                                    let id = LinearGenerator();

                                                    for (let sceneObject of sceneStore.groupSelected) {
                                                        let oldPosition = sceneObject.mesh.position.clone();
                                                        let newPosition = sceneObject.mesh.position.clone();

                                                        newPosition.x -= difference;

                                                        Dispatch(EventEnum.TRANSFORM_OBJECT, {
                                                            from: oldPosition,
                                                            to: newPosition,
                                                            sceneObject: sceneObject,
                                                            id: id
                                                        } as MoveObject)
                                                    }

                                                    Dispatch(EventEnum.TRANSFORM_OBJECT, {
                                                        from: selectObj?.position.clone(),
                                                        to: selectObj?.position.setX(number),
                                                        sceneObject: selectObj,
                                                        id: id
                                                    } as MoveObject)
                                                }}
                                            />
                                        </List.Item>
                                        <List.Item>
                                            <SceneTransformInput
                                                selectObj={selectObj}
                                                unitsText={'cm'}
                                                axisColor={'blue'}
                                                axisText={'Y'}
                                                updateValue={() => Number(selectObj?.position.z).toFixed(2)}
                                                setValue={(number) => {
                                                    if (!selectObj) return;

                                                    let difference = selectObj?.position.z - number;
                                                    let id = LinearGenerator();

                                                    for (let sceneObject of sceneStore.groupSelected) {
                                                        let oldPosition = sceneObject.mesh.position.clone();
                                                        let newPosition = sceneObject.mesh.position.clone();

                                                        newPosition.z -= difference;

                                                        Dispatch(EventEnum.TRANSFORM_OBJECT, {
                                                            from: oldPosition,
                                                            to: newPosition,
                                                            sceneObject: sceneObject,
                                                            id: id
                                                        } as MoveObject)
                                                    }

                                                    Dispatch(EventEnum.TRANSFORM_OBJECT, {
                                                        from: selectObj?.position.clone(),
                                                        to: selectObj?.position.setZ(number),
                                                        sceneObject: selectObj,
                                                        id: id
                                                    } as MoveObject)
                                                }}
                                            />
                                        </List.Item>
                                        <List.Item>
                                            <SceneTransformInput
                                                selectObj={selectObj}
                                                unitsText={'cm'}
                                                axisColor={'green'}
                                                axisText={'Z'}
                                                updateValue={() => Number(selectObj?.position.y).toFixed(2)}
                                                setValue={(number) => {
                                                    if (!selectObj) return;

                                                    let difference = selectObj?.position.y - number;
                                                    let id = LinearGenerator();

                                                    for (let sceneObject of sceneStore.groupSelected) {
                                                        let oldPosition = sceneObject.mesh.position.clone();
                                                        let newPosition = sceneObject.mesh.position.clone();

                                                        newPosition.y -= difference;

                                                        Dispatch(EventEnum.TRANSFORM_OBJECT, {
                                                            from: oldPosition,
                                                            to: newPosition,
                                                            sceneObject: sceneObject,
                                                            id: id
                                                        } as MoveObject)
                                                    }

                                                    Dispatch(EventEnum.TRANSFORM_OBJECT, {
                                                        from: selectObj?.position.clone(),
                                                        to: selectObj?.position.setY(number),
                                                        sceneObject: selectObj,
                                                        id: id
                                                    } as MoveObject)

                                                    if (Settings().scene.transformAlignToPlane) {
                                                        sceneStoreSelectObjsAlignY();
                                                    }
                                                }}
                                            />
                                        </List.Item>
                                    </List>
                                </div>
                            </div>
                        </Segment>
                        <Segment inverted size={"mini"}>
                            <Button size={"tiny"} inverted compact onClick={() => {
                                sceneStoreUpdateTransformControls();
                                sceneStoreSelectObjsAlignXZ();
                                this.setState({});
                            }}>
                                <Button.Content>Center</Button.Content>
                            </Button>
                            {buttonAlignY}
                        </Segment>
                    </SegmentGroup>
                break;
            case TransformInstrumentEnum.Rotate:
                instrumentMenu =
                    <SegmentGroup size={"tiny"} color='black' style={{
                        width: '100%',
                        height: 'auto',
                        marginTop: '1vmin'
                    }}>
                        <Segment inverted>
                            <Header as='h4'>
                                {instrumentEnum[0].toUpperCase() + instrumentEnum.slice(1)}
                            </Header>
                        </Segment>
                        <Segment inverted>
                            <div style={{
                                width: '100%',
                                height: 'auto',
                                overflow: "auto",
                                //backgroundColor:'red'
                            }}>
                                <div style={{
                                    width: 'auto',
                                    height: 'auto',
                                    //backgroundColor:'blue'
                                }}>
                                    <List>
                                        <List.Item>
                                            <SceneTransformInput
                                                updateValue={() => selectObj ? Number(MathUtils.radToDeg(selectObj.rotation.x)).toFixed(2) : undefined}
                                                setValue={(number) => {
                                                    selectObj?.rotation.set(MathUtils.degToRad(number), selectObj?.rotation.y, selectObj?.rotation.z)
                                                }}
                                                selectObj={selectObj}
                                                unitsText={'deg'}
                                                axisColor={'red'}
                                                axisText={'X'}
                                            />
                                        </List.Item>
                                        <List.Item>
                                            <SceneTransformInput
                                                updateValue={() => selectObj ? Number(MathUtils.radToDeg(selectObj.rotation.z)).toFixed(2) : undefined}
                                                setValue={(number) => {
                                                    selectObj?.rotation.set(selectObj?.rotation.x, selectObj?.rotation.y, MathUtils.degToRad(number))
                                                }}
                                                selectObj={selectObj}
                                                unitsText={'deg'}
                                                axisColor={'blue'}
                                                axisText={'Y'}
                                            />
                                        </List.Item>
                                        <List.Item>
                                            <SceneTransformInput
                                                updateValue={() => selectObj ? Number(MathUtils.radToDeg(selectObj.rotation.y)).toFixed(2) : undefined}
                                                setValue={(number) => {
                                                    selectObj?.rotation.set(selectObj?.rotation.x, MathUtils.degToRad(number), selectObj?.rotation.z)
                                                }}
                                                selectObj={selectObj}
                                                unitsText={'deg'}
                                                axisColor={'green'}
                                                axisText={'Z'}
                                            />
                                        </List.Item>
                                    </List>
                                </div>
                            </div>
                        </Segment>
                        <Segment inverted>
                            <Button inverted size={"tiny"} compact onClick={() => {
                                sceneStoreSelectObjsResetRotation();

                                if (Settings().scene.transformAlignToPlane) {
                                    sceneStoreSelectObjsAlignY();
                                }

                                this.setState({});
                            }}>
                                <Button.Content>Reset</Button.Content>
                            </Button>
                            {buttonAlignY}
                        </Segment>
                    </SegmentGroup>
                break;
            case TransformInstrumentEnum.Scale:
                instrumentMenu =
                    <SegmentGroup size={"tiny"} style={{
                        width: '100%',
                        height: 'auto',
                        marginTop: '1vmin'
                    }}>
                        <Segment inverted>
                            <Header as='h4'>
                                {instrumentEnum[0].toUpperCase() + instrumentEnum.slice(1)}
                            </Header>
                        </Segment>
                        <Segment inverted>
                            <div style={{
                                width: '100%',
                                height: 'auto',
                                overflow: "auto",
                                //backgroundColor:'red'
                            }}>
                                <div style={{
                                    width: 'auto',
                                    height: 'auto',
                                    //backgroundColor:'blue'
                                }}>
                                    <List>
                                        <List.Item>
                                            <SceneTransformInput
                                                updateValue={() => selectObj ? Number(SceneObject.CalculateGroupMaxSize(sceneStore.groupSelected).x).toFixed(2) : undefined}
                                                setValue={(number) => {
                                                    if (!selectObj) {
                                                        return;
                                                    }

                                                    let diff, defSharpness = Settings().scene.sharpness, sharpness,
                                                        iterations = 0;
                                                    let maxSize = SceneObject.CalculateGroupMaxSize(sceneStore.groupSelected);

                                                    if (maxSize.x === number || number < defSharpness) {
                                                        return;
                                                    }

                                                    let scaleObjects = sceneStore.groupSelected.map((t, i) => {
                                                        return t.mesh.scale.clone();
                                                    });

                                                    if (maxSize.x < number) {
                                                        while (maxSize.x < number) {
                                                            diff = Math.abs(number - maxSize.x);
                                                            sharpness = .01 * diff + defSharpness;

                                                            for (let sceneObject of sceneStore.groupSelected) {
                                                                sceneObject.mesh.scale.setX(sceneObject.mesh.scale.x + sharpness);
                                                                sceneObject.UpdateSize();
                                                            }

                                                            maxSize = SceneObject.CalculateGroupMaxSize(sceneStore.groupSelected);

                                                            iterations++;

                                                            if (iterations > 499) {
                                                                console.log("iteration of scale error");
                                                                break;
                                                            }
                                                        }
                                                    } else if (maxSize.x > number) {
                                                        while (maxSize.x > number) {
                                                            diff = Math.abs(number - maxSize.x);
                                                            sharpness = .01 * diff + defSharpness;

                                                            for (let sceneObject of sceneStore.groupSelected) {
                                                                sceneObject.mesh.scale.setX(sceneObject.mesh.scale.x - sharpness);
                                                                sceneObject.UpdateSize();
                                                            }

                                                            maxSize = SceneObject.CalculateGroupMaxSize(sceneStore.groupSelected);

                                                            iterations++;

                                                            if (iterations > 499) {
                                                                console.log("iteration of scale error");
                                                                break;
                                                            }
                                                        }
                                                    }


                                                    let id = LinearGenerator();

                                                    sceneStore.groupSelected.every((t, i) => {
                                                        Dispatch(EventEnum.TRANSFORM_OBJECT, {
                                                            from: scaleObjects[i],
                                                            to: selectObj?.scale,
                                                            sceneObject: selectObj,
                                                            actionBreak: true,
                                                            id: id
                                                        } as MoveObject)
                                                    });
                                                }}
                                                selectObj={selectObj}
                                                unitsText={'cm'}
                                                axisColor={'red'}
                                                axisText={'X'}
                                            />
                                        </List.Item>
                                        <List.Item>
                                            <SceneTransformInput
                                                updateValue={() => selectObj ? Number(SceneObject.CalculateGroupMaxSize(sceneStore.groupSelected).z).toFixed(2) : undefined}
                                                setValue={(number) => {
                                                    if (!selectObj) {
                                                        return;
                                                    }

                                                    let diff, defSharpness = Settings().scene.sharpness, sharpness,
                                                        iterations = 0;
                                                    let maxSize = SceneObject.CalculateGroupMaxSize(sceneStore.groupSelected);

                                                    if (maxSize.z === number || number < defSharpness) {
                                                        return;
                                                    }

                                                    let scaleObjects = sceneStore.groupSelected.map((t, i) => {
                                                        return t.mesh.scale.clone();
                                                    });

                                                    if (maxSize.z < number) {
                                                        while (maxSize.z < number) {
                                                            diff = Math.abs(number - maxSize.z);
                                                            sharpness = .01 * diff + defSharpness;

                                                            for (let sceneObject of sceneStore.groupSelected) {
                                                                sceneObject.mesh.scale.setZ(sceneObject.mesh.scale.z + sharpness);
                                                                sceneObject.UpdateSize();
                                                            }

                                                            maxSize = SceneObject.CalculateGroupMaxSize(sceneStore.groupSelected);

                                                            iterations++;

                                                            if (iterations > 499) {
                                                                console.log("iteration of scale error");
                                                                break;
                                                            }
                                                        }
                                                    } else if (maxSize.z > number) {
                                                        while (maxSize.z > number) {
                                                            diff = Math.abs(number - maxSize.z);
                                                            sharpness = .01 * diff + defSharpness;

                                                            for (let sceneObject of sceneStore.groupSelected) {
                                                                sceneObject.mesh.scale.setZ(sceneObject.mesh.scale.z - sharpness);
                                                                sceneObject.UpdateSize();
                                                            }

                                                            maxSize = SceneObject.CalculateGroupMaxSize(sceneStore.groupSelected);

                                                            iterations++;

                                                            if (iterations > 499) {
                                                                console.log("iteration of scale error");
                                                                break;
                                                            }
                                                        }
                                                    }

                                                    let id = LinearGenerator();

                                                    sceneStore.groupSelected.every((t, i) => {
                                                        Dispatch(EventEnum.TRANSFORM_OBJECT, {
                                                            from: scaleObjects[i],
                                                            to: selectObj?.scale,
                                                            sceneObject: selectObj,
                                                            actionBreak: true,
                                                            id: id
                                                        } as MoveObject)
                                                    });
                                                }}
                                                selectObj={selectObj}
                                                unitsText={'cm'}
                                                axisColor={'blue'}
                                                axisText={'Y'}
                                            />
                                        </List.Item>
                                        <List.Item>
                                            <SceneTransformInput
                                                updateValue={() => selectObj ? Number(SceneObject.CalculateGroupMaxSize(sceneStore.groupSelected).y).toFixed(2) : undefined}
                                                setValue={(number) => {
                                                    if (!selectObj) {
                                                        return;
                                                    }

                                                    let diff, defSharpness = Settings().scene.sharpness, sharpness,
                                                        iterations = 0;
                                                    let maxSize = SceneObject.CalculateGroupMaxSize(sceneStore.groupSelected);

                                                    if (maxSize.y === number || number < defSharpness) {
                                                        return;
                                                    }

                                                    let scaleObjects = sceneStore.groupSelected.map((t, i) => {
                                                        return t.mesh.scale.clone();
                                                    });

                                                    if (maxSize.y < number) {
                                                        while (maxSize.y < number) {
                                                            diff = Math.abs(number - maxSize.y);
                                                            sharpness = .01 * diff + defSharpness;

                                                            for (let sceneObject of sceneStore.groupSelected) {
                                                                sceneObject.mesh.scale.setY(sceneObject.mesh.scale.y + sharpness);
                                                                sceneObject.UpdateSize();
                                                            }

                                                            maxSize = SceneObject.CalculateGroupMaxSize(sceneStore.groupSelected);

                                                            iterations++;

                                                            if (iterations > 499) {
                                                                console.log("iteration of scale error");
                                                                break;
                                                            }
                                                        }
                                                    } else if (maxSize.y > number) {
                                                        while (maxSize.y > number) {
                                                            diff = Math.abs(number - maxSize.y);
                                                            sharpness = .01 * diff + defSharpness;

                                                            for (let sceneObject of sceneStore.groupSelected) {
                                                                sceneObject.mesh.scale.setY(sceneObject.mesh.scale.y - sharpness);
                                                                sceneObject.UpdateSize();
                                                            }

                                                            maxSize = SceneObject.CalculateGroupMaxSize(sceneStore.groupSelected);

                                                            iterations++;

                                                            if (iterations > 499) {
                                                                console.log("iteration of scale error");
                                                                break;
                                                            }
                                                        }
                                                    }

                                                    let id = LinearGenerator();

                                                    sceneStore.groupSelected.every((t, i) => {
                                                        Dispatch(EventEnum.TRANSFORM_OBJECT, {
                                                            from: scaleObjects[i],
                                                            to: selectObj?.scale,
                                                            sceneObject: selectObj,
                                                            actionBreak: true,
                                                            id: id
                                                        } as MoveObject)
                                                    });

                                                    if (Settings().scene.transformAlignToPlane) {
                                                        sceneStoreSelectObjsAlignY();
                                                    }
                                                }}
                                                selectObj={selectObj}
                                                unitsText={'cm'}
                                                axisColor={'green'}
                                                axisText={'Z'}
                                            />
                                        </List.Item>
                                    </List>
                                </div>
                            </div>
                        </Segment>
                        <Segment inverted>
                            <Button inverted size={"tiny"} compact onClick={() => {
                                sceneStoreSelectObjsResetScale();

                                if (Settings().scene.transformAlignToPlane) {
                                    sceneStoreSelectObjsAlignY();
                                }

                                this.setState({});
                            }}>
                                <Button.Content>Reset</Button.Content>
                            </Button>
                            {buttonAlignY}
                        </Segment>
                    </SegmentGroup>
                break;
        }

        return (
            <div>
                <Menu  inverted >
                    <Menu.Item
                        name='Move'
                        active={instrumentEnum === TransformInstrumentEnum.Move}
                        onClick={this.handleItemClick}
                    >
                        <p>
                            <Icon name='arrows alternate' size='large' inverted style={MenuItemStyleCenter}/>
                        </p>
                    </Menu.Item>

                    <Menu.Item
                        name='Rotate'
                        active={instrumentEnum === TransformInstrumentEnum.Rotate}
                        onClick={this.handleItemClick}
                    >
                        <p>
                            <Icon name='refresh' size='large' inverted style={MenuItemStyleCenter}/>
                        </p>
                    </Menu.Item>

                    <Menu.Item
                        name='Scale'
                        active={instrumentEnum === TransformInstrumentEnum.Scale}
                        onClick={this.handleItemClick}
                    >
                        <p>
                            <Icon name='expand' size='large' inverted style={MenuItemStyleCenter}/>
                        </p>
                    </Menu.Item>
                </Menu>
                {instrumentMenu}
            </div>
        )
    }
}

export default SceneTransformBar;
