import { EuclideanVector2D } from "./EuclideanVector";
import { Point } from "./Point";
import { Vector2D } from "./Vector";


export abstract class Shape {
    private storedCenter : Point;    

    constructor(center : Point) {
        this.storedCenter = center;
    }

    public get center() : Point {
        return this.storedCenter;
    }

    public set center(newc : Point) {
        this.move(new EuclideanVector2D(newc.x-this.storedCenter.x,newc.y-this.storedCenter.y));
    }

    /**
     * Move the shape in teh direction of the vector
     * @param v translation vector
     */
    move(v : Vector2D) : void {
        this.storedCenter = v.move(this.storedCenter);
    }

    /**
     * Scale the shape around its center
     * @param amt amount to scale shape by, must be non-zero
     */
    abstract scale(amt : number) : void;
}