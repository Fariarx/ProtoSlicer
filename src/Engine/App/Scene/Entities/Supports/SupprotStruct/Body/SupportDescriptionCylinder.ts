import {SupportDescription} from "./SupportDescription";
import {SupportDescriptionContactSphere} from "../Contact/SupportDescriptionContactSphere";
import {SupportDescriptionContact} from "../Contact/SupportDescriptionContact";

//mm
export type CylinderSize = {
    radiusTop : number,
    radiusBottom : number,
    height : number,
    radialSegments : number
}

export class SupportDescriptionCylinder extends SupportDescription {
    sizeTop: CylinderSize;
    sizeCenter: CylinderSize;
    sizeBottom: CylinderSize;

    constructor(sizeTop: CylinderSize, sizeCenter: CylinderSize, sizeBottom: CylinderSize, contact: SupportDescriptionContact) {
        super(contact);

        this.sizeTop = sizeTop;
        this.sizeCenter = sizeCenter;
        this.sizeBottom = sizeBottom;
    }
}