export class SupportDescriptionContactSphere {
    segments: number = 8;
    radius: number;
    deepening: number;//all mm
    
    constructor(radius, deepening, segments?) {
        this.radius = radius;
        this.deepening = deepening;
        this.segments = segments;
    }
}