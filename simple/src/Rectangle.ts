import { Point } from "./Point.js";
import { Shape, ShapeJSON } from "./Shape.js";

export interface RectangleJSON extends ShapeJSON {
    width : number;
    height : number;
}

export class Rectangle extends Shape {
    private width : number;
    private height : number;

    static midpoint(p1 : Point, p2: Point) : Point {
        return { x : (p1.x + p2.x)/2, y : (p1.y + p2.y) / 2};
    }

    constructor(center : Point, width : number, height : number, id?:string)
    constructor(center : Point, size : number) // Square
    constructor(corner1 : Point, corner2 : Point) 
    constructor(p1 : Point, x : number | Point, y ?: number, id?:string) {
        super(typeof x === 'number' ? p1 : Rectangle.midpoint(p1,x), id);
        if (typeof x === 'number') {
            this.width = x;
            this.height = y ?? x;
        } else {
            this.width = x.x - p1.x;
            this.height = x.y - p1.y; 
        }
    }

    override scale(amt : number) {
        super.scale(amt);
        this.width *= amt; 
        this.height *= amt;
    }

    override draw(ctx: CanvasRenderingContext2D, isSelected ?: boolean): void {
        ctx.strokeStyle = isSelected ? 'magenta' : 'black';
        ctx.beginPath();
        ctx.rect(this.center.x-this.width/2, this.center.y-this.height/2, this.width, this.height);
        ctx.stroke();
    }

    override isOn(p: Point): boolean {
        const xdiff = Math.abs(p.x - this.center.x);
        const ydiff = Math.abs(p.y - this.center.y);
        const w2 = this.width / 2;
        const h2 = this.height / 2;
        const inRange = ( (xdiff <= w2) && (ydiff <= h2));
        const onEdges = (
            (Math.abs(xdiff - w2)) < Rectangle.CLOSE ||
            (Math.abs(ydiff - h2)) < Rectangle.CLOSE);
        return inRange && onEdges;
    }

    override toJSON() : RectangleJSON {
        const superj = super.toJSON();
        return {...superj, type: "Rectangle", height: this.height, width : this.width};
    }

    static factory(raw : ShapeJSON) : Rectangle {
        const json = raw as RectangleJSON;
        return new Rectangle(json.center, json.width, json.height, json.id);
    }

    static {
        Shape.addFactory("Rectangle", Rectangle.factory);
    }
}
