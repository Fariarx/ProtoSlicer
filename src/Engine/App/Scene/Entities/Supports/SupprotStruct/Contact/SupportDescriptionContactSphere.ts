export class SupportDescriptionContactSphere {
    segments: number = 8;
    diameter: number;
    deepening: number;//all mm
    
    constructor(diameter, deepening, segments?) {
        this.diameter = diameter;
        this.deepening = deepening;
        this.segments = segments;
    }
}