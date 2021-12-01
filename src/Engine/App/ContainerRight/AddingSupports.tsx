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
    Feed, Item, Container, SegmentGroup, ButtonGroup
} from "semantic-ui-react";
import {storeMain} from "../../Bridge";
import {Log, Settings} from "../../Globals";
import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import {SceneObject} from "../Scene/SceneObject";
import {action, observable} from "mobx";
import {sceneStoreSelectionChanged} from "../Scene/SceneStore";
import {Dispatch, EventEnum} from "../Managers/Events";
import {TransformInstrumentEnum} from "../Scene/ChildrenUI/SceneTransformBar";

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
                    <ButtonGroup  size={"tiny"}>
                        <Button name={'addSupports'} inverted onClick={this.supportButtons}>
                            <p>
                                <Icon name='low vision'   />
                            </p>
                        </Button>
                        <Button name={'removeSupports'} inverted onClick={this.supportButtons}>
                            <p>
                                <Icon name='low vision'   />
                            </p>
                        </Button>
                        <Button name={'auto'} inverted onClick={()=>{

                        }}>
                            <p>
                                Auto
                            </p>
                        </Button>
                    </ButtonGroup>
                </Segment>
            </SegmentGroup>
        );
    }
}

export default AddingSupports;
