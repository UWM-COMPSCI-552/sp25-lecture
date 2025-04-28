'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { Circle } from "@/src/Circle";
import { EuclideanVector2D } from "@/src/EuclideanVector";
import { Point } from "@/src/Point";
import { Rectangle } from "@/src/Rectangle";
import { Shape } from "@/src/Shape";
import { Drawing, makeDrawing } from "@/src/Drawing";
import { Button, Select, createListCollection } from '@chakra-ui/react';

//import { writeFile } from 'node:fs'; 

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
        const pt1 = this.current as Point;
        if (pt1.x !== pt2.x || pt1.y !== pt2.y) {
            const r = this.func(pt1, pt2);
            this.ctx.strokeStyle = 'magenta'; // has no effect
            r.draw(this.ctx);
        }
    }
    
    mouseUp(pt2 : Point) : void {
        const pt1 = this.current as Point;
        if (pt1.x !== pt2.x || pt1.y !== pt2.y) {
            console.log('pt1',pt1,'pt2', pt2);
            const r = this.func(pt1, pt2);
            this.drawing.add(r);
        } else {
            this.drawing.notifyObservers();
        }
    }
}

type SelectionObserver = (s:Selection) => void;

class Selection {
    private contents : Shape[] = [];
    private observers : SelectionObserver[] = [];

    public setSelection(newContents : Shape[]) : void {
        this.contents = [...newContents];
        this.notifyObservers();
    }

    public isSelected(sh : Shape) : boolean {
        return this.contents.includes(sh);
    }

    public addSelection(sh : Shape) : void {
        if (!this.isSelected(sh)) {
            this.contents.push(sh);
            this.notifyObservers();
        }
    }

    public toggleSelection(sh : Shape) : void {
        if (this.isSelected(sh)) {
            this.contents.splice(this.contents.indexOf(sh), 1);
        } else {
            this.contents.push(sh);
        }
        this.notifyObservers();
    }

    public addObserver(obs : SelectionObserver) {
        this.observers.push(obs);
    }
    
    public removeObserver(obs : SelectionObserver) {
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

class SelectMode implements Mode {
    private drawing : Drawing;
    private ctx : CanvasRenderingContext2D;
    private selection : Selection;
    
    constructor(drawing : Drawing, ctx : CanvasRenderingContext2D, selection : Selection) {
        this.drawing = drawing;
        this.ctx = ctx;
        this.selection = selection;
    }
    
    private current : Point | undefined;
    
    mouseDown(p: Point): void {
        let hit : Shape | undefined;
        for (const sh of this.drawing) {
            if (sh.isOn(p)) {
                hit = sh;
            }
        }
        const newSelection = [];
        if (hit !== undefined) {
            this.ctx.strokeStyle = 'magenta';
            hit.draw(this.ctx);
            this.current = p;
            newSelection.push(hit);
        }
        this.selection.setSelection(newSelection);
    }
    mouseDrag(p: Point): void {
        if (this.selection && this.current) {
            const v = EuclideanVector2D.fromPoints(this.current,p);
            console.log('moved:',v);
            this.current = p;
            for (const sh of this.selection) {
                sh.move(v);
                sh.draw(this.ctx);
            }
        }
    }
    mouseUp(_: Point): void {
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



const modeSelectComponents = createListCollection({
    items: [
    { value: 'Select', label: "Select"},
    { value: "Rectangle", label: "Rectangle"},
    { value: "Circle", label: 'Circle'},
    ],
});

const INITIAL_CANVAS_WIDTH = 500;
const INITIAL_CANVAS_HEIGHT = 300;

function computeDrawCanvasWidth(iw : number) {
    return iw - 10;
}
const VERTICAL_CANVAS_PADDING = 350; // space for all the tools
function computeDrawCanvasHeight(ih : number) {
    return ih - VERTICAL_CANVAS_PADDING;
}

export default function Page() {
    const [canvasWidth, setCanvasWidth] = useState(INITIAL_CANVAS_WIDTH);
    const [canvasHeight, setCanvasHeight] = useState(INITIAL_CANVAS_HEIGHT);

    useLayoutEffect(() => {
        function resizeCanvas() {
            // console.log('window change', window.innerWidth, window.innerHeight);
            setCanvasWidth(computeDrawCanvasWidth(window.innerWidth));
            setCanvasHeight(computeDrawCanvasHeight(window.innerHeight));
        }
        // console.log('adding window listeners', window.innerWidth, window.innerHeight);
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        return () => {
            // console.log('removing window listeners');
            window.removeEventListener('resize', resizeCanvas);
        }
    },[]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const modeSelectRef = useRef<HTMLSelectElement>(null);
    const fiRef = useRef<HTMLInputElement>(null);
    
    const [drawing] = useState(makeDrawing());
    
    const [canvas, setCanvas] = useState<HTMLCanvasElement|null>(null);
    useEffect(() => {
        setCanvas(canvasRef.current);
    }, [canvasRef]);
    
    const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D;
    
    const selectMode = useMemo(() => new SelectMode(drawing, ctx, new Selection()), [drawing, ctx]); // XX should have drawing
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
            ctx.clearRect(0,0,canvasWidth,canvasHeight);
            for (const s of drawing) {
                s.draw(ctx);
            }
        };
        
        repaint();
        drawing.addObserver(repaint);
        return () => {
            drawing.removeObserver(repaint);
        }
    }, [drawing, canvas, ctx, canvasWidth, canvasHeight]);
    
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
        return () => {
            modeSelect.removeEventListener('change', modeChangeFunction);
        }
    },[modeSelectRef, rectangleMode, selectMode, circleMode]);
    
    
    const doSave = useCallback(() => {
        const json = JSON.stringify(drawing);
        console.log('not saving ', json);
        /*
        const d = draw as Draw;
        const filename = d.filenameInput.value;
        console.log('filename = ', filename);
        const json = JSON.stringify(d.drawing);
        console.log('json =', json);
        */
    },[drawing]);
    
    return (
        <div><h2>The Canvas</h2>
        <Select.Root collection={modeSelectComponents}>
            <Select.HiddenSelect ref={modeSelectRef}/>
            <Select.Label>
            Choose a tool:
            </Select.Label>
            <Select.Control>
                <Select.Trigger>
                    <Select.ValueText placeholder="Select Tool" />
                </Select.Trigger>
            </Select.Control>
            <Select.Positioner>
                <Select.Content>
                {modeSelectComponents.items.map((mode) => (
                    <Select.Item item={mode} key={mode.value}>
                        {mode.label}
                        <Select.ItemIndicator />
                    </Select.Item>
                ))}
                </Select.Content>
            </Select.Positioner>
        </Select.Root>
        <br/>
        <canvas ref={canvasRef} width={canvasWidth} height ={canvasHeight} style={{border:"2px solid black"}}>
        </canvas>
        <br/>
        <input ref={fiRef} type="text"></input>
        <Button variant="outline" onClick={doSave}>Save</Button></div>
    );
    
    
}
