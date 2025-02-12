import { Circle } from "./Circle";
import { Rectangle } from "./Rectangle";

export function draw() {
    console.log('draw is running!');
    const canvas = document.getElementById('drawcanvas');
    if (canvas instanceof HTMLCanvasElement) {
        console.log('Found a canvas');
        const ctx = canvas.getContext('2d');
        console.log('cts =',ctx);
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
        }
    }
}

console.log('loaded');
