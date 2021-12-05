import {Header, Icon, Menu, Segment, SegmentGroup} from "semantic-ui-react";
import React, {Component} from "react";
import {observer} from "mobx-react";
import {AppEvents, EventEnum} from "../../../Managers/Events";
import {sceneStore, SceneUtils} from "../../SceneStore";

export enum AddingSupportsMode {
    none = 0,
    addSupports ,
    removeSupports ,
}

@observer
class AddingSupports extends Component<any, any> {
    state: any = {

    }

    supportButtons = (e, obj) => {
        AppEvents.Dispatch(EventEnum.SELECT_SUPPORTS_MODE, {
            mode: AddingSupportsMode[obj.name]
        });
    }

    componentDidMount() {
        this.state.listener = AppEvents.AddListener((message, args: any) => {
            const messages = [
                EventEnum.SELECT_SUPPORTS_MODE
            ];

            if(sceneStore.supportsInstrumentState !== AddingSupportsMode.none) {
                if (!messages.includes(message) || args.mode === AddingSupportsMode.none) {
                    SceneUtils.supportsInstrumentStateChanged();
                }
            }
        })
    }
    componentWillUnmount() {
        if(this.state.listener) {
            AppEvents.DeleteListener(this.state.listener);
            this.state.listener = null;
        }
    }

    render() {
        let mode = sceneStore.supportsInstrumentState;

        return (
            <SegmentGroup padded size={"tiny"} color='black' style={{
                width: '100%',
                height: 'auto',
                marginTop: '-1vmin',
            }}>
                <Segment inverted>
                    <Header as='h4'>
                        Adding supports
                    </Header>
                </Segment>
                <Segment inverted>
                    <Menu inverted  size={"mini"}  fluid >
                        <Menu.Item name={'addSupports'}  active={AddingSupportsMode.addSupports === mode}  onClick={this.supportButtons}>
                                <Icon name='bullseye'   size={"large"} />
                        </Menu.Item>
                        <Menu.Item name={'removeSupports'}  active={AddingSupportsMode.removeSupports === mode}   onClick={this.supportButtons}>
                                <Icon name='eraser'  size={"large"} />
                        </Menu.Item>
                        <Menu.Item name={'auto'} position='right'  onClick={()=>{

                        }}>
                            <p>
                                Auto
                            </p>
                        </Menu.Item>
                    </Menu>
                </Segment>
            </SegmentGroup>
        );
    }
}

export default AddingSupports;
