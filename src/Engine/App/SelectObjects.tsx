import {Icon, Table, Step, Card, Button, Segment} from "semantic-ui-react";
import {storeMain} from "../Bridge";
import {Settings} from "../Globals";
import React from "react";
import {observer} from "mobx-react";

const SelectObjects = observer(function (props) {
    return (
            <Card style={{ width:'100%' }}>
                <Card.Content extra>
                    <Card.Header style={{float: 'left'}}>Select objects</Card.Header>
                </Card.Content>
                <Card.Content extra>
                    <div style={{
                        width: "100%",
                        height: '10vh'
                    }}>

                    </div>
                </Card.Content>
                <Card.Content extra>
                    <Button.Group basic size='small'>
                        <Button icon='plus square' />
                        <Button icon='plus square outline' />
                    </Button.Group>
                </Card.Content>
            </Card>
    );
});

export default SelectObjects;
