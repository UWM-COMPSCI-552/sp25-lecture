import { Circle } from './Circle';
import { nanoid } from 'nanoid';
import { Shape } from './Shape';

describe('circle json test', () => {
    test('simple', () => {
        const c = new Circle({y:100, x:150}, 25);
        expect(c.toJSON()).toStrictEqual({center : {x:150, y:100}, radius: 25, type: "Circle", id:c.id});
    });

    test('json parsing', () => {
        const c = new Circle({y:100, x:150}, 25);
        const jo = c.toJSON();
        jo.id = nanoid();
        const c1 = Shape.fromJSON(jo);
        expect(c1).not.toBe(c);
        const c2 = Shape.fromJSON(jo);
        expect(c2).toBe(c1);
    })
});

