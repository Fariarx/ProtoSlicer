import {SupportDescriptionContact} from "../Contact/SupportDescriptionContact";

export enum SupportType {
    Cylinder
} 

export abstract class SupportDescription {
    contact: SupportDescriptionContact;
    contactForSupport: SupportDescriptionContact;
    material: THREE.Material;
    
    constructor(contact, material, contactForSupport) {
        this.contact = contact;
        this.material = material;
        this.contactForSupport = contactForSupport;
    }
}
