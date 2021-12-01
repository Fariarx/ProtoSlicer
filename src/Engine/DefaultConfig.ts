export let DefaultConfig = {
    version: 9,
    versionPrinterConfigs: 3,
    settings: {
        ui: {
            opacity: 0.8,
            colorBackgroundScene:'#2f2f2f',
            colorBackgroundSceneBottom:'#6c6c6c',
            colorBackground:'#1d1d1d',
            color1:'#2a2a2a',
        },
        scene:{
            workingPlaneLimitColor:'#d4605a',
            workingPlaneColor:"#68798d",
            transformAlignToPlane: true,
            setStartupPerspectiveCamera: true,
            sharpness:.0001
        },
        workerCount: 10,
        printerName: ''
    }
};

export const StoreConfig = {
    configName: 'main',
    defaults: DefaultConfig
};
