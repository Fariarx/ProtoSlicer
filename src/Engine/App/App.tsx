import {Scene} from './Scene/Scene';
import { ElementConsole } from "./Notifications/ElementConsole";
import React, {Component} from "react";
import DragAndDropModal from "./Scene/SceneDragAndDropModal";
import LabelPopup from "./Notifications/ElementPopupLabel";
import ContainerRight from "./ContainerRight/ContainerRight";
import {Button, Card, Feed} from "semantic-ui-react";
import {Provider} from "mobx-react";
import {sceneStore} from "./Scene/SceneStore";
import {AppTitleBar} from "./AppTitleBar";
import SceneTransformBar from "./Scene/SceneTransformBar";
import SceneUtilsTopBar from "./Scene/SceneUtilsTopBar";

let stores = {
    sceneStore
}

export class App extends Component<any, any> {
    state: any = {
        isShowDragAndDropModal: false
    }
    showDragAndDropModal = (state: boolean) => {
        this.setState({
            isShowDragAndDropModal: state
        });
    }
    update = function () {

    }

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
                         <Scene dragAndDropSetState={this.showDragAndDropModal}>
                            {this.state.isShowDragAndDropModal && <DragAndDropModal/>}
                            <ElementConsole/>
                        </Scene>
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
