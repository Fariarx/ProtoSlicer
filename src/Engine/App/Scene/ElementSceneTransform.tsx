import {Header, Icon, Menu, Segment, Step} from "semantic-ui-react";
import {storeMain} from "../../Bridge";
import {Log, Settings} from "../../Globals";
import {Component} from "react";

class ElementSceneTransform extends Component<any, any> {
    state: any;

    constructor(props) {
        super(props);

        this.state = { active:'' };
    }

    handleItemClick = (e, obj) => {
        let value = obj.name;

        if(value === this.state.active)
        {
            value = '';
        }

        this.setState({ active: value })
    }

    render() {
        return (
            <div style={{
                width: "auto",
                height: "auto",
                padding: "1vmin",
                marginTop: '-20vh',
                opacity: Settings().ui.opacity
            }} className="position-fixed top-50 start-0">
                    <Menu vertical pointing fluid style={{ marginRight:'-0.4vw' }}>
                        <Menu.Item
                            name='move'
                            active={this.state.active === 'move'}
                            onClick={this.handleItemClick}
                        >
                            <p>
                                <Icon  name='arrows alternate' size='large' />
                            </p>
                        </Menu.Item>

                        <Menu.Item
                            name='rotate'
                            active={this.state.active === 'rotate'}
                            onClick={this.handleItemClick}
                        >
                            <p>
                                <Icon  name='refresh' size='large' />
                            </p>
                        </Menu.Item>

                        <Menu.Item
                            name='scale'
                            active={this.state.active === 'scale'}
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

export default ElementSceneTransform;
