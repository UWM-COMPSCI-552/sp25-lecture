import { nanoid } from "nanoid";
import { EuclideanVector2D } from "./EuclideanVector";
import { Point } from "./Point";
import { Vector2D } from "./Vector";

export interface ShapeJSON {
    type : string;
    id : string;
    center : Point;
}

export type ShapeFactory = (json : ShapeJSON) => Shape;

export abstract class Shape {
    private static factoryRegistry : Map<string, ShapeFactory> = new Map();
    private static registry : Map<string,Shape> = new Map();

    protected static addFactory(type:string, f : ShapeFactory) {
        Shape.factoryRegistry.set(type, f);
    }

    public static lookup(id : string) : Shape | undefined {
        return Shape.registry.get(id);
    }

    public static fromJSON(json : ShapeJSON) : Shape {
        let result = Shape.registry.get(json.id);
        if (!result) {
            result = Shape.factoryRegistry.get(json.type)?.(json);
            if (!result) {
                throw Error("no factory defined for " + json.type);
            }
        }
        return result;
    }
    
    private storedCenter : Point;  
    readonly id : string;  

    constructor(center : Point, id?:string) {
        this.storedCenter = center;
        if (id) this.id = id;
        else this.id = nanoid();
        if (Shape.registry.has(this.id)) throw Error("shape already created for " + id);
        Shape.registry.set(this.id, this); // XXX: gc issues
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
    scale(amt : number) : void {
        if (amt === 0) throw new RangeError("cvannot scale by zero");
    }

    abstract draw(ctx : CanvasRenderingContext2D, isSelected?:boolean ) : void;

    toJSON() : ShapeJSON {
        return {type: "abstract", id: this.id, center : this.center};
    }

    /**
     * Tolerance for clicking.
     */
    static readonly CLOSE = 2;

    /**
     * Is the point on this shape?
     * @param p point to examine
     * @return whether the shape contains the point
     */
    abstract isOn(p : Point) : boolean;
}