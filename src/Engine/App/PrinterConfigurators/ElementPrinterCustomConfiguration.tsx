import React, {Component, useState} from "react";
import {
    Button,
    Container,
    Form,
    Header,
    Segment
} from "semantic-ui-react";
import 'bootstrap/dist/css/bootstrap.min.css';
import {PrinterConfiguratorState} from "./ContainerPrinterConfigurator";
import {observer} from "mobx-react";
import {Printer} from "../Configs/Printer";
import {PopupLabelSendText} from "../Notifications/ElementPopupLabel";
import {isFloat, isInteger, isNumeric} from "../Utils/Utils";
import {LogSendText} from "../Notifications/ElementConsole";

export class ElementPrinterCustomConfiguration extends Component<any, any> {
    constructor(props) {
        super(props);

        this.state = {
            printer: props.propsChildren && props.propsChildren.config ? props.propsChildren.config : new Printer(),
        }
    }

    isInputsValid = (log = false) => {
        if(!this.state.printer.name)
        {
            log && PopupLabelSendText("Configuration name not valid!");
            return false;
        }

        for(let value1 in this.state.printer)
        {
            for (let value2 in this.state.printer[value1])
            {
                if(!this.state.printer[value1][value2])
                {
                    log && PopupLabelSendText("Value '" + value1 + '.' + value2 + "' not valid!");
                    return false;
                }
            }
        }

        return true;
    }

    onChange = (e, data) => {
        if(data.name === "name")
        {
            this.state.printer.name = data.value;
        }
        else
        {
            let type = data.name.split('.');

            data.value = data.value.replace(',','.');

            switch (type[2]) {
                case 'number':
                    if(isNumeric(data.value) && isInteger(parseInt(data.value)) && !isFloat(parseFloat(data.value))) {
                        this.state.printer[type[0]][type[1]] = parseInt(data.value);
                        break;
                    }
                    else {
                        if(data.value.length === 0)
                        {
                            this.state.printer[type[0]][type[1]] = 0;
                            break;
                        }

                        e.target.value = this.state.printer[type[0]][type[1]];

                        LogSendText('Need to write integer numbers!', true);
                    }
                    break;
                case 'float':
                    if(isNumeric(data.value)) {
                        this.state.printer[type[0]][type[1]] = parseFloat(data.value);
                    }
                    else {
                        if(data.value.length === 0)
                        {
                            this.state.printer[type[0]][type[1]] = 0;
                            break;
                        }

                        e.target.value = this.state.printer[type[0]][type[1]];

                        LogSendText('Need to write float numbers!', true);
                    }
                    break;
            }

            this.setState(this.state);

            return;
        }
    }

    render(): React.ReactNode {
        return (
            <div style={{
                height: "100vh",
                width: "100vw",
                backgroundColor: "rgba(0,0,0,0.35)",
                position: "absolute"
            }}>
                <Container className='position-absolute top-50 start-50 translate-middle' style={{
                    width: "70vw",
                    height: "70vh",
                    backgroundColor: "#ffffff",
                    zIndex: 1,
                    borderRadius: "5px",
                    padding: "2vmin",
                    display: "flex",
                    flexDirection: "column",
                }}>
                    <Segment clearing>
                        <Header
                            as='h2'
                            content='Printer custom configurator'
                            subheader='Setup printer configuration'
                        />
                    </Segment>

                    <Container style={{
                        padding: '3vmin',
                        overflowX: "auto",
                        marginBottom: '2vmin'
                    }}>
                        <Form style={{
                            width: "100%"
                        }}>
                            <Form.Input name='name' onChange={this.onChange} label='Printer configuration name' placeholder='text' width={9} defaultValue={this.state.printer.name !== '' ? this.state.printer.name : undefined}/>
                            <Segment style={{padding: '3vmin', paddingBottom: '1vmin', paddingTop: '2vmin'}}>
                                <Form.Group widths='equal'>
                                    <Form.Input name='Workspace.sizeX.float' onChange={this.onChange} label='Workspace size X' placeholder='mm'  width={3} defaultValue={this.state.printer.Workspace.sizeX !== 0 ? this.state.printer.Workspace.sizeX : undefined} />
                                    <Form.Input name='Workspace.sizeY.float' onChange={this.onChange} label='Workspace size Y' placeholder='mm'  width={3} defaultValue={this.state.printer.Workspace.sizeY !== 0 ? this.state.printer.Workspace.sizeY : undefined} />
                                    <Form.Input name='Workspace.height.float' onChange={this.onChange} label='Workspace height' placeholder='mm'  width={3} defaultValue={this.state.printer.Workspace.height !== 0 ? this.state.printer.Workspace.height : undefined}  />
                                </Form.Group>
                                <Form.Group widths='equal'>
                                    <Form.Input name='Resolution.X.number' onChange={this.onChange} label='Screen resolution X' placeholder='mm' width={3} defaultValue={this.state.printer.Resolution.X !== 0 ? this.state.printer.Resolution.X : undefined} />
                                    <Form.Input name='Resolution.Y.number' onChange={this.onChange} label='Screen resolution Y' placeholder='mm' width={3} defaultValue={this.state.printer.Resolution.Y !== 0 ? this.state.printer.Resolution.Y : undefined} />
                                </Form.Group>
                            </Segment>
                            <Segment style={{padding: '3vmin', paddingBottom: '1vmin', paddingTop: '2vmin'}}>
                                <Form.Group widths='equal'>
                                    <Form.Input name='PrintSettings.LayerHeight.float' onChange={this.onChange} label='Layer height' placeholder='mm' width={3} defaultValue={this.state.printer.PrintSettings.LayerHeight !== 0 ? this.state.printer.PrintSettings.LayerHeight : undefined} />
                                    <Form.Input name='PrintSettings.BottomLayers.number' onChange={this.onChange} label='Bottom layers' placeholder='mm' width={3} defaultValue={this.state.printer.PrintSettings.BottomLayers !== 0 ? this.state.printer.PrintSettings.BottomLayers : undefined} />
                                    <Form.Input name='PrintSettings.ExposureTime.float'onChange={this.onChange} label='Exposure time' placeholder='mm' width={3} defaultValue={this.state.printer.PrintSettings.ExposureTime !== 0 ? this.state.printer.PrintSettings.ExposureTime : undefined} />
                                </Form.Group>
                                <Form.Group widths='equal'>
                                    <Form.Input name='PrintSettings.BottomExposureTime.float' onChange={this.onChange} label='Bottom exposure time' placeholder='mm' width={3} defaultValue={this.state.printer.PrintSettings.BottomExposureTime!== 0 ? this.state.printer.PrintSettings.BottomExposureTime : undefined} />
                                    <Form.Input name='PrintSettings.LiftingHeight.float' onChange={this.onChange} label='Lifting height' placeholder='mm' width={3} defaultValue={this.state.printer.PrintSettings.LiftingHeight !== 0 ? this.state.printer.PrintSettings.LiftingHeight : undefined} />
                                    <Form.Input name='PrintSettings.LiftingSpeed.float' onChange={this.onChange} label='Lifting speed' placeholder='mm' width={3} defaultValue={this.state.printer.PrintSettings.LiftingSpeed !== 0 ? this.state.printer.PrintSettings.LiftingSpeed : undefined} />
                                </Form.Group>
                            </Segment>
                        </Form>
                    </Container>

                    <div style={{
                        marginTop: 'auto',
                        marginLeft: 'auto'
                    }}>
                        <Button content='Back' icon='sign-in alternate' labelPosition='left'
                                onClick={() => this.props.switchState(PrinterConfiguratorState.SelectConfig)}/>
                        <Button
                            content='Save and continue'
                            icon='right arrow'
                            color={this.isInputsValid() ? 'green' : undefined}
                            labelPosition='right'
                            onClick={() => {
                                if(!this.isInputsValid(true))
                                {
                                    return;
                                }

                                if(Printer.SaveToFile(this.state.printer)) {
                                    LogSendText("Custom config with name '" + this.state.printer.name + "' has been created!", true);
                                }
                                else {
                                    LogSendText("Configuration save error", true);
                                    return;
                                }

                                this.props.switchState(PrinterConfiguratorState.ConfigReady, this.state.printer);
                            }}
                        />
                    </div>
                </Container>
            </div>
        );
    }
}

export default ElementPrinterCustomConfiguration;
