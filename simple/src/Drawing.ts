import { Shape } from "./Shape.js";

export type ShapeObserver = (d:Drawing) => void;

export class Drawing implements Iterable<Shape> {
    private contents : Array<Shape> = [];
    private observers : Array<ShapeObserver> = [];
    
    public add(sh :Shape) {
        this.contents.push(sh);
        this.notifyObservers();
    }

    /**
     * Remove a shape from the drawing.
     * @param sh shape to remove
     * @returns whether the shape was present and removed
     */
    public remove(sh: Shape) : boolean {
        const i = this.contents.indexOf(sh);
        if (i < 0) return false;
        this.contents.splice(i,1);
        this.notifyObservers();
        return true;
    }
    
    /**
     * Determine whether the shape is present.
     * @param sh shape to query
     * @returns whether the shape is in the drawing
     */
    public contains(sh: Shape) : boolean {
        const i = this.contents.indexOf(sh);
        return i >= 0;
    }

    public addObserver(obs : ShapeObserver) {
        this.observers.push(obs);
    }
    
    public removeObserver(obs : ShapeObserver) {
        const index = this.observers.findIndex((v) => v === obs);
        if (index === -1) return;
        this.observers.splice(index,1);
    }
    
    [Symbol.iterator](): Iterator<Shape> {
        return this.contents[Symbol.iterator]();
    }
    
    public notifyObservers() {
        for (const obs of this.observers) {
            obs(this);
        }
    }
}

export function makeDrawing() : Drawing { return new Drawing(); }
