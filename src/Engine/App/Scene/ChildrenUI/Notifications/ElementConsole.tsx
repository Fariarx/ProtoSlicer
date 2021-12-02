import React, { Component } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";

import {LinearGenerator} from '../../../Utils/Utils'

import 'bootstrap/dist/css/bootstrap.min.css';
import './ElementConsole.css';
import {PopupLabelSendText} from "./ElementPopupLabel";

export default this;

type LogMessage = {
    text:string;
    time:string;
};

const logList = observable([] as LogMessage[]);

@observer
export class ElementConsole extends Component {
    render() {
        const listItems = logList.map((obj) =>
            <li key={LinearGenerator()} className=" "> {obj.time + " | " + obj.text} </li>
        );

        listItems.reverse();

        return (
            <div className='start-0 bottom-0 Log'>
                <ul id="consoleList" className="list-group Li disable-scrollbars">{listItems}</ul>
            </div>
        )
    }
}

export const LogSendText = (text: string, isPopup: boolean = false, timeout: number | undefined = undefined) => {
    if(isPopup)
    {
        PopupLabelSendText(text, timeout);
    }

    logList.push({
        text:text,
        time:new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    } as LogMessage);

    if(logList.length > 10)
    {
        logList.splice(0, 1);
    }
};
