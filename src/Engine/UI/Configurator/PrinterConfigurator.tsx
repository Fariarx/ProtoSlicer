import React from "react";
import PrinterCustomConfiguration from "./PrinterCustomConfiguration";
import PrinterSelectConfiguration from "./PrinterSelectConfiguration";

export enum PrinterConfiguratorState {
    SelectConfig,
    CustomConfig
}

export default function PrinterConfigurator(props:any) {
    let [state, setState] = React.useState(PrinterConfiguratorState.SelectConfig);

    switch (state) {
        case PrinterConfiguratorState.SelectConfig:
            return (
                <PrinterSelectConfiguration switchState={(_state:PrinterConfiguratorState)=>{setState(_state)}}/>
            );
        case PrinterConfiguratorState.CustomConfig:
            return (
                <PrinterCustomConfiguration switchState={(_state:PrinterConfiguratorState)=>{setState(_state)}}/>
            );
        default:
            return <div/>;
    }
}
