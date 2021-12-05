import {Button, Card, Icon, Menu, Segment, Rating} from "semantic-ui-react";
import React, {Component} from "react";
import {observer} from "mobx-react";
import {autorun, observable} from "mobx";
import {AppEvents , EventEnum} from "./Managers/Events";
import {Settings} from "../Globals";

export enum StepsEnum {
    Preparation,
    Supports,
    Result
}

export let ElementStepsSelect = observable({ name: StepsEnum.Preparation });

@observer
class Steps extends Component<any, any> {
    constructor(props) {
        super(props);
    }

    handleItemClick = (e, obj) => {
        AppEvents.Dispatch(EventEnum.SELECT_MENU_STEP, {value: StepsEnum[obj.name]});
    }

    render() {
        let select = ElementStepsSelect.name;

        return (
            <Card style={{ width:'100%' }}>
                <Card.Content extra>
                    <Card.Header style={{float: 'left'}}>Printing steps</Card.Header>
                    {/*<Rating maxRating={5} style={{float: 'right'}} clearable />*/}
                </Card.Content>
                <Card.Content extra>
                    <Menu pointing secondary vertical style={{ width:'100%' }} floated={'right'} size={"large"}>
                        <Menu.Item active={select === StepsEnum.Preparation}
                            name='Preparation'
                            onClick={this.handleItemClick}
                        />
                        <Menu.Item active={select === StepsEnum.Supports}
                                   name='Supports'
                            onClick={this.handleItemClick}
                        />
                        <Menu.Item active={select === StepsEnum.Result}
                                   name='Result'
                            onClick={this.handleItemClick}
                        />
                    </Menu>
                </Card.Content>
            </Card>
        )
    }
}

export default Steps;
