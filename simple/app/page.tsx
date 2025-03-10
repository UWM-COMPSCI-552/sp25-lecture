'use client';

import { Draw, draw } from '@/src/draw'
import { useEffect } from 'react';


export default function Page() {
  let draw552 : Draw = draw() as Draw
  useEffect(() => {
    draw552 = draw() as Draw;
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
    <button onClick={(e) => draw552.save()}>Save</button></div>
  );
}
