'use client';

import { Draw } from '@/src/draw'
import { useEffect, useState } from 'react';


export default function Page() {
  const [draw, setDraw] = useState<Draw|null>(null);
  useEffect(() => {
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
            setDraw(new Draw(canvas,modeselect as HTMLSelectElement, fi as HTMLInputElement));
        }
    }

  },[]);
  return (
    <div><h2>The Canvas</h2>
    <label htmlFor="selectmode">Choose a tool:</label>
    <select id="selectmode">
    <option value="Select">Select</option>
    <option value="Rectangle">Rectangle</option>
    <option value="Circle">Circle</option>
    </select><br/>
    <canvas id='drawcanvas' width="300" height ="200">
    </canvas>
    <br/>
    <input id="drawfilename" type="text"></input>
    <button onClick={(e) => (draw as Draw).save()}>Save</button></div>
  );
}
