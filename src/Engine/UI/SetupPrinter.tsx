import React from "react";
import _ from 'lodash'
import {Card, Container, Divider, Header, Search, Segment} from "semantic-ui-react";

const source = JSON.parse('[\n' +
    '  {\n' +
    '    "title": "Little and Sons",\n' +
    '    "description": "Multi-layered context-sensitive neural-net",\n' +
    '    "image": "https://s3.amazonaws.com/uifaces/faces/twitter/murrayswift/128.jpg",\n' +
    '    "price": "$87.69"\n' +
    '  },\n' +
    '  {\n' +
    '    "title": "Nicolas Inc",\n' +
    '    "description": "Synchronised motivating challenge",\n' +
    '    "image": "https://s3.amazonaws.com/uifaces/faces/twitter/wegotvices/128.jpg",\n' +
    '    "price": "$69.38"\n' +
    '  },\n' +
    '  {\n' +
    '    "title": "Sipes, Raynor and Thompson",\n' +
    '    "description": "Integrated asymmetric forecast",\n' +
    '    "image": "https://s3.amazonaws.com/uifaces/faces/twitter/digitalmaverick/128.jpg",\n' +
    '    "price": "$5.53"\n' +
    '  },\n' +
    '  {\n' +
    '    "title": "Brown, Pagac and Parisian",\n' +
    '    "description": "Re-contextualized eco-centric customer loyalty",\n' +
    '    "image": "https://s3.amazonaws.com/uifaces/faces/twitter/kevka/128.jpg",\n' +
    '    "price": "$94.11"\n' +
    '  },\n' +
    '  {\n' +
    '    "title": "Flatley - Hessel",\n' +
    '    "description": "Advanced leading edge service-desk",\n' +
    '    "image": "https://s3.amazonaws.com/uifaces/faces/twitter/davidmerrique/128.jpg",\n' +
    '    "price": "$80.38"\n' +
    '  }\n' +
    ']')

const initialState = {
    loading: false,
    results: [],
    value: '',
}

function reducer(state, action) {
    switch (action.type) {
        case 'CLEAN_QUERY':
            return initialState
        case 'START_SEARCH':
            return { ...state, loading: true, value: action.query }
        case 'FINISH_SEARCH':
            return { ...state, loading: false, results: action.results }
        case 'UPDATE_SELECTION':
            return { ...state, value: action.selection }

        default:
            throw new Error()
    }
}

function SetupPrinter(props: any) {
    const [state, dispatch] = React.useReducer(reducer, initialState);
    const {loading, results, value} = state

    var timeout;

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
                results: _.filter(source, isMatch),
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
            backgroundColor: "rgba(0,0,0,0.45)",
            position: "absolute"
        }}>
            <Container className='position-absolute top-50 start-50 translate-middle' style={{
                width: "70vw",
                height: "70vh",
                backgroundColor: "#ffffff",
                zIndex: 1,
                borderRadius: "5px",
                padding: "2%"
            }}>
                <Segment clearing>
                    <Header
                        as='h2'
                        content='Printer configurator'
                        subheader='Select a printer configuration or create a new one'
                    />
                </Segment>
                <Container style={{ marginTop:'5vh' }}>
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
                            opacity:'0.8'
                        }}
                    />
                </Container>
                <Divider />
            </Container>
        </div>
    );
}

export default SetupPrinter
