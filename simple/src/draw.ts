import { Circle } from "./Circle";
import { EuclideanVector2D } from "./EuclideanVector";
import { Point } from "./Point";
import { Rectangle } from "./Rectangle";
import { Shape } from "./Shape";

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
    private drawing : Drawing;
    private canvas : HTMLCanvasElement;
    private modeSelect : HTMLSelectElement;
    private filenameInput : HTMLInputElement;
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
        
        this.drawing.addObserver(() => { this.repaint(); });
        canvas.addEventListener('mousedown', (e) => this.mouseDown(e));
        canvas.addEventListener('mouseup', (e) => this.mouseUp(e));
        canvas.addEventListener('mousemove', (e) => this.mouseMove(e));
        modeSelect.addEventListener('change', () => {
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
            
        });
    }

    offsetPt(e : MouseEvent) : Point {
        return {x: e.offsetX, y:e.offsetY};
    }

    private current : Point | undefined;

    private mouseDown(e : MouseEvent) : void {
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
    public save() {
        const filename = this.filenameInput.value;
        console.log('filename = ', filename);
        const json = JSON.stringify(this.drawing);
        console.log('json =', json);
        /*writeFile(filename, json, () => {
            console.log('write happened');
        });*/
    }
}

export function draw() {
    console.log('draw is running!');
    const canvas = document.getElementById('drawcanvas');
    const modeselect = document.getElementById('selectmode');
    const fi = document.getElementById('drawfilename');
    if (canvas instanceof HTMLCanvasElement) {
        console.log('Found a canvas');
        const ctx = canvas.getContext('2d');
        console.log('cts =',ctx);
        console.log('fi =', fi);
        if (ctx != null) {
            /*ctx.strokeStyle = 'red';
            ctx.beginPath();
            ctx.rect(50,50,70,30);
            ctx.stroke();*/
            const sh = new Rectangle({x:4,y:44}, 44, 22);
            sh.draw(ctx);

            const sh2 = new Rectangle({x:100,y:100}, 50);   
            sh2.draw(ctx);
            
            const cs = new Circle({x:100,y:100}, 25);
            cs.draw(ctx);

            return new Draw(canvas,modeselect as HTMLSelectElement, fi as HTMLInputElement);
        }
    }
}

console.log('loaded');
