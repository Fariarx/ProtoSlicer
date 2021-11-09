export let DefaultConfig = {
    version: 1,
    versionPrinterConfigs: 1,
    settings: {
        ui: {
            opacity: 0.8
        },
        scene:{
            workingPlaneColor:"#898989",
            transformAlignToPlane: true
        }
    }
};

export const StoreConfig = {
    configName: 'main',
    defaults: DefaultConfig
};
