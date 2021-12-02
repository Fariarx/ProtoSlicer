import {
    Icon,
    Table,
    Step,
    Card,
    Button,
    Segment,
    List,
    Checkbox,
    Header,
    Grid,
    GridColumn,
    Feed, Item, Container, SegmentGroup, ButtonGroup, Menu
} from "semantic-ui-react";
import {storeMain} from "../../../../Bridge";
import {Log, Settings} from "../../../../Globals";
import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import {SceneObject} from "../../SceneObject";
import {action, observable} from "mobx";
import {sceneStoreSelectionChanged} from "../../SceneStore";
import {Dispatch, EventEnum} from "../../../Managers/Events";
import {MenuItemStyleCenter, TransformInstrumentEnum} from "../SceneTransformBar";

export enum AddingSupportsMode {
    none = 0,
    addSupports ,
    removeSupports ,
}

@observer
class AddingSupports extends Component<any, any> {
    supportButtons = (e, obj) => {
        Dispatch(EventEnum.SELECT_SUPPORTS_MODE, { mode: AddingSupportsMode[obj.name] });
    }

    render() {
        return (
            <SegmentGroup padded size={"tiny"} color='black' style={{
                width: '100%',
                height: 'auto',
                marginTop: '-1vmin',
            }}>
                <Segment inverted>
                    <Header as='h4'>
                        Adding supports
                    </Header>
                </Segment>
                <Segment inverted>
                    <Menu inverted  size={"mini"}  fluid >
                        <Menu.Item name={'addSupports'}    onClick={this.supportButtons}>
                                <Icon name='bullseye'   size={"large"} />
                        </Menu.Item>
                        <Menu.Item name={'removeSupports'}     onClick={this.supportButtons}>
                                <Icon name='eraser'  size={"large"} />
                        </Menu.Item>
                        <Menu.Item name={'auto'} position='right'  onClick={()=>{

                        }}>
                            <p>
                                Auto
                            </p>
                        </Menu.Item>
                    </Menu>
                </Segment>
            </SegmentGroup>
        );
    }
}

export default AddingSupports;
