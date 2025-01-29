import { EuclideanVector2D } from './EuclideanVector';
import { Point } from './Point';
import { Vector2D, AbstractVector } from './Vector';

export class PolarVector extends AbstractVector {
    get dx() {
        return Math.cos(this.angle) * this.magnitude;
    }

    get dy(): number {
        return Math.sin(this.angle) * this.magnitude;
    }

    readonly magnitude: number;
    readonly angle: number;

    constructor (magnitude : number, angle : number) {
        super();
        this.magnitude = magnitude;
        this.angle = angle;
    }

    add(other: Vector2D): Vector2D {
        return new EuclideanVector2D(this.dx + other.dx, this.dy + other.dy);
    }

    scale(amt: number): Vector2D {
        return new PolarVector(this.magnitude * amt, this.angle);
    }

}