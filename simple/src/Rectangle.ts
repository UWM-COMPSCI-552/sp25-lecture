import { Point } from "./Point";
import { Shape } from "./Shape";

export class Rectangle extends Shape {
    private width : number;
    private height : number;

    static midpoint(p1 : Point, p2: Point) : Point {
        return { x : (p1.x + p2.x)/2, y : (p1.y + p2.y) / 2};
    }

    constructor(center : Point, width : number, height : number)
    constructor(center : Point, size : number) // Square
    constructor(corner1 : Point, corner2 : Point) 
    constructor(p1 : Point, x : number | Point, y ?: number) {
        super(typeof x === 'number' ? p1 : Rectangle.midpoint(p1,x));
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
}