import { EuclideanVector2D } from './EuclideanVector';
import { Point } from './Point';
import { Vector2D } from './Vector';
export class PolarVector implements Vector2D {
    get dx() {
        return Math.cos(this.angle) * this.magnitude;
    }

    get dy(): number {
        return Math.sin(this.angle) * this.magnitude;
    }

    readonly magnitude: number;
    readonly angle: number;

    constructor (magnitude : number, angle : number) {
        this.magnitude = magnitude;
        this.angle = angle;
    }

    add(other: Vector2D): Vector2D {
        return new EuclideanVector2D(this.dx + other.dx, this.dy + other.dy);
    }

    dot(other: Vector2D): number {
        return ((this.dx * other.dx) + (this.dy * other.dy)); 
    }

    scale(amt: number): Vector2D {
        return new PolarVector(this.magnitude * amt, this.angle);
    }

    move(p : Point) : Point {
        let a = new ArrayBuffer(256);
        let u = new Uint8Array(a,35);
        u[5] = 42;
        u.fill(0,10,36);
        const {x,y} = p;
        return {
            x: x + this.dx,
            y: y + this.dy,
        };
    }
}