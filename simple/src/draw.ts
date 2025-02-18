import { Circle } from "./Circle";
import { Point } from "./Point";
import { Rectangle } from "./Rectangle";
import { Shape } from "./Shape";

//import { writeFile } from 'node:fs'; 

class Draw {
    private drawing : Array<Shape> = [];
    private canvas : HTMLCanvasElement;
    private modeSelect : HTMLSelectElement;
    private filenameInput : HTMLInputElement;
    private ctx : CanvasRenderingContext2D;

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
        const r = this.createRectangle(pt1, pt2);
        this.drawing.push(r);
        this.repaint();
    }

    private createRectangle(pt1: Point, pt2: Point) {
        return new Rectangle({ x: (pt1.x + pt2.x) / 2, y: (pt1.y + pt2.y) / 2 }, Math.abs(pt1.x - pt2.x), Math.abs(pt1.y - pt2.y));
    }

    private mouseMove(e : MouseEvent) : void {
        if (e.buttons === 1) {
            // drag!
            const pt2 = this.offsetPt(e);
            const r = this.createRectangle(this.current as Point, pt2);
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
            console.log(' drawing rectangle');
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
