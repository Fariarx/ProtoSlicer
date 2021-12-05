import {SupportDescriptionContact} from "../Contact/SupportDescriptionContact";

export enum SupportType {
    Cylinder
} 

export abstract class SupportDescription {
    contactWithModel: SupportDescriptionContact;
    material: THREE.Material;
    materialPreview: THREE.Material;

    modelOffsetY: number;//mm
    
    constructor(contact, material, materialPreview, modelOffsetY: number = 5) {
        this.contactWithModel = contact;
        this.material = material;
        this.materialPreview = materialPreview;
        this.modelOffsetY = modelOffsetY;
    }
}
