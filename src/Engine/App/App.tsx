import { Scene } from './Scene/Scene';
import { ElementConsole } from "./Notifications/ElementConsole";
import React, {Component} from "react";
import DragAndDropModal from "./Scene/SceneDragAndDropModal";
import LabelPopup from "./Notifications/ElementPopupLabel";
import ContainerRight from "./ContainerRight";
import {Button, Card, Feed} from "semantic-ui-react";

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
            <div className="App">
                <Scene dragAndDropSetState={this.showDragAndDropModal}>
                    {this.state.isShowDragAndDropModal && <DragAndDropModal/>}
                    <ElementConsole/>
                    <LabelPopup/>
                </Scene>

                <ContainerRight/>
            </div>
        );
    }
}


export default App;
