import './App.css';
import { Scene } from '../Scene/Scene';
import { Console } from "../UI/Console/Console";
import {Component} from "react";
import DragAndDropModal from "../Scene/SceneDragAndDropModal";

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
                <Scene dragAndDropSetState={this.showDragAndDropModal}/>
                <Console/>
                {this.state.isShowDragAndDropModal && <DragAndDropModal/>}
            </div>
        );
    }
}


export default App;
