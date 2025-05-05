import { EuclideanVector2D } from "./EuclideanVector.js";
import { Point } from "./Point.js";
import { Shape, ShapeJSON } from "./Shape.js";
import { Vector2D } from "./Vector.js";

export interface GroupJSON extends ShapeJSON {
    elements : ShapeJSON[];
}

export class Group extends Shape implements Iterable<Shape> {
    private elements : Array<Shape>;

    private static computeCenter(elements : Array<Shape>) : Point {
        const n = elements.length;
        if (n === 0) return {x:0, y:0};
        let sx = 0;
        let sy = 0;
        for (const e of elements) {
            sx += e.center.x;
            sy += e.center.y;
        }
        return { x : sx / n, y : sy / n};
    }

    constructor(elements ?: Array<Shape>, id?: string) {
        super(Group.computeCenter(elements ?? []), id);
        this.elements = elements ?? [];
    }

    public size() : number {
        return this.elements.length;
    }

    *[Symbol.iterator](): Iterator<Shape, number, boolean | undefined> {
        for (let i = 0; i < this.elements.length; ++i) {
            if (yield this.elements[i]) { // client wants to remove it
                this.elements.splice(i,1); // XXX: Boyland homework, maybe have to shift over
                // From this point, we assume the array elements has been removed and
                // the entire array is shorter than it was
                --i;
            }
        }
        return this.elements.length;
    }

    override move(v : Vector2D) {
        super.move(v);
        for (const s of this.elements) {
            s.move(v);
        }
    }

    override scale(amt : number) {
        super.scale(amt);
        for (const s of this.elements) {
            const orig = EuclideanVector2D.fromPoints(this.center, s.center);
            s.scale(amt);
            s.move(orig.scale(amt-1));
        }
    }

    override draw(ctx: CanvasRenderingContext2D): void {
        for (const s of this.elements) {
            s.draw(ctx);
        }
    }

    override isOn(p: Point): boolean {
        for (const s of this.elements) {
            if (s.isOn(p)) return true;
        }
        return false;
    }

    override toJSON() : GroupJSON {
        const superj = super.toJSON();
        return { ...superj,  type: "Group", elements: this.elements.map((sh) => sh.toJSON())};
    }

    static {
        Shape.addFactory("Group", groupFactory);
    }
}

function groupFactory(json : ShapeJSON) : Group {
    const json2 = json as GroupJSON;
    const elems = json2.elements.map((e) => Shape.fromJSON(e));
    const result = new Group(elems, json.id);
    return result;
}


