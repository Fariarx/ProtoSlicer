import { ContainerScene } from './Scene/ContainerScene';
import { ElementConsole } from "./Notifications/ElementConsole";
import React, {Component} from "react";
import DragAndDropModal from "./Scene/SceneDragAndDropModal";
import LabelPopup from "./Notifications/ElementPopupLabel";
import ContainerBottomRight from "./ContainerBottomRight";
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
                <ContainerScene dragAndDropSetState={this.showDragAndDropModal}>
                    {this.state.isShowDragAndDropModal && <DragAndDropModal/>}
                    <ElementConsole/>
                    <LabelPopup/>
                </ContainerScene>

                <ContainerBottomRight/>
            </div>
        );
    }
}


export default App;
