import {observer} from "mobx-react";
import React, {Component} from "react";
import {SaveSettings, Settings} from "../../Globals";
import SceneTransformBar, {TransformInstrumentEnum} from "./SceneTransformBar";
import {Icon, Menu} from "semantic-ui-react";
import {sceneStore} from "./SceneStore";
import {PerspectiveCamera} from "three";

@observer
class SceneUtilsTopBar extends Component<any, any> {
    render() {
        return (
            <div style={{
                marginLeft: '8vmin',
                height: "auto",
                padding: "1vmin",
                opacity: Settings().ui.opacity,
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start"
            }}>
                <SceneTransformBar/>

                <Menu  inverted  compact style={{marginLeft: '10vmin'}}>
                    <Menu.Item name='SwitchCameraType' onClick={() => {
                        console.log(sceneStore.activeCamera instanceof PerspectiveCamera === false)
                        sceneStore.switchCameraType(sceneStore.activeCamera instanceof PerspectiveCamera === false);
                    }}>
                        <p>
                            <Icon name='low vision' size='large' inverted />
                        </p>
                    </Menu.Item>
                </Menu>
            </div>
        )
    }
}

export default SceneUtilsTopBar;