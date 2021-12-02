import {Icon, List, Step, Segment} from "semantic-ui-react";
import {storeMain} from "../../../../Bridge";
import {Settings} from "../../../../Globals";
import Steps from "../../../Steps";
import SelectObjects from "./SelectObjects";
import {Vector2, Vector3} from "three";
import React from "react";
import AddingSupports from "./AddingSupports";

function ContainerRight(props) {
    return (
        <div style={{
            width: "26vmin",
            height: "auto",
            opacity: Settings().ui.opacity,
            marginLeft:'auto'
        }} >
            <div style={{
                width: "100%",
                height: '100%',
                padding: '1vmin'
            }}>
                {/*<Steps />*/}
                <SelectObjects />
                <AddingSupports />
            </div>
        </div>
    );
}

export default ContainerRight;
