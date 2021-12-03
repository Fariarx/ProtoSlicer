import {SceneComponent} from './Scene/SceneComponent';
import { ElementConsole } from "./Scene/ChildrenUI/Notifications/ElementConsole";
import React, {Component} from "react";
import LabelPopup from "./Scene/ChildrenUI/Notifications/ElementPopupLabel";
import ContainerRight from "./Scene/ChildrenUI/ContainerRight/ContainerRight";
import {Provider} from "mobx-react";
import {sceneStore} from "./Scene/SceneStore";
import {AppTitleBar} from "./AppTitleBar";
import SceneUtilsTopBar from "./Scene/ChildrenUI/SceneUtilsTopBar";

let stores = {
    sceneStore
}

export class App extends Component<any, any> {
    render(): React.ReactNode {
        return (
            <Provider {...stores}>
                <div className="App" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    width: "100%",
                    height: '100%'
                }}>
                    <AppTitleBar style={{}}/>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        height: '100%',
                        width: '100%',
                        flexBasis:'fill',
                        background: 'firebrick',
                        justifyContent: 'space-between'
                    }}>
                         <SceneComponent>
                            <ElementConsole/>
                        </SceneComponent>
                        <SceneUtilsTopBar />
                        <ContainerRight />
                        <LabelPopup/>
                    </div>
                </div>
            </Provider>
        );
    }
}


export default App;
