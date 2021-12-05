import {SupportDescriptionContact} from "../Contact/SupportDescriptionContact";

export enum SupportType {
    Cylinder
} 

export abstract class SupportDescription {
    contactWithModel: SupportDescriptionContact;
    material: THREE.Material;
    materialPreview: THREE.Material;
    
    constructor(contact, material, materialPreview) {
        this.contactWithModel = contact;
        this.material = material;
        this.materialPreview = materialPreview;
    }
}
