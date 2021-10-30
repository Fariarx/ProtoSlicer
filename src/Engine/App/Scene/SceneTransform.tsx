import {Header, Icon, Menu, Segment, Step} from "semantic-ui-react";
import {storeMain} from "../../Bridge";
import {Log, Settings} from "../../Globals";
import {Component} from "react";

class SceneTransform extends Component<any, any> {
    state: any;

    constructor(props) {
        super(props);

        this.state = { active:'' };
    }

    handleItemClick = (e, obj) => {
        this.setState({ active: obj.name })
    }

    render() {
        return (
            <div style={{
                width: "auto",
                height: "auto",
                padding: "0.5vmin",
                opacity: Settings().ui.opacity
            }} className="position-fixed top-0 start-0">
                <Segment size={"mini"}>
                    <Menu vertical>
                        <Menu.Item
                            name='promotions'
                            active={this.state.active === 'promotions'}
                            onClick={this.handleItemClick}
                        >
                            <Header as='h4'>Promotions</Header>
                            <p>Check out our new promotions</p>
                        </Menu.Item>

                        <Menu.Item
                            name='coupons'
                            active={this.state.active === 'coupons'}
                            onClick={this.handleItemClick}
                        >
                            <Header as='h4'>Coupons</Header>
                            <p>Check out our collection of coupons</p>
                        </Menu.Item>

                        <Menu.Item
                            name='rebates'
                            active={this.state.active === 'rebates'}
                            onClick={this.handleItemClick}
                        >
                            <Header as='h4'>Rebates</Header>
                            <p>Visit our rebate forum for information on claiming rebates</p>
                        </Menu.Item>
                    </Menu>
                </Segment>
            </div>
        )
    }
}

export default SceneTransform;
