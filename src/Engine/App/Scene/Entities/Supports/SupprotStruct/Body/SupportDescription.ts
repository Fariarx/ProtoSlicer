import {SupportDescriptionContact} from "../Contact/SupportDescriptionContact";

export enum SupportType {
    Cylinder
} 

export abstract class SupportDescription {
    contact: SupportDescriptionContact;
    
    constructor(contact) {
        this.contact = contact;
    }
}
