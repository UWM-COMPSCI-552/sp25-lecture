'use client';

import { useEffect, useRef, useState } from 'react';

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

class Draw {
    drawing : Drawing;
    private canvas : HTMLCanvasElement;
    private modeSelect : HTMLSelectElement;
    filenameInput : HTMLInputElement;
    private ctx : CanvasRenderingContext2D;

    private readonly selectMode : SelectMode;
    private readonly rectangleMode : CreateMode;
    private readonly circleMode : CreateMode; 
    
    private mode : Mode;

    private readonly circleCreate = (pt1: Point, pt2: Point) => {
        const radius = EuclideanVector2D.fromPoints(pt1, pt2).magnitude;
        return new Circle(pt1, radius);
    };

     constructor(canvas : HTMLCanvasElement, modeSelect : HTMLSelectElement, filenameInput : HTMLInputElement) {
        this.drawing = makeDrawing();
        this.canvas = canvas;
        this.modeSelect = modeSelect;
        this.filenameInput = filenameInput;
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        this.selectMode = new SelectMode(this.drawing, this.ctx);
        this.rectangleMode = new CreateMode(this.drawing, this.ctx, (p1,p2) => new Rectangle(p1,p2));
        this.circleMode = new CreateMode(this.drawing, this.ctx, this.circleCreate);
        this.mode = this.selectMode;
        
        console.log('adding listeners');

        this.drawing.addObserver(() => { this.repaint(); });
        canvas.addEventListener('mousedown', (e) => this.mouseDown(e));
        canvas.addEventListener('mouseup', (e) => this.mouseUp(e));
        canvas.addEventListener('mousemove', (e) => this.mouseMove(e));
        const modeChangefunction = () => {
          // the modeis changed
          console.log('mode changed');
          
          switch (this.modeSelect.value) {
              case "Rectangle":
                  this.mode = this.rectangleMode;
                  break;
              case "Circle":
                  this.mode = this.circleMode;
                  break;
              case "Select":
                  this.mode = this.selectMode;
                  break;
          }
          
      };
        modeSelect.addEventListener('change', modeChangefunction);
    }

    offsetPt(e : MouseEvent) : Point {
        return {x: e.offsetX, y:e.offsetY};
    }


    private mouseDown(e : MouseEvent) : void {
        console.log('mouse down', e);
        this.mode.mouseDown(this.offsetPt(e));
    }

    private mouseUp(e : MouseEvent) : void {
        this.mode.mouseUp(this.offsetPt(e));
    }


    private mouseMove(e : MouseEvent) : void {
        if (e.buttons === 1) {
            // drag!
            this.mode.mouseDrag(this.offsetPt(e));
        }
    }

    public repaint() {
        this.ctx.strokeStyle = 'black';
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        for (const s of this.drawing) {
            s.draw(this.ctx);
        }
    }

    public load() {

    }
}


console.log('loaded');

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const modeSelectRef = useRef<HTMLSelectElement>(null);
  const fiRef = useRef<HTMLInputElement>(null);
  const [draw, setDraw] = useState<Draw|null>(null);
  useEffect(() => {
    console.log('draw is running!');
    const canvas = canvasRef.current;
    const modeselect = modeSelectRef.current;
    const fi = fiRef.current;
    if (canvas instanceof HTMLCanvasElement) {
        console.log('Found a canvas');
        const ctx = canvas.getContext('2d');
        console.log('cts =',ctx);
        console.log('fi =', fi);
        if (ctx != null) {
            setDraw(new Draw(canvas,modeselect as HTMLSelectElement, fi as HTMLInputElement));
        }
    }

  },[]);
  function doSave(): void {
    const d = draw as Draw;
    const filename = d.filenameInput.value;
    console.log('filename = ', filename);
    const json = JSON.stringify(d.drawing);
    console.log('json =', json);
  }
  return (
    <div><h2>The Canvas</h2>
    <label htmlFor="selectmode">Choose a tool:</label>
    <select id="selectmode" ref={modeSelectRef}>
    <option value="Select">Select</option>
    <option value="Rectangle">Rectangle</option>
    <option value="Circle">Circle</option>
    </select><br/>
    <canvas ref={canvasRef} width="300" height ="200">
    </canvas>
    <br/>
    <input ref={fiRef} type="text"></input>
    <button onClick={(_e) => doSave()}>Save</button></div>
  );

  
}
