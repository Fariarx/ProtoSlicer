import {Icon, Menu} from "semantic-ui-react";
import {Settings} from "../../Globals";
import {Component} from "react";
import {inject, observer} from "mobx-react";
import {autorun, observable} from "mobx";
import {Dispatch, EventEnum} from "../EventManager";
import {sceneStore} from "./SceneStore";

export enum TransformInstrumentEnum {
    None = 0,
    Move = "translate",
    Rotate = 'rotate',
    Scale = 'scale'
}

@observer
class SceneTransform extends Component<any, any> {
    constructor(props) {
        super(props);
    }

    handleItemClick = (e, obj) => {
        Dispatch(EventEnum.SELECT_TRANSFORM_MODE, { value: TransformInstrumentEnum[obj.name] });
    }

    render() {
        let select = sceneStore.transformInstrumentState;

        return (
            <div style={{
                width: "auto",
                height: "auto",
                padding: "1vmin",
                opacity: Settings().ui.opacity,
            }} className="position-fixed top-50 start-0 translate-middle-y">
                    <Menu vertical pointing fluid style={{ marginRight:'-0.4vw' }}>
                        <Menu.Item
                            name='Move'
                            active={select === TransformInstrumentEnum.Move}
                            onClick={this.handleItemClick}
                        >
                            <p>
                                <Icon  name='arrows alternate' size='large' />
                            </p>
                        </Menu.Item>

                        <Menu.Item
                            name='Rotate'
                            active={select === TransformInstrumentEnum.Rotate}
                            onClick={this.handleItemClick}
                        >
                            <p>
                                <Icon  name='refresh' size='large' />
                            </p>
                        </Menu.Item>

                        <Menu.Item
                            name='Scale'
                            active={select === TransformInstrumentEnum.Scale}
                            onClick={this.handleItemClick}
                        >

                            <p>
                                <Icon  name='expand' size='large' />
                            </p>
                        </Menu.Item>
                    </Menu>
            </div>
        )
    }
}

export default SceneTransform;
