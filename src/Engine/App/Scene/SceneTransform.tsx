import {Button, Card, Icon, Input, Label, List, Menu, Segment} from "semantic-ui-react";
import {Settings} from "../../Globals";
import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import {autorun, observable} from "mobx";
import {Dispatch, EventEnum} from "../EventManager";
import {sceneStore, sceneStoreSelectionChanged} from "./SceneStore";

export enum TransformInstrumentEnum {
    None = 0,
    Move = "translate",
    Rotate = 'rotate',
    Scale = 'scale'
}

@observer
class SceneTransform extends Component<any, any> {
    constructor(props) {
        super(props);
    }

    handleItemClick = (e, obj) => {
        Dispatch(EventEnum.SELECT_TRANSFORM_MODE, {value: TransformInstrumentEnum[obj.name]});
    }

    render() {
        let select = sceneStore.transformInstrumentState;
        let instrumentMenu = <div/>;

        switch (select) {
            case TransformInstrumentEnum.Move:
                instrumentMenu =
                    <Card style={{
                        height: 'auto',
                        marginTop: '1vmin'
                    }}>
                        <Card.Content extra>
                            <Card.Header
                                style={{float: 'left'}}>{select[0].toUpperCase() + select.slice(1)}</Card.Header>
                        </Card.Content>
                        <Card.Content extra >
                            <div style={{
                                height: 'auto',
                                overflow: "auto"
                            }}>
                                <List>
                                    <List.Item>
                                        <Input labelPosition='right' type='text' placeholder='value' size='small'
                                               style={{
                                                   width: "80px",
                                               }}>
                                            <Label color='green'>X</Label>
                                            <input/>
                                            <Label color='green'>mm</Label>
                                        </Input>
                                    </List.Item>
                                    <List.Item>
                                        <Input labelPosition='right' type='text' placeholder='value' size='small'
                                               style={{
                                                   width: "80px",
                                               }}>
                                            <Label color='red'>Y</Label>
                                            <input/>
                                            <Label color='red'>mm</Label>
                                        </Input>
                                    </List.Item>
                                    <List.Item>
                                        <Input labelPosition='right' type='text' placeholder='value' size='small'
                                               style={{
                                                   width: "80px",
                                               }}>
                                            <Label color='blue'>Z</Label>
                                            <input/>
                                            <Label color='blue'>mm</Label>
                                        </Input>
                                    </List.Item>
                                </List>
                            </div>
                        </Card.Content>
                    </Card>
                break;
        }

        const MenuItemStyle = {marginLeft: 'auto', marginRight: 'auto', display: 'block'};

        return (
            <div style={{
                width: "30vmax",
                height: "auto",
                padding: "1vmin",
                opacity: Settings().ui.opacity,
                marginTop: '-20vh'
            }} className="top-50 start-0 position-fixed ">
                <div style={{width: '60px'}}>
                    <Menu vertical pointing fluid>
                        <Menu.Item
                            name='Move'
                            active={select === TransformInstrumentEnum.Move}
                            onClick={this.handleItemClick}
                        >
                            <p>
                                <Icon name='arrows alternate' size='large' style={MenuItemStyle}/>
                            </p>
                        </Menu.Item>

                        <Menu.Item
                            name='Rotate'
                            active={select === TransformInstrumentEnum.Rotate}
                            onClick={this.handleItemClick}
                        >
                            <p>
                                <Icon name='refresh' size='large' style={MenuItemStyle}/>
                            </p>
                        </Menu.Item>

                        <Menu.Item
                            name='Scale'
                            active={select === TransformInstrumentEnum.Scale}
                            onClick={this.handleItemClick}
                        >
                            <p>
                                <Icon name='expand' size='large' style={MenuItemStyle}/>
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
