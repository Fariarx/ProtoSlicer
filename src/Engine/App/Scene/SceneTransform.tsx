import {Button, Card, Icon, Input, Label, List, Menu, Segment} from "semantic-ui-react";
import {SaveSettings, Settings} from "../../Globals";
import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import {autorun, observable} from "mobx";
import {Dispatch, EventEnum} from "../EventManager";
import {
    sceneStore,
    sceneStoreGetSelectObj,
    sceneStoreSelectionChanged,
    sceneStoreSelectObjsAlignXZ
} from "./SceneStore";

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
    constructor(props) {
        super(props);
    }

    handleItemClick = (e, obj) => {
        Dispatch(EventEnum.SELECT_TRANSFORM_MODE, {value: TransformInstrumentEnum[obj.name]});
    }

    render() {
        let instrumentEnum = sceneStore.transformInstrumentState;
        let instrumentMenu = <div/>;
        let selectObj = sceneStoreGetSelectObj();

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
                                            <Input labelPosition='right' type='text' placeholder='No selected'
                                                   size='small' style={{width: '45%'}} disabled={!selectObj}>
                                                <Label color='green' pointing={"right"}>X</Label>
                                                <input
                                                    defaultValue={selectObj ? Number(selectObj.position.x).toFixed(2) : undefined}/>
                                                <Label color='green'>mm</Label>
                                            </Input>
                                        </List.Item>
                                        <List.Item>
                                            <Input labelPosition='right' type='text' placeholder='No selected'
                                                   size='small' style={{width: '45%'}} disabled={!selectObj}>
                                                <Label color='red' pointing={"right"}>Y</Label>
                                                <input
                                                    defaultValue={selectObj ? Number(selectObj.position.z).toFixed(2) : undefined}/>
                                                <Label color='red'>mm</Label>
                                            </Input>
                                        </List.Item>
                                        <List.Item>
                                            <Input labelPosition='right' type='text' placeholder='No selected'
                                                   size='small' style={{width: '45%'}} disabled={!selectObj}>
                                                <Label color='blue' pointing={"right"}>Z</Label>
                                                <input
                                                    defaultValue={selectObj ? Number(selectObj.position.y).toFixed(2) : undefined}/>
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
                                <Button.Content>Align</Button.Content>
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
