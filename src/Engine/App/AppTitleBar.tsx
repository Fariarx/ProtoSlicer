import React, {Component} from "react";
import {Provider} from "mobx-react";
import {Scene} from "./Scene/Scene";
import DragAndDropModal from "./Scene/SceneDragAndDropModal";
import {ElementConsole} from "./Notifications/ElementConsole";
import ContainerRight from "./ContainerRight/ContainerRight";
import LabelPopup from "./Notifications/ElementPopupLabel";
import  './AppTitleBar.css'

export class AppTitleBar extends Component<any, any> {
    state: any = {
        isMinimized: false
    }
    render(): React.ReactNode {
        return (
            <div style={{
                width:'100%',
                height:'35px',
                background:'#323244'
            }} className={'titlebar'}>
            </div>
        );
    }
}