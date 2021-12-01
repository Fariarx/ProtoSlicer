import {Input, Label} from "semantic-ui-react";
import {sceneStoreUpdateFrame} from "../SceneStore";
import React, {RefObject, useState} from "react";


export const SceneTransformInput = function (props) {
    let reference = useState(React.createRef<HTMLInputElement>())[0];
    let [labelValue, updateValue] = useState('');

    if(document.activeElement !== reference.current) {
        labelValue = props.updateValue(); //this.labelX.value = Number(props.selectObj?.position.x).toFixed(2);
    }

    return (
        <Input fluid labelPosition='right' type='text' placeholder='No selected'
               size='small' disabled={!props.selectObj}>
            <Label color={props.axisColor} pointing={"right"}>{props.axisText}</Label>
            <input
                ref={reference} value={props.selectObj ? labelValue : undefined}
                onChange={(e) => {
                    let value = e.target.value.replace(',', '.');

                    let number = parseFloat(value);

                    if (number || number === 0) {
                        props.setValue(number);//props.selectObj?.position.setX(number);
                    }

                    updateValue(value);

                    sceneStoreUpdateFrame();
                }}
                onBlur={(e) => {
                    if (parseFloat(labelValue)) {
                        labelValue = Number(labelValue).toFixed(2)
                    } else {
                        labelValue = props.updateValue();
                    }

                    updateValue(labelValue);

                    sceneStoreUpdateFrame();
                }}
            />
            <Label color={props.axisColor} >{props.unitsText}</Label>
        </Input>
    );
}
