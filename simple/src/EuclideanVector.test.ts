import { EuclideanVector2D } from "./EuclideanVector";

describe('euclidean vector tests', () => {
    test('initialize dx,dy', () => {
        const v = new EuclideanVector2D(2,3);
        expect(v.dx).toBe(2);
        expect(v.dy).toBe(3);
    });
    test('magnitude', () => {
        let v = new EuclideanVector2D(3,4);
        expect(v.magnitude).toBe(5);
        v = new EuclideanVector2D(1,1);
        expect(v.magnitude).toBe(Math.SQRT2);
    })
    test('one argument constructor', () => {
        const v = new EuclideanVector2D(2);
        expect(v.dy).toBe(3);
    })
    test('zeros', () => {
        const v = new EuclideanVector2D(0);
        expect(v.dy).toBe(1);
    });
    test('zero #2', () => {
        const v = new EuclideanVector2D(1,0);
        expect(v.dx).toBe(1);
        expect(v.dy).toBe(0);
    });
    test('add', () => {
        const v = new EuclideanVector2D(1,1);
        const w = new EuclideanVector2D(2,3);
        const x = v.add(w);
        expect(x.dy).toBe(4);
    });
    test('scale simple', () => {
        const v = new EuclideanVector2D(3,4);
        const w = v.scale(2);
        expect(w.dx).toBe(6);
    })
});