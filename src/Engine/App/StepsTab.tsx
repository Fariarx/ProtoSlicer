import {Icon, Segment, Step} from "semantic-ui-react";
import {storeMain} from "../Bridge";
import {Settings} from "../Globals";

function StepsTab() {
    return (
        <div style={{
            width: "auto",
            height: "auto",
            padding: "0.5vmin",
            opacity: Settings().ui.opacity
        }} className="position-fixed bottom-0 end-0">
            <Segment size={"mini"}>
                <Step.Group size='mini' unstackable>
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
            </Segment>
        </div>
    );
}

export default StepsTab;
