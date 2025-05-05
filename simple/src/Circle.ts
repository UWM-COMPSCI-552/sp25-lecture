import { EuclideanVector2D } from "./EuclideanVector.js";
import { Point } from "./Point.js";
import { Shape, ShapeJSON } from "./Shape.js";

export interface CircleJSON extends ShapeJSON {
    radius : number;
}

export class Circle extends Shape {
    private radius : number;
    constructor (center : Point, radius : number, id?:string) {
        super(center,id);
        if (radius === 0) throw new RangeError("radius cannot be zero");
        this.radius = radius;
    }

    override scale(amt : number) {
        if (amt === 0) throw RangeError("scale cannot be zero");
        this.radius *= amt;
    }

    override draw(ctx: CanvasRenderingContext2D, isSelected ?: boolean): void {
        ctx.strokeStyle = isSelected ? 'magenta' : 'black';
        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI*2);
        ctx.stroke();
    }

    override toJSON() : CircleJSON {
        const superj = super.toJSON();
        return {...superj, type:"Circle", radius:this.radius};
    }

    override isOn(p: Point): boolean {
        const dist = EuclideanVector2D.fromPoints(this.center, p).magnitude;
        return Math.abs(dist - this.radius) < Shape.CLOSE;
    }

    static factory(raw : ShapeJSON) : Circle {
        const json = raw as CircleJSON;
        return new Circle(json.center, json.radius, json.id);
    }

    static {
        Shape.addFactory("Circle", Circle.factory);
    }
}
