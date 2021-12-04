import React from 'react'
import { Icon, Label } from 'semantic-ui-react'
import 'bootstrap/dist/css/bootstrap.min.css';
import './ElementConsole.css';
import {action, observable} from "mobx";
import {observer} from "mobx-react";
import {LogSendText} from "./ElementConsole";

const text = observable({ value:'' });

const LabelPopup = observer(() => {
    if(text.value)
    {
        return (
            <Label className='start-50 top-0 position-absolute translate-middle' style={{
                marginTop:'15vmin',
                zIndex:500
            }}>
                <Icon name='terminal' color='red'  /> {text.value}
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
