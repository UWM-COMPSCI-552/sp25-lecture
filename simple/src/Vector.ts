import { Point } from "./Point";

export interface Vector2D {
    dx : number;
    dy : number;
    magnitude : number;
    angle : number
    add(other : Vector2D) : Vector2D;
    dot(other : Vector2D) : number
    scale(amt : number) : Vector2D;
    move(p : Point) : Point;

}

export abstract class AbstractVector {
    abstract dx : number;
    abstract dy : number;
    move(p : Point) : Point {
        const {x,y} = p;
        return {
            x: x + this.dx,
            y: y + this.dy,
        };
    }
}
