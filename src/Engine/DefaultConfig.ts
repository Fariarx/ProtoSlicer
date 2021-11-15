export let DefaultConfig = {
    version: 3,
    versionPrinterConfigs: 3,
    settings: {
        ui: {
            opacity: 0.8
        },
        scene:{
            workingPlaneColor:"#898989",
            transformAlignToPlane: true,
            sharpness:.00001
        }
    }
};

export const StoreConfig = {
    configName: 'main',
    defaults: DefaultConfig
};
