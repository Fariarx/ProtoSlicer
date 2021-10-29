import React, {Component} from "react";
import _ from 'lodash'
import {
    Accordion,
    Button,
    Card,
    Container,
    Divider,
    Form,
    Header,
    Icon,
    Menu,
    Search,
    Segment
} from "semantic-ui-react";
import {LinearGenerator} from "../../Utils";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Printer} from "../Configs/Printer";
import {PrinterConfiguratorState} from "./PrinterConfigurator";
import {PopupLabelSendText} from "../Notifications/PopupLabel";
import {LogSendText} from "../Notifications/Console";


function ListElement(props: any) {
    /*let [activeIndex, setActiveIndex] = React.useState({activeIndex: -1});

    let handleClick = (e, titleProps) => {
        const {index} = titleProps
        const {activeIndex} = this.state
        const newIndex = activeIndex === index ? -1 : index

        setActiveIndex(newIndex)
    }*/

    let list = props.list?.map((obj) =>
        <Menu.Item active={props.activeNameModel === (props.manufacturer + obj.title)}
            name={obj.title}
            manufacturer={props.manufacturer}
            onClick={props.selectModel}
        />
    );

    return (
        <div>
            <Accordion.Title
                index={props.index}
                onClick={props.onClickManufacturer}
                active={props.activeIndexManufacturer === props.index}
            >
                <Icon name='dropdown' className='float-end'/>
                <p style={{textAlign:'start'}}>
                    {props.manufacturer}
                </p>
            </Accordion.Title>
            <Accordion.Content active={props.activeIndexManufacturer === props.index}>
                <Menu  vertical>
                    {list}
                </Menu>
            </Accordion.Content>
        </div>
    );
}

class AccordionList extends Component<any> {
    state = {activeIndexManufacturer: -1, activeNameModel: ""}

    constructor(props) {
        super(props);
    }

    handleClickModel = (e, titleProps) => {
        this.props.changePrinter(titleProps.name);

        this.setState({
            activeNameModel: titleProps.manufacturer + titleProps.name
        })
    }

    handleClickManufacturer = (e, titleProps) => {
        const {index} = titleProps
        const {activeIndexManufacturer} = this.state
        const newIndex = activeIndexManufacturer === index ? -1 : index

        this.setState({
            activeIndexManufacturer: newIndex
        })
    }

    render() {
        let list = [] as any;
        let count = 0;

        for (let manufacturer in printerWithManufacturerNames) {
            list.push(
                <ListElement
                    activeNameModel={this.state.activeNameModel}
                    activeIndexManufacturer={this.state.activeIndexManufacturer}
                    index={count} manufacturer={manufacturer}
                    list={printerWithManufacturerNames[manufacturer]}
                    onClickManufacturer={this.handleClickManufacturer}
                    selectModel={this.handleClickModel}
                />);

            count++;
        }

        return (
            <Accordion fluid styled>
                {list}
            </Accordion>
        )
    }
}

let printerWithManufacturerNames;
let printerNames;

function PrinterSelectConfiguration(props: any) {
    const initialState = {
        loading: false,
        results: [],
        value: '',
    }

    const [state, dispatch] = React.useReducer(reducer, initialState);
    const {loading, results, value} = state;

    function reducer(state, action) {
        switch (action.type) {
            case 'CLEAN_QUERY':
                return initialState
            case 'START_SEARCH':
                return {...state, loading: true, value: action.query}
            case 'FINISH_SEARCH':
                return {...state, loading: false, results: action.results}
            case 'UPDATE_SELECTION':
                return {...state, value: action.selection}

            default:
                throw new Error()
        }
    }

    printerWithManufacturerNames = {};
    printerNames = Printer.ParseConfigFileNames();
    printerNames = printerNames.map((t) => {
        let splited = t.split(' ');
        let objName = (splited.length <= 1 ? 'Unnamed' : splited[0]);

        if (!printerWithManufacturerNames[objName]) {
            printerWithManufacturerNames[objName] = [] as any;
        }

        let obj = {
            title: t
        };

        printerWithManufacturerNames[objName].push(obj);

        return obj;
    })

    let isValidConfiguration = function (name) {
        let isNormal = false;

        printerNames.some((t) => {
            if(t.title === name)
            {
                isNormal = true;
                return true;
            }
        })

        return isNormal;
    }

    let timeout;

    const handleSearchChange = React.useCallback((e, data) => {
        clearTimeout(timeout)

        dispatch({type: 'START_SEARCH', query: data.value})

        timeout = setTimeout(() => {
            if (data.value.length === 0) {
                dispatch({type: 'CLEAN_QUERY'})
                return
            }

            const re = new RegExp(_.escapeRegExp(data.value), 'i')
            const isMatch = (result) => re.test(result.title)

            dispatch({
                type: 'FINISH_SEARCH',
                results: _.filter(printerNames, isMatch),
            })
        }, 300)
    }, [])

    React.useEffect(() => {
        return () => {
            clearTimeout(timeout)
        }
    }, [])

    const resultRenderer = ({title}) => <Header as='h4'>{title}</Header>

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
                        content='Printer selector'
                        subheader='Select a printer configuration or create a new one'
                    />
                </Segment>
                <Container style={{marginTop: '5vh'}}>
                    <Search
                        aligned={"right"}
                        input={{fluid: true}}
                        loading={loading}
                        onResultSelect={(e, data) =>
                            dispatch({type: 'UPDATE_SELECTION', selection: data.result.title})
                        }
                        onSearchChange={handleSearchChange}
                        resultRenderer={resultRenderer}
                        results={results}
                        value={value}
                        style={{
                            width: "100%",
                            zIndex: 2
                        }}
                        placeholder='Search model configuration...'
                    />
                </Container>
                <Divider/>
                <div style={{
                    overflowY: "auto",
                    paddingLeft: '2vmin',
                    paddingRight: '2vmin',
                    paddingTop: '3px',
                    paddingBottom: '3px',
                }}>
                    <AccordionList
                        changePrinter={(printerName) => {
                            dispatch({type: 'UPDATE_SELECTION', selection: printerName})
                        }}
                    />
                </div>
                <div style={{
                    marginTop: 'auto',
                    marginLeft: 'auto'
                }}>
                    <Button
                        content='Custom for new or selected'
                        icon='list'
                        labelPosition='left'
                        onClick={() => {
                            props.switchState(PrinterConfiguratorState.CustomConfig, { config: isValidConfiguration(state.value) ? Printer.LoadConfigFromFile(state.value) : null })
                        }}/>
                    <Button
                        content='Next'
                        icon='right arrow'
                        color={ isValidConfiguration(state.value) ? 'green' : undefined }
                        labelPosition='right'
                        onClick={()=>{
                            if(!isValidConfiguration(state.value))
                            {
                                LogSendText("You need to choose a configuration", true);
                                return;
                            }

                            let config = Printer.LoadConfigFromFile(state.value);

                            if (!config)
                            {
                                LogSendText("Error of loading file", true);
                                return;
                            }

                            props.switchState(PrinterConfiguratorState.ConfigReady, config);
                        }}
                    />
                </div>
            </Container>
        </div>
    );
}

export default PrinterSelectConfiguration
