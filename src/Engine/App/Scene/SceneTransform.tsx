import {Button, Card, Icon, Input, Label, List, Menu, Segment} from "semantic-ui-react";
import {SaveSettings, Settings} from "../../Globals";
import React, {Component, RefObject} from "react";
import {inject, observer} from "mobx-react";
import {autorun, observable, runInAction} from "mobx";
import {Dispatch, EventEnum} from "../EventManager";
import {
    sceneStore,
    sceneStoreSelectionChanged,
    sceneStoreSelectObjsAlignXZ, sceneStoreSelectObjsAlignY, sceneStoreUpdateFrame
} from "./SceneStore";
import {Vector3} from "three";
import {isFloat, isNumeric} from "../../Utils";
import {SceneTransformInput} from "./SceneTransformInput";

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
                                                updateValue={()=> Number(selectObj?.position.x).toFixed(2)}
                                                setValue={(number)=>{selectObj?.position.setX(number)}}
                                                selectObj={selectObj}
                                                unitsText={'mm'}
                                                axisColor={'red'}
                                                axisText={'X'}
                                            />
                                        </List.Item>
                                        <List.Item>
                                            <SceneTransformInput
                                                updateValue={()=> Number(selectObj?.position.z).toFixed(2)}
                                                setValue={(number)=>{selectObj?.position.setZ(number)}}
                                                selectObj={selectObj}
                                                unitsText={'mm'}
                                                axisColor={'blue'}
                                                axisText={'Y'}
                                            />
                                        </List.Item>
                                        <List.Item>
                                            <SceneTransformInput
                                                updateValue={()=> Number(selectObj?.position.y).toFixed(2)}
                                                setValue={(number)=>{selectObj?.position.setY(number)}}
                                                selectObj={selectObj}
                                                unitsText={'mm'}
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
                                sceneStoreSelectObjsAlignXZ();
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
