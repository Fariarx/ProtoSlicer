import {Icon, List, Step, Segment} from "semantic-ui-react";
import {storeMain} from "../Bridge";
import {Settings} from "../Globals";
import Steps from "./Steps";
import SelectObjects from "./SelectObjects";
import {Vector2, Vector3} from "three";
import React from "react";

function ContainerRight(props) { 
    return (
        <div style={{
            width: "250px",
            height: "auto",
            opacity: Settings().ui.opacity,
            //backgroundColor:'red',
        }} className="position-fixed top-0 end-0">
            <div style={{
                width: "100%",
                height: '100%',
                padding: '1vmin',
                paddingLeft: 0
            }}>
                {/*<Steps />*/}
                <SelectObjects />
            </div>
        </div>
    );
}

export default ContainerRight;
