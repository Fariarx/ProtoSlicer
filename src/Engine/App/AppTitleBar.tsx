import React, {Component} from "react";
import {Provider} from "mobx-react";
import {Scene} from "./Scene/Scene";
import DragAndDropModal from "./Scene/SceneDragAndDropModal";
import {ElementConsole} from "./Notifications/ElementConsole";
import ContainerRight from "./ContainerRight/ContainerRight";
import LabelPopup from "./Notifications/ElementPopupLabel";
import  './AppTitleBar.css'
import {Button, Header, Icon, Label} from "semantic-ui-react";
import {closeWindow, maximizeWindow, minimizeWindow} from "../Bridge";

export class AppTitleBar extends Component<any, any> {
    state: any = {
        isMinimized: false
    }
    render(): React.ReactNode {
        return (
            <div style={{
                width:'100%',
                height:'36px',
                background:'#1c1c1c',
                display:"flex",
                flexDirection:'row',
                justifyContent:'flex-end'
            }} className={'titlebar'} >
                <Header as='h3' inverted style={{ margin:'auto', marginLeft:'15px',  }} color='grey' content={'Proto slicer'} />
                <Button inverted icon={'window minimize'} secondary circular size={'mini'}  style={{marginTop:'auto', marginBottom:'auto' }} className={'titlebar-button'} onClick={()=>{ minimizeWindow() }}>

                </Button>
                <Button inverted icon={'window maximize'} secondary circular size={'mini'}  style={{marginTop:'auto', marginBottom:'auto' }} className={'titlebar-button'} onClick={()=>{ maximizeWindow() }}>

                </Button>
                <Button inverted icon={'close'} secondary circular size={'mini'}  style={{marginTop:'auto', marginBottom:'auto' }} className={'titlebar-button'} onClick={()=>{ closeWindow() }}>

                </Button>
            </div>
        );
    }
}