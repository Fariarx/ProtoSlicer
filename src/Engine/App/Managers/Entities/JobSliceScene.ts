import {Job} from "./Job";

import {Mesh, Scene} from "three";
import slice from "../../Utils/Slice";
import {sceneStore} from "../../Scene/SceneStore";
import {Printer} from "../../Configs/Printer";

export class JobSliceScene extends Job
{
    constructor(onResult: () => void, scene: Mesh)
    {
        super(onResult);

        slice(sceneStore.printer as Printer, 1);
      /*  let slicer = new Slicer();

        const geometry = GeometrySerializer.deserialize( scene.geometry );

        let settings  = {
            antialiasingLevel: 1,
            bottomLayCount: 5,
            bottomLayExposureTime: 12,
            bottomLayerCount: 5,
            bottomLayerExposureTime: 12,
            bottomLayerLiftHeight: 10,
            bottomLayerLiftSpeed: 60,
            bottomLightOffTime: 0,
            estimatedPrintTime: 0,
            fileName: "test.mince",
            isLicenseAccepted: true,
            layerHeight: 0.05,
            lightOffTime: 0,
            machineType: "default",
            machineX: 82.62,
            machineY: 130.56,
            machineZ: 160,
            maxDistance: 2500,
            maxWorkers: 7,
            mirror: 1,
            normalDropSpeed: 210,
            normalExposureTime: 2.5,
            normalLayerLiftHeight: 5,
            normalLayerLiftSpeed: 80,
            price: 0,
            projectType: "mirror_LCD",
            reliefEnabled: false,
            resin: "normal",
            resinDensity: 1.1,
            resinPriceKg: 0,
            resolutionX: 1620,
            resolutionY: 2560,
            showBuildVolumeBox: true,
            totalLayer: 0,
            volume: 0,
            weight: 0,
            zSlowUpDistance: 6,
        }

        slicer.setupPrint( geometry, {}, settings );

        let resolutionX = settings.resolutionX;
        let resolutionY = settings.resolutionY;

        let image = Slicer.createImage( resolutionX, resolutionY );

        slicer.sliceLayer( 50, image );

        console.log(image)*/
    }
}