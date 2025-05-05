import { Point } from './Point.js';
import { AbstractVector, Vector2D } from './Vector.js';

export class EuclideanVector2D extends AbstractVector {
    readonly dx : number;
    readonly dy : number;

    constructor ()
    /**
     * Create a vector with this value for x and one more for y.
     * So, if we say new EuclideanVector2D(3) then the dy will be 4.
     * @param dx the first value
     */
    constructor (dx : number)
    constructor (dx : number, dy : number)
    constructor (dx ?: number, dy ?: number) { // implementation only (private)
        super();
        if (dx !== undefined) {
            this.dx = dx;
            this.dy = dy ?? dx+1
        } else {
            // dx is undefined
            this.dx = this.dy = 0;
        }
    }

    public static fromPoints(p1 : Point, p2 : Point) {
        return new EuclideanVector2D(p2.x - p1.x, p2.y - p1.y);
    }
    
    toString() : string {
        /*
         *Template string: starts in backquotesd, with holes
         * filled in from ${...}
         */
        return `<${this.dx},${this.dy}>`;
    }

    get magnitude() : number {
        return Math.sqrt( this.dx * this.dx + this.dy * this.dy);
    }

    get angle() : number {
        return Math.atan2(this.dy, this.dx);
    }

   /**
     * Returns a new vector which is this vector scaled by the amount.
     * @param amt the amount (a number)
     * @returns vector which is the scaling of this
     */
    scale(amt : number) : Vector2D {
        return new EuclideanVector2D(this.dx * amt, this.dy * amt);
    }

}