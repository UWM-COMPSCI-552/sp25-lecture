import { EuclideanVector2D } from "./EuclideanVector";
import { Point } from "./Point";

export interface Vector2D {
    dx : number;
    dy : number;
    magnitude : number;
    angle : number
    add(other : Vector2D) : Vector2D;

   /**
     * Multiplies corresponding elements and returns the sum.
     * @param other the vector to compute dot with
     * @returns the sum of the products of the coresponding elements
     */
   dot(other : Vector2D) : number;
   
    scale(amt : number) : Vector2D;
    move(p : Point) : Point;

}

export abstract class AbstractVector {
    abstract dx : number;
    abstract dy : number;
    constructor() {}
    
    add(other: Vector2D): Vector2D {
        return new EuclideanVector2D(this.dx + other.dx, this.dy + other.dy);
    }
    move(p : Point) : Point {
        const {x,y} = p;
        return {
            x: x + this.dx,
            y: y + this.dy,
        };
    }
    dot(other : Vector2D) : number {
        return this.dx * other.dx + this.dy * other.dy;
    }
}
