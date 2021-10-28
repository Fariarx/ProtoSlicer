import React from "react";
import PrinterCustomConfiguration from "./PrinterCustomConfiguration";
import PrinterSelectConfiguration from "./PrinterSelectConfiguration";

export enum PrinterConfiguratorState {
    SelectConfig,
    CustomConfig,
    ConfigReady
}

export default function PrinterConfigurator(props:any) {
    let [state, setState] = React.useState({
        value:PrinterConfiguratorState.SelectConfig as PrinterConfiguratorState,
        propsChildren:{} as any
    });

    let switchState = (_state: PrinterConfiguratorState, props1: any) => {
        if(_state === PrinterConfiguratorState.ConfigReady)
        {
            props.setupConfiguration(props1);
            return;
        }

        setState({
            value:_state,
            propsChildren:props1
        })
    }

    switch (state.value) {
        case PrinterConfiguratorState.SelectConfig:
            return (
                <PrinterSelectConfiguration switchState={switchState}/>
            );
        case PrinterConfiguratorState.CustomConfig:
            return (
                <PrinterCustomConfiguration propsChildren={state.propsChildren} switchState={switchState}/>
            );
        default:
            return <div/>;
    }
}
