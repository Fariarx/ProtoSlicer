import {Scene} from './Scene/Scene';
import { ElementConsole } from "./Notifications/ElementConsole";
import React, {Component} from "react";
import DragAndDropModal from "./Scene/SceneDragAndDropModal";
import LabelPopup from "./Notifications/ElementPopupLabel";
import ContainerRight from "./ContainerRight/ContainerRight";
import {Button, Card, Feed} from "semantic-ui-react";
import {Provider} from "mobx-react";
import {sceneStore} from "./Scene/SceneStore";

let stores = {
    sceneStore
}

export class App extends Component<any, any> {
    state: any = {
        isShowDragAndDropModal: false
    }
    showDragAndDropModal = (state: boolean) => {
        this.setState({
            isShowDragAndDropModal:state
        });
    }
    update = function() {

    }
    render(): React.ReactNode {
        return (
            <Provider {...stores}>
                <div className="App">
                    <Scene dragAndDropSetState={this.showDragAndDropModal}>
                        {this.state.isShowDragAndDropModal && <DragAndDropModal/>}
                        <ElementConsole/>
                        <LabelPopup/>
                    </Scene>

                    <ContainerRight/>
                </div>
            </Provider>
        );
    }
}


export default App;
