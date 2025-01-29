import { PolarVector } from "./PolarVector";

describe('polar vector tests', () => {
    test('initialize r, zero', () => {
        const v = new PolarVector(2,0);
        expect(v.dx).toBe(2);
        expect(v.dy).toBe(0);
    });
    test('initialize r, pi/2', () => {
        const v = new PolarVector(2,Math.PI/2);
        expect(v.dx).toBeCloseTo(0);
        expect(v.dy).toBe(2);
    });
    test('magnitude', () => {
        let v = new PolarVector(3,4);
        expect(v.magnitude).toBe(3);
        v = new PolarVector(1,Math.PI/4);
        expect(v.magnitude).toBe(1);
    })
    test('add', () => {
        const v = new PolarVector(1,Math.PI/4);
        const w = new PolarVector(2,Math.PI/4);
        const x = v.add(w);
        expect(x.magnitude).toBe(3);
    });
    test('scale simple', () => {
        const v = new PolarVector(3,Math.PI/4);
        const w = v.scale(2);
        expect(w.magnitude).toBe(6);
        expect(w.angle).toBe(Math.PI/4);
    });
    test('move', () => {
        const v = new PolarVector(3, Math.PI);
        expect(v.move({x:1,y:2})).toBe({x:-2,y:2});
    })
});