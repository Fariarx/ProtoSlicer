import {Icon, Table, Step, Card, Button} from "semantic-ui-react";
import {storeMain} from "../Bridge";
import {Settings} from "../Globals";
import React from "react";

function ElementSelectObjects(props) {
    return (
        <Card style={{
            float:'right',
            marginBottom:'1vmin'
        }}>
            <Card.Content extra>
                <Card.Header style={{ float:'left' }}>Select objects</Card.Header>
            </Card.Content>
            <Card.Content extra>
                <div style={{
                    width:"auto",
                    height:'10vh'
                }}>

                </div>
            </Card.Content>
            <Card.Content extra>
                <div className='ui two buttons'>
                    <Button basic color='green'>
                        Select all
                    </Button>
                    <Button basic color='grey'>
                        Unselect all
                    </Button>
                </div>
            </Card.Content>
        </Card>
    );
}

export default ElementSelectObjects;
