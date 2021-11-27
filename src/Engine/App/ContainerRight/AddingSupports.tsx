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
    Feed, Item, Container, SegmentGroup
} from "semantic-ui-react";
import {storeMain} from "../../Bridge";
import {Log, Settings} from "../../Globals";
import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import {SceneObject} from "../Scene/SceneObject";
import {action, observable} from "mobx";
import {sceneStoreSelectionChanged} from "../Scene/SceneStore";

@inject("sceneStore")
@observer
class AddingSupports extends Component<any, any> {
    render() {
        return (
            <SegmentGroup padded size={"tiny"} color='black' style={{
                width: '100%',
                height: 'auto',
                marginTop: '-0.5vmin',
            }}>
                <Segment inverted>
                    <Button fluid inverted size={"tiny"} onClick={()=>{

                    }}>
                        Adding supports
                    </Button>
                </Segment>
            </SegmentGroup>
        );
    }
}

export default AddingSupports;
