import {Icon, Table, Step} from "semantic-ui-react";
import {storeMain} from "../Bridge";
import {Settings} from "../Globals";
import ElementSteps from "./ElementSteps";
import ElementSelectObjects from "./ElementSelectObjects";

function ContainerBottomRight(props) {
    return (
        <div style={{
            width: "auto",
            height: "auto",
            padding: "1vmin",
            opacity: Settings().ui.opacity
        }} className="position-fixed bottom-0 end-0">
            <Table.Body>
                <Table.Row>
                    <ElementSelectObjects/>
                </Table.Row>
                <Table.Row>
                    <ElementSteps/>
                </Table.Row>
            </Table.Body>
        </div>
    );
}

export default ContainerBottomRight;
