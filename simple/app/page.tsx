'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Circle } from "@/src/Circle";
import { EuclideanVector2D } from "@/src/EuclideanVector";
import { Point } from "@/src/Point";
import { Rectangle } from "@/src/Rectangle";
import { Shape } from "@/src/Shape";

//import { writeFile } from 'node:fs'; 

type ShapeObserver = (d:Drawing) => void;

class Drawing implements Iterable<Shape> {
    private contents : Array<Shape> = [];
    private observers : Array<ShapeObserver> = [];
    
    public add(sh :Shape) {
        this.contents.push(sh);
        this.notifyObservers();
    }
    
    public addObserver(obs : ShapeObserver) {
        this.observers.push(obs);
    }
    
    public removeObserver(obs : ShapeObserver) {
        const index = this.observers.findIndex((v) => v === obs);
        if (index === -1) return;
        this.observers.splice(index,1);
    }
    
    [Symbol.iterator](): Iterator<Shape, any, any> {
        return this.contents[Symbol.iterator]();
    }
    
    public notifyObservers() {
        for (const obs of this.observers) {
            obs(this);
        }
    }
}


function makeDrawing() : Drawing { return new Drawing(); }

interface Mode {
    mouseDown(p : Point) :  void;
    mouseDrag(p : Point) : void;
    mouseUp(p : Point) : void;
}

type CreateFunction = (pt1 : Point, pt2 : Point) => Shape;

class CreateMode implements Mode {
    drawing : Drawing;
    ctx : CanvasRenderingContext2D;
    func : CreateFunction;
    
    constructor(drawing : Drawing, ctx : CanvasRenderingContext2D, cfunc : CreateFunction) {
        this.drawing = drawing;
        this.ctx = ctx;
        this.func = cfunc;
    }
    
    current : Point | undefined;
    mouseDown(p : Point) : void {
        this.current = p;
    }
    
    mouseDrag(pt2 : Point) : void {
        const r = this.func(this.current as Point, pt2);
        this.ctx.strokeStyle = 'blue';
        r.draw(this.ctx);
        
    }
    
    mouseUp(pt2 : Point) : void {
        const pt1 = this.current as Point;
        const r = this.func(pt1, pt2);
        this.drawing.add(r);
    }
}

class SelectMode implements Mode {
    private drawing : Drawing;
    private ctx : CanvasRenderingContext2D;
    private selection : Shape | undefined;
    
    constructor(drawing : Drawing, ctx : CanvasRenderingContext2D) {
        this.drawing = drawing;
        this.ctx = ctx;
    }
    
    private current : Point | undefined;
    
    mouseDown(p: Point): void {
        let hit : Shape | undefined;
        for (const sh of this.drawing) {
            if (sh.isOn(p)) {
                hit = sh;
            }
        }
        if (hit !== undefined) {
            this.ctx.strokeStyle = 'magenta';
            hit.draw(this.ctx);
            this.current = p;
        }
        this.selection = hit;
    }
    mouseDrag(p: Point): void {
        if (this.selection && this.current) {
            const v = EuclideanVector2D.fromPoints(this.current,p);
            console.log('moved:',v);
            this.selection.move(v);
            this.current = p;
            this.selection.draw(this.ctx);
        }
    }
    mouseUp(p: Point): void {
        this.drawing.notifyObservers();
    }
}

function offsetPt(e : MouseEvent) : Point {
    return {x: e.offsetX, y:e.offsetY};
}

const circleCreate = (pt1: Point, pt2: Point) => {
    const radius = EuclideanVector2D.fromPoints(pt1, pt2).magnitude;
    return new Circle(pt1, radius);
};


class Draw {
    
    
    constructor(canvas : HTMLCanvasElement, modeSelect : HTMLSelectElement) {
        const drawing = makeDrawing();
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        
        const selectMode = new SelectMode(drawing, ctx);
        const rectangleMode = new CreateMode(drawing, ctx, (p1,p2) => new Rectangle(p1,p2));
        const circleMode = new CreateMode(drawing, ctx, circleCreate);
        
        let mode : Mode = selectMode;
        function setMode(newMode: Mode) {
            mode = newMode;
        }
        
        const mouseDown = (e : MouseEvent) : void => {
            console.log('mouse down', e);
            mode.mouseDown(offsetPt(e));
        }
        const mouseUp = (e : MouseEvent) : void => {
            mode.mouseUp(offsetPt(e));
        }
        
        const mouseMove = (e : MouseEvent) : void => {
            if (e.buttons === 1) {
                // drag!
                mode.mouseDrag(offsetPt(e));
            }
        }
        const repaint = () => {
            ctx.strokeStyle = 'black';
            ctx.clearRect(0,0,canvas.width,canvas.height);
            for (const s of drawing) {
                s.draw(ctx);
            }
        };
        this.repaint = repaint;
        
        console.log('adding listeners');
        
        drawing.addObserver(() => { this.repaint(); });
        canvas.addEventListener('mousedown', (e) => mouseDown(e));
        canvas.addEventListener('mouseup', (e) => mouseUp(e));
        canvas.addEventListener('mousemove', (e) => mouseMove(e));
        const modeChangefunction = () => {
            // the modeis changed
            console.log('mode changed');
            
            switch (modeSelect.value) {
                case "Rectangle":
                setMode(rectangleMode);
                break;
                case "Circle":
                setMode(circleMode);
                break;
                case "Select":
                setMode(selectMode);
                break;
            }
            
        };
        modeSelect.addEventListener('change', modeChangefunction);
        
    }
    
    
    public readonly repaint : () => void; 
    
}


console.log('loaded');

export default function Page() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const modeSelectRef = useRef<HTMLSelectElement>(null);
    const fiRef = useRef<HTMLInputElement>(null);
    
    const [drawing,_] = useState(makeDrawing());
    
    const [canvas, setCanvas] = useState<HTMLCanvasElement|null>(null);
    useEffect(() => {
        setCanvas(canvasRef.current);
    }, [canvasRef]);
    
    const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D;
    
    const selectMode = useMemo(() => new SelectMode(drawing, ctx), [drawing, ctx]); // XX should have drawing
    const rectangleMode = useMemo(() => new CreateMode(drawing, ctx, (p1,p2) => new Rectangle(p1,p2)), [drawing, ctx]);
    const circleMode = useMemo(() => new CreateMode(drawing, ctx, circleCreate), [drawing, ctx]);
    
    const [mode, setMode] = useState<Mode>(selectMode);
    
    
    useEffect(() => {
        if (canvas === null) return;
        const mouseDown = (e : MouseEvent) : void => {
            console.log('mouse down', e, 'mode', mode);
            mode.mouseDown(offsetPt(e));
        }
        const mouseUp = (e : MouseEvent) : void => {
            mode.mouseUp(offsetPt(e));
        }
        
        const mouseMove = (e : MouseEvent) : void => {
            if (e.buttons === 1) {
                // drag!
                mode.mouseDrag(offsetPt(e));
            }
        }
        canvas.addEventListener('mousedown', mouseDown);
        canvas.addEventListener('mouseup', mouseUp);
        canvas.addEventListener('mousemove', mouseMove);
        return () => {
            canvas.removeEventListener('mousedown', mouseDown);
            canvas.removeEventListener('mouseup', mouseUp);
            canvas.removeEventListener('mousemove', mouseMove);
        };
    }, [canvas, mode])
    
    useEffect(() => {
        const repaint = () => {
            if (canvas === null) return;
            ctx.strokeStyle = 'black';
            ctx.clearRect(0,0,canvas.width,canvas.height);
            for (const s of drawing) {
                s.draw(ctx);
            }
        };
        
        repaint();
        drawing.addObserver(repaint);
        return () => {
            drawing.removeObserver(repaint);
        }
    }, [canvas, ctx, drawing]);
    
    useEffect(() => {
        const modeSelect = modeSelectRef.current;
        if (modeSelect === null) return;
        const modeChangeFunction = () => {
            // the modeis changed
            console.log('mode changed');
            
            switch (modeSelect.value) {
                case "Rectangle":
                setMode(rectangleMode);
                break;
                case "Circle":
                setMode(circleMode);
                break;
                case "Select":
                setMode(selectMode);
                break;
            }
            
        };
        modeSelect.addEventListener('change', modeChangeFunction);
        () => {
            modeSelect.removeEventListener('change', modeChangeFunction);
        }
    },[modeSelectRef, rectangleMode, selectMode, circleMode]);
    
    
    function doSave(): void {
        /*
        const d = draw as Draw;
        const filename = d.filenameInput.value;
        console.log('filename = ', filename);
        const json = JSON.stringify(d.drawing);
        console.log('json =', json);
        */
    }
    return (
        <div><h2>The Canvas</h2>
        <label htmlFor="selectmode">Choose a tool:</label>
        <select id="selectmode" ref={modeSelectRef}>
        <option value="Select">Select</option>
        <option value="Rectangle">Rectangle</option>
        <option value="Circle">Circle</option>
        </select><br/>
        <canvas ref={canvasRef} width="300" height ="200" style={{border:"2px solid black"}}>
        </canvas>
        <br/>
        <input ref={fiRef} type="text"></input>
        <button onClick={(_e) => doSave()}>Save</button></div>
    );
    
    
}
