import {Icon, List, Step, Segment} from "semantic-ui-react";
import {storeMain} from "../Bridge";
import {Settings} from "../Globals";
import Steps from "./Steps";
import SelectObjects from "./SelectObjects";

function ContainerRight(props) {
    return (
        <div style={{
            width: "18vmax",
            height: "100vh",
            opacity: Settings().ui.opacity
        }} className="position-fixed bottom-0 end-0">
            <div style={{
                width: "100%",
                height: '100%',
                padding: '1vmin'
            }} >
                {/*<Steps />*/}
                <SelectObjects />
            </div>
        </div>
    );
}

export default ContainerRight;
