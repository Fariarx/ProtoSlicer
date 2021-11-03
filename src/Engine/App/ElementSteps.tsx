import {Icon, Table, Step} from "semantic-ui-react";
import {storeMain} from "../Bridge";
import {Settings} from "../Globals";

function ElementSteps(props) {
    return (
        <Step.Group size='mini' unstackable className="align-baseline">
            <Step>
                <Icon name='american sign language interpreting'/>
                <Step.Content>
                    <Step.Title>Preparation</Step.Title>
                </Step.Content>
            </Step>

            <Step active>
                <Icon name='braille'/>
                <Step.Content>
                    <Step.Title>Supports</Step.Title>
                </Step.Content>
            </Step>

            <Step>
                <Icon name='cloud download'/>
                <Step.Content>
                    <Step.Title>Result and export</Step.Title>
                </Step.Content>
            </Step>
        </Step.Group>
    );
}

export default ElementSteps;
