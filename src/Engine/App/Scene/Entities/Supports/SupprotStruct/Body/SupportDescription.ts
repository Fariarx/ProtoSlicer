import {SupportDescriptionContact} from "../Contact/SupportDescriptionContact";

export enum SupportType {
    Cylinder
} 

export abstract class SupportDescription {
    contactWithModel: SupportDescriptionContact;
    material: THREE.Material;
    
    constructor(contact, material) {
        this.contactWithModel = contact;
        this.material = material;
    }
}
