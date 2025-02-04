import { Point } from "./Point";
import { Shape } from "./Shape";

export class Circle extends Shape {
    private radius : number;
    constructor (center : Point, radius : number) {
        super(center);
        if (radius === 0) throw new RangeError("radius cannot be zero");
        this.radius = radius;
    }

    override scale(amt : number) {
        if (amt === 0) throw RangeError("scale cannot be zero");
        this.radius *= amt;
    }
}