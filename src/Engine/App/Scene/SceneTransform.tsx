import {Button, Card, Icon, Input, Label, List, Menu, Segment} from "semantic-ui-react";
import {SaveSettings, Settings} from "../../Globals";
import React, {Component, RefObject} from "react";
import {inject, observer} from "mobx-react";
import {autorun, observable, runInAction} from "mobx";
import {Dispatch, EventEnum, MoveObject} from "../EventManager";
import {
    sceneStore,
    sceneStoreSelectionChanged,
    sceneStoreSelectObjsAlignXZ,
    sceneStoreSelectObjsAlignY,
    sceneStoreSelectObjsResetRotation,
    sceneStoreSelectObjsResetScale,
    sceneStoreUpdateFrame
} from "./SceneStore";
import {MathUtils, Vector3} from "three";
import {isFloat, isNumeric} from "../../Utils";
import {SceneTransformInput} from "./SceneTransformInput";
import {SceneObject} from "./SceneObject";

export enum TransformInstrumentEnum {
    None = 0,
    Move = "translate",
    Rotate = 'rotate',
    Scale = 'scale'
}

const MenuItemStyleCenter = {marginLeft: 'auto', marginRight: 'auto', display: 'block'};


@inject('sceneStore')
@observer
class SceneTransform extends Component<any, any> {
    handleItemClick = (e, obj) => {
        Dispatch(EventEnum.SELECT_TRANSFORM_MODE, {value: TransformInstrumentEnum[obj.name]});
    }



    render() {
        let instrumentEnum = sceneStore.transformInstrumentState;
        let instrumentMenu = <div/>;
        let selectObj = sceneStore.sceneStoreGetSelectObj;

        if(sceneStore.needUpdateTransformTool)
        {
            runInAction(()=>{
                sceneStore.needUpdateTransformTool = false;
            })
        }

        switch (instrumentEnum) {
            case TransformInstrumentEnum.Move:
                instrumentMenu =
                    <Card style={{
                        width: '100%',
                        height: 'auto',
                        marginTop: '1vmin'
                    }}>
                        <Card.Content extra>
                            <Card.Header
                                style={{float: 'left'}}>{instrumentEnum[0].toUpperCase() + instrumentEnum.slice(1)}</Card.Header>
                        </Card.Content>
                        <Card.Content extra>
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
                                                updateValue={()=> Number(selectObj?.position.x).toFixed(2)}
                                                setValue={(number)=> {
                                                    if(!selectObj) return;

                                                    Dispatch(EventEnum.TRANSFORM_OBJECT, {
                                                        from: selectObj?.position.clone(),
                                                        to: selectObj?.position.setX(number),
                                                        sceneObject: selectObj
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
                                                updateValue={()=> Number(selectObj?.position.z).toFixed(2)}
                                                setValue={(number)=> {
                                                    if(!selectObj) return;

                                                    Dispatch(EventEnum.TRANSFORM_OBJECT, {
                                                        from: selectObj?.position.clone(),
                                                        to: selectObj?.position.setZ(number),
                                                        sceneObject: selectObj
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
                                                updateValue={()=> Number(selectObj?.position.y).toFixed(2)}
                                                setValue={(number)=> {
                                                    if(!selectObj) return;

                                                    Dispatch(EventEnum.TRANSFORM_OBJECT, {
                                                        from: selectObj?.position.clone(),
                                                        to: selectObj?.position.setY(number),
                                                        sceneObject: selectObj
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
                        </Card.Content>
                        <Card.Content extra>
                            <Button size={"tiny"} compact onClick={() => {
                                sceneStoreSelectObjsAlignXZ();
                                this.setState({});
                            }}>
                                <Button.Content>Center</Button.Content>
                            </Button>
                            <Button size={"tiny"} compact active={Settings().scene.transformAlignToPlane}
                                    color={Settings().scene.transformAlignToPlane ? 'teal' : undefined} onClick={() => {
                                Settings().scene.transformAlignToPlane = !Settings().scene.transformAlignToPlane;
                                SaveSettings();

                                if(Settings().scene.transformAlignToPlane) {
                                    sceneStoreSelectObjsAlignY();
                                }

                                this.setState({});
                            }}>
                                <Button.Content>AlignZ</Button.Content>
                            </Button>
                        </Card.Content>
                    </Card>
                break;
            case TransformInstrumentEnum.Rotate:
                instrumentMenu =
                    <Card style={{
                        width: '100%',
                        height: 'auto',
                        marginTop: '1vmin'
                    }}>
                        <Card.Content extra>
                            <Card.Header
                                style={{float: 'left'}}>{instrumentEnum[0].toUpperCase() + instrumentEnum.slice(1)}</Card.Header>
                        </Card.Content>
                        <Card.Content extra>
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
                                                updateValue={ ()=> selectObj ? Number(MathUtils.radToDeg(selectObj.rotation.x)).toFixed(2) : undefined }
                                                setValue={(number)=>{selectObj?.rotation.set(MathUtils.degToRad(number),selectObj?.rotation.y, selectObj?.rotation.z)}}
                                                selectObj={selectObj}
                                                unitsText={'deg'}
                                                axisColor={'red'}
                                                axisText={'X'}
                                            />
                                        </List.Item>
                                        <List.Item>
                                            <SceneTransformInput
                                                updateValue={ ()=> selectObj ? Number(MathUtils.radToDeg(selectObj.rotation.z)).toFixed(2) : undefined }
                                                setValue={(number)=>{selectObj?.rotation.set(selectObj?.rotation.x, selectObj?.rotation.y, MathUtils.degToRad(number))}}
                                                selectObj={selectObj}
                                                unitsText={'deg'}
                                                axisColor={'blue'}
                                                axisText={'Y'}
                                            />
                                        </List.Item>
                                        <List.Item>
                                            <SceneTransformInput
                                                updateValue={ ()=> selectObj ? Number(MathUtils.radToDeg(selectObj.rotation.y)).toFixed(2) : undefined }
                                                setValue={(number)=>{selectObj?.rotation.set(selectObj?.rotation.x, MathUtils.degToRad(number), selectObj?.rotation.z)}}
                                                selectObj={selectObj}
                                                unitsText={'deg'}
                                                axisColor={'green'}
                                                axisText={'Z'}
                                            />
                                        </List.Item>
                                    </List>
                                </div>
                            </div>
                        </Card.Content>
                        <Card.Content extra>
                            <Button size={"tiny"} compact onClick={() => {
                                sceneStoreSelectObjsResetRotation();
                                this.setState({});
                            }}>
                                <Button.Content>Reset</Button.Content>
                            </Button>
                        </Card.Content>
                    </Card>
                break;
            case TransformInstrumentEnum.Scale:
                instrumentMenu =
                    <Card style={{
                        width: '100%',
                        height: 'auto',
                        marginTop: '1vmin'
                    }}>
                        <Card.Content extra>
                            <Card.Header
                                style={{float: 'left'}}>{instrumentEnum[0].toUpperCase() + instrumentEnum.slice(1)}</Card.Header>
                        </Card.Content>
                        <Card.Content extra>
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
                                                updateValue={ ()=> selectObj ? Number( SceneObject.CalculateGroupMaxSize(sceneStore.groupSelected).x ).toFixed(2 ) : undefined }
                                                setValue={(number)=>{
                                                    if(!selectObj) {
                                                        return;
                                                    }

                                                    let diff, defSharpness = Settings().scene.sharpness, sharpness, iterations = 0;
                                                    let maxSize = SceneObject.CalculateGroupMaxSize(sceneStore.groupSelected);

                                                    if(maxSize.x === number || number < defSharpness) {
                                                        return;
                                                    }

                                                    let scaleObjects = sceneStore.groupSelected.map((t, i)=>{
                                                        return t.mesh.scale.clone();
                                                    });

                                                    if(maxSize.x < number) {
                                                        while (maxSize.x < number) {
                                                            diff = Math.abs(number - maxSize.x);
                                                            sharpness = .01 * diff + defSharpness;

                                                            for (let sceneObject of sceneStore.groupSelected) {
                                                                sceneObject.mesh.scale.setX(sceneObject.mesh.scale.x + sharpness);
                                                                sceneObject.Update();
                                                            }

                                                            maxSize = SceneObject.CalculateGroupMaxSize(sceneStore.groupSelected);

                                                            iterations++;

                                                            if (iterations > 999)
                                                            {
                                                                console.log("iteration of scale error");
                                                                break;
                                                            }
                                                        }
                                                    }
                                                    else if(maxSize.x > number)
                                                    {
                                                        while (maxSize.x > number) {
                                                            diff = Math.abs(number - maxSize.x);
                                                            sharpness = .01 * diff + defSharpness;

                                                            for (let sceneObject of sceneStore.groupSelected) {
                                                                sceneObject.mesh.scale.setX(sceneObject.mesh.scale.x - sharpness);
                                                                sceneObject.Update();
                                                            }

                                                            maxSize = SceneObject.CalculateGroupMaxSize(sceneStore.groupSelected);

                                                            iterations++;

                                                            if (iterations > 999)
                                                            {
                                                                console.log("iteration of scale error");
                                                                break;
                                                            }
                                                        }
                                                    }


                                                    sceneStore.groupSelected.every((t, i)=>{
                                                        Dispatch(EventEnum.TRANSFORM_OBJECT, {
                                                            from: scaleObjects[i],
                                                            to: selectObj?.scale,
                                                            sceneObject: selectObj,
                                                            actionBreak:true,
                                                            isGroup:true
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
                                                updateValue={ ()=> selectObj ? Number( SceneObject.CalculateGroupMaxSize(sceneStore.groupSelected).z ).toFixed(2 ) : undefined }
                                                setValue={(number)=>{
                                                    if(!selectObj) {
                                                        return;
                                                    }

                                                    let diff, defSharpness = Settings().scene.sharpness, sharpness, iterations = 0;
                                                    let maxSize = SceneObject.CalculateGroupMaxSize(sceneStore.groupSelected);

                                                    if(maxSize.z === number || number < defSharpness) {
                                                        return;
                                                    }

                                                    let scaleObjects = sceneStore.groupSelected.map((t, i)=>{
                                                        return t.mesh.scale.clone();
                                                    });

                                                    if(maxSize.z < number) {
                                                        while (maxSize.z < number) {
                                                            diff = Math.abs(number - maxSize.z);
                                                            sharpness = .01 * diff + defSharpness;

                                                            for (let sceneObject of sceneStore.groupSelected) {
                                                                sceneObject.mesh.scale.setZ(sceneObject.mesh.scale.z + sharpness);
                                                                sceneObject.Update();
                                                            }

                                                            maxSize = SceneObject.CalculateGroupMaxSize(sceneStore.groupSelected);

                                                            iterations++;

                                                            if (iterations > 999)
                                                            {
                                                                console.log("iteration of scale error");
                                                                break;
                                                            }
                                                        }
                                                    }
                                                    else if(maxSize.z > number)
                                                    {
                                                        while (maxSize.z > number) {
                                                            diff = Math.abs(number - maxSize.z);
                                                            sharpness = .01 * diff + defSharpness;

                                                            for (let sceneObject of sceneStore.groupSelected) {
                                                                sceneObject.mesh.scale.setZ(sceneObject.mesh.scale.z - sharpness);
                                                                sceneObject.Update();
                                                            }

                                                            maxSize = SceneObject.CalculateGroupMaxSize(sceneStore.groupSelected);

                                                            iterations++;

                                                            if (iterations > 999)
                                                            {
                                                                console.log("iteration of scale error");
                                                                break;
                                                            }
                                                        }
                                                    }


                                                    sceneStore.groupSelected.every((t, i)=>{
                                                        Dispatch(EventEnum.TRANSFORM_OBJECT, {
                                                            from: scaleObjects[i],
                                                            to: selectObj?.scale,
                                                            sceneObject: selectObj,
                                                            actionBreak:true,
                                                            isGroup:true
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
                                                updateValue={ ()=> selectObj ? Number( SceneObject.CalculateGroupMaxSize(sceneStore.groupSelected).y ).toFixed(2 ) : undefined }
                                                setValue={(number)=>{
                                                    if(!selectObj) {
                                                        return;
                                                    }

                                                    let diff, defSharpness = Settings().scene.sharpness, sharpness, iterations = 0;
                                                    let maxSize = SceneObject.CalculateGroupMaxSize(sceneStore.groupSelected);

                                                    if(maxSize.y === number || number < defSharpness) {
                                                        return;
                                                    }

                                                    let scaleObjects = sceneStore.groupSelected.map((t, i)=>{
                                                        return t.mesh.scale.clone();
                                                    });

                                                    if(maxSize.y < number) {
                                                        while (maxSize.y < number) {
                                                            diff = Math.abs(number - maxSize.y);
                                                            sharpness = .01 * diff + defSharpness;

                                                            for (let sceneObject of sceneStore.groupSelected) {
                                                                sceneObject.mesh.scale.setY(sceneObject.mesh.scale.y + sharpness);
                                                                sceneObject.Update();
                                                            }

                                                            maxSize = SceneObject.CalculateGroupMaxSize(sceneStore.groupSelected);

                                                            iterations++;

                                                            if (iterations > 999)
                                                            {
                                                                console.log("iteration of scale error");
                                                                break;
                                                            }
                                                        }
                                                    }
                                                    else if(maxSize.y > number)
                                                    {
                                                        while (maxSize.y > number) {
                                                            diff = Math.abs(number - maxSize.y);
                                                            sharpness = .01 * diff + defSharpness;

                                                            for (let sceneObject of sceneStore.groupSelected) {
                                                                sceneObject.mesh.scale.setY(sceneObject.mesh.scale.y - sharpness);
                                                                sceneObject.Update();
                                                            }

                                                            maxSize = SceneObject.CalculateGroupMaxSize(sceneStore.groupSelected);

                                                            iterations++;

                                                            if (iterations > 999)
                                                            {
                                                                console.log("iteration of scale error");
                                                                break;
                                                            }
                                                        }
                                                    }


                                                    sceneStore.groupSelected.every((t, i)=>{
                                                        Dispatch(EventEnum.TRANSFORM_OBJECT, {
                                                            from: scaleObjects[i],
                                                            to: selectObj?.scale,
                                                            sceneObject: selectObj,
                                                            actionBreak:true,
                                                            isGroup:true
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
                        </Card.Content>
                        <Card.Content extra>
                            <Button size={"tiny"} compact onClick={() => {
                                sceneStoreSelectObjsResetScale();
                                this.setState({});
                            }}>
                                <Button.Content>Reset</Button.Content>
                            </Button>
                        </Card.Content>
                    </Card>
                break;
        }

        return (
            <div style={{
                width: "200px",
                height: "auto",
                padding: "1vmin",
                opacity: Settings().ui.opacity,
                marginTop: '-20vh'
            }} className="top-50 start-0 position-fixed ">
                <div style={{width: '60px'}}>
                    <Menu vertical pointing fluid>
                        <Menu.Item
                            name='Move'
                            active={instrumentEnum === TransformInstrumentEnum.Move}
                            onClick={this.handleItemClick}
                        >
                            <p>
                                <Icon name='arrows alternate' size='large' style={MenuItemStyleCenter}/>
                            </p>
                        </Menu.Item>

                        <Menu.Item
                            name='Rotate'
                            active={instrumentEnum === TransformInstrumentEnum.Rotate}
                            onClick={this.handleItemClick}
                        >
                            <p>
                                <Icon name='refresh' size='large' style={MenuItemStyleCenter}/>
                            </p>
                        </Menu.Item>

                        <Menu.Item
                            name='Scale'
                            active={instrumentEnum === TransformInstrumentEnum.Scale}
                            onClick={this.handleItemClick}
                        >
                            <p>
                                <Icon name='expand' size='large' style={MenuItemStyleCenter}/>
                            </p>
                        </Menu.Item>
                    </Menu>
                </div>
                {instrumentMenu}
            </div>
        )
    }
}

export default SceneTransform;
