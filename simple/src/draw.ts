import { Circle } from "./Circle";
import { EuclideanVector2D } from "./EuclideanVector";
import { Point } from "./Point";
import { Rectangle } from "./Rectangle";
import { Shape } from "./Shape";

//import { writeFile } from 'node:fs'; 

type Drawing = Array<Shape>;

interface Mode {
    mouseDown(p : Point) :  void;
    mouseDrag(p : Point) : void;
    mouseUp(p : Point) : void;
}

abstract class CreateMode implements Mode {
    drawing : Drawing;
    ctx : CanvasRenderingContext2D;

    constructor(drawing : Drawing, ctx : CanvasRenderingContext2D) {
        this.drawing = drawing;
        this.ctx = ctx;
    }

    current : Point | undefined;
    mouseDown(p : Point) : void {
        this.current = p;
    }

    mouseDrag(pt2 : Point) : void {
        const r = this.createShape(this.current as Point, pt2);
        r.draw(this.ctx);

    }

    mouseUp(pt2 : Point) : void {
        const pt1 = this.current as Point;
        const r = this.createShape(pt1, pt2);
        this.drawing.push(r);
        // this.repaint(); // let Draw find out by "Observing" the drawing
    }
    abstract createShape(pt1 : Point, pt2 : Point) : Shape;
}

class Draw {
    private drawing : Array<Shape> = [];
    private canvas : HTMLCanvasElement;
    private modeSelect : HTMLSelectElement;
    private filenameInput : HTMLInputElement;
    private ctx : CanvasRenderingContext2D;

    private readonly rectangleCreate = (pt1: Point, pt2: Point) => new Rectangle({ x: (pt1.x + pt2.x) / 2, y: (pt1.y + pt2.y) / 2 }, Math.abs(pt1.x - pt2.x), Math.abs(pt1.y - pt2.y));

    private readonly circleCreate = (pt1: Point, pt2: Point) => {
        const radius = EuclideanVector2D.fromPoints(pt1, pt2).magnitude;
        return new Circle(pt1, radius);
    };

    private create : (pt1:Point,pt2:Point) => Shape = (p1,p2) => { throw Error() };

    constructor(canvas : HTMLCanvasElement, modeSelect : HTMLSelectElement, filenameInput : HTMLInputElement) {
        this.canvas = canvas;
        this.modeSelect = modeSelect;
        this.filenameInput = filenameInput;
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        canvas.addEventListener('mousedown', (e) => this.mouseDown(e));
        canvas.addEventListener('mouseup', (e) => this.mouseUp(e));
        canvas.addEventListener('mousemove', (e) => this.mouseMove(e));
        modeSelect.addEventListener('change', () => {
            // the modeis changed
            console.log('mode changed');
            
            switch (this.modeSelect.value) {
                case "Rectangle":
                this.create = this.rectangleCreate;
                break;
                case "Circle":
                this.create = this.circleCreate;
                break;
                case "Select":
                break;
            }
            
        });
    }

    offsetPt(e : MouseEvent) : Point {
        return {x: e.offsetX, y:e.offsetY};
    }

    private current : Point | undefined;

    private mouseDown(e : MouseEvent) : void {
        this.current = this.offsetPt(e);
    }

    private mouseUp(e : MouseEvent) : void {
        const pt1 = this.current as Point;
        const pt2 = this.offsetPt(e);
        const r = this.createShape(pt1, pt2);
        this.drawing.push(r);
        this.repaint();
    }

    private createShape(pt1: Point, pt2: Point) : Shape {
        return this.create(pt1,pt2);
    }

    private mouseMove(e : MouseEvent) : void {
        if (e.buttons === 1) {
            // drag!
            const pt2 = this.offsetPt(e);
            const r = this.createShape(this.current as Point, pt2);
            r.draw(this.ctx);
        }
    }

    public repaint() {
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
