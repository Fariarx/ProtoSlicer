import './App.css';
import { Scene } from './Scene/Scene';
import { Console } from "./Notifications/Console";
import React, {Component} from "react";
import DragAndDropModal from "./Scene/SceneDragAndDropModal";
import LabelPopup from "./Notifications/PopupLabel";
import StepsTab from "./StepsTab";

export class App extends Component<any, any> {
    state: any = {
        isShowDragAndDropModal: false
    }
    showDragAndDropModal = (state: boolean) => {
        this.setState({
            isShowDragAndDropModal:state
        });
    }
    render(): React.ReactNode {
        return (
            <div className="App">
                <Scene dragAndDropSetState={this.showDragAndDropModal}>
                    {this.state.isShowDragAndDropModal && <DragAndDropModal/>}
                    <Console/>
                    <LabelPopup/>
                </Scene>
                
                <StepsTab/>
            </div>
        );
    }
}


export default App;
