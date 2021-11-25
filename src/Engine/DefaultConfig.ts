export let DefaultConfig = {
    version:3,
    versionPrinterConfigs: 3,
    settings: {
        ui: {
            opacity: 0.8,
            colorBackground:'#1d1d1d',
            color1:'#2a2a2a',
            color2:'#575757'
        },
        scene:{
            workingPlaneLimitColor:'#895e5e',
            workingPlaneColor:"#3f4f68",
            transformAlignToPlane: true,
            sharpness:.0001
        }
    }
};

export const StoreConfig = {
    configName: 'main',
    defaults: DefaultConfig
};
