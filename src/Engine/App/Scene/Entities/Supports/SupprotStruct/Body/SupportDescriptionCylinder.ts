import {SupportDescription} from "./SupportDescription";
import {SupportDescriptionContactSphere} from "../Contact/SupportDescriptionContactSphere";
import {SupportDescriptionContact} from "../Contact/SupportDescriptionContact";
import {Material} from "three";

//mm
export type CylinderSize = {
    radiusTop : number,
    radiusBottom : number,
    height: [number, number], //min max
    radialSegments : number
}
export type CylinderSizeCenter = {
    radiusTop : number,
    radiusBottom : number,
    radialSegments : number
}

export class SupportDescriptionCylinder extends SupportDescription {
    sizeTop: CylinderSize;
    sizeCenter: CylinderSizeCenter;
    sizeBottom: CylinderSize;

    constructor(material: Material, sizeTop: CylinderSize, sizeCenter: CylinderSizeCenter, sizeBottom: CylinderSize, contact: SupportDescriptionContact) {
        super(contact, material, new SupportDescriptionContactSphere(sizeCenter.radiusTop, 0));

        this.sizeTop = sizeTop;
        this.sizeCenter = sizeCenter;
        this.sizeBottom = sizeBottom;
    }
}