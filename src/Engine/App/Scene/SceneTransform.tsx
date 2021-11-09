import {Button, Card, Icon, Input, Label, List, Menu, Segment} from "semantic-ui-react";
import {SaveSettings, Settings} from "../../Globals";
import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import {autorun, observable, runInAction} from "mobx";
import {Dispatch, EventEnum} from "../EventManager";
import {
    sceneStore,
    sceneStoreSelectionChanged,
    sceneStoreSelectObjsAlignXZ, sceneStoreUpdateFrame
} from "./SceneStore";
import {Vector3} from "three";
import {isFloat, isNumeric} from "../../Utils";

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

    labelX;

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

                if((document.activeElement as any).name !== 'transform_x') {
                    this.labelX = Number(selectObj?.position.x).toFixed(2);
                }

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
                                            <Input fluid labelPosition='right' type='text' placeholder='No selected'
                                                   size='small' disabled={!selectObj}>
                                                <Label color='green' pointing={"right"}>X</Label>
                                                <input
                                                    name='transform_x' value={selectObj ? this.labelX : undefined}
                                                    onChange={(e) => {
                                                        let value = e.target.value.replace(',','.');

                                                        this.labelX = value;

                                                        let float = parseFloat(value);

                                                        if (float) {
                                                            selectObj?.position.setX(float);
                                                        }

                                                        this.setState({})
                                                        sceneStoreUpdateFrame();
                                                    }}
                                                    onBlur={(e) =>{
                                                        if(parseFloat(this.labelX)) {
                                                            this.labelX = Number(this.labelX).toFixed(2)
                                                        }
                                                        else
                                                        {
                                                            this.labelX = Number(selectObj?.position.x).toFixed(2);
                                                        }

                                                        this.setState({})
                                                        sceneStoreUpdateFrame();
                                                    }}
                                                />
                                                <Label color='green'>mm</Label>
                                            </Input>
                                        </List.Item>
                                        <List.Item>
                                            <Input fluid labelPosition='right' type='text' placeholder='No selected'
                                                   size='small' disabled={!selectObj}>
                                                <Label color='red' pointing={"right"}>Y</Label>
                                                <input
                                                    value={selectObj ? Number(selectObj?.position.z).toFixed(2) : undefined}/>
                                                <Label color='red'>mm</Label>
                                            </Input>
                                        </List.Item>
                                        <List.Item>
                                            <Input fluid labelPosition='right' type='text' placeholder='No selected'
                                                   size='small' disabled={!selectObj}>
                                                <Label color='blue' pointing={"right"}>Z</Label>
                                                <input
                                                    value={selectObj ? Number(selectObj?.position.y).toFixed(2) : undefined}/>
                                                <Label color='blue'>mm</Label>
                                            </Input>
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
