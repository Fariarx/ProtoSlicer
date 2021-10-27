import React from 'react'
import { Icon, Label } from 'semantic-ui-react'
import 'bootstrap/dist/css/bootstrap.min.css';
import './Console.css';
import {action, observable} from "mobx";
import {observer} from "mobx-react";

const text = observable({ value:'' });

const LabelPopup = observer(() => {
    if(text.value)
    {
        return (
            <Label className='start-50 top-0 position-absolute translate-middle' style={{
                marginTop:'4vmin'
            }}>
                <Icon name='mail'/> {text.value}
            </Label>
        )
    }
    else
    {
        return <div/>;
    }
});

export default LabelPopup;

let timer;

export const PopupLabelSendText = action((_text: string = '', _timeout: number = 3000) => {
    text.value = _text;

    if(timer)
    {
        clearTimeout(timer);
    }

    if(_text)
    {
        timer = setTimeout(PopupLabelSendText, _timeout);
    }
});
