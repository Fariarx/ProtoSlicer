import {SupportDescription} from "./SupportDescription";
import {SupportDescriptionContactSphere} from "../Contact/SupportDescriptionContactSphere";
import {SupportDescriptionContact} from "../Contact/SupportDescriptionContact";
import {Material} from "three";

//mm
export type CylinderSize = {
    diameterTop : number,
    diameterBottom : number,
    height: [number, number], //min max
    radialSegments : number
}
export type CylinderSizeCenter = {
    diameterTop : number,
    diameterBottom : number,
    radialSegments : number
}

export class SupportDescriptionCylinder extends SupportDescription {
    maximumAngle: number;

    sizeTop: CylinderSize;
    sizeCenter: CylinderSizeCenter;
    sizeBottom: CylinderSize;

    contact: SupportDescriptionContact;

    constructor(material: Material, sizeTop: CylinderSize, sizeCenter: CylinderSizeCenter, sizeBottom: CylinderSize, contact: SupportDescriptionContact, maximumAngle: number) {
        super(contact, material);

        this.contact = new SupportDescriptionContactSphere(sizeCenter.diameterTop, 0);
        this.sizeTop = sizeTop;
        this.sizeCenter = sizeCenter;
        this.sizeBottom = sizeBottom;
        this.maximumAngle = maximumAngle;
    }
}