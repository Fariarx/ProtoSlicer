import React from "react";
import PrinterCustomConfiguration from "./PrinterCustomConfiguration";
import PrinterSelectConfiguration from "./PrinterSelectConfiguration";

export enum PrinterConfiguratorState {
    SelectConfig,
    CustomConfig
}

export default function PrinterConfigurator(props:any) {
    let [state, setState] = React.useState({
        value:PrinterConfiguratorState.SelectConfig as PrinterConfiguratorState,
        propsChildren:{} as any
    });

    switch (state.value) {
        case PrinterConfiguratorState.SelectConfig:
            return (
                <PrinterSelectConfiguration switchState={(_state: PrinterConfiguratorState, props1: any) => {
                    setState({
                        value:_state,
                        propsChildren:props1
                    })
                }}/>
            );
        case PrinterConfiguratorState.CustomConfig:
            return (
                <PrinterCustomConfiguration propsChildren={state.propsChildren}
                                            switchState={(_state: PrinterConfiguratorState, props1: any) => {
                                                setState({
                                                    value:_state,
                                                    propsChildren:props1
                                                })
                                            }}/>
            );
        default:
            return <div/>;
    }
}
