import { nanoid } from 'nanoid';
import { Group } from './Group';
import { Rectangle } from './Rectangle';
import { Shape } from './Shape';

describe('Group tests', () => {
    test('remove from a group', () => {
        const sh = new Rectangle({x:100,y:100}, 40);
        const g = new Group([sh]);
        const iter = g[Symbol.iterator]();
        let res = iter.next(true); // "true" goes into bit bucket
        expect(res.done).toBe(false);
        expect(res.value).toBe(sh);
        res = iter.next(true); // should remove it!
        expect(res.done).toBe(true);
        expect(res.value).toBe(0);
        expect(g.size()).toBe(0);
    });

    test('code to see how JSON works on shapes', () => {
        const sh = new Rectangle({x:100,y:100}, 40);
        const g = new Group([sh]);
        const json = JSON.stringify(g);
        console.log(json);
        const g2 = Shape.fromJSON(JSON.parse(json));
        expect(g2).toBe(g);
    });
    
    test('code to see how JSON works for new shapes', () => {
        const sh = new Rectangle({x:100,y:100}, 40);
        const g = new Group([sh]);
        const jsonString = JSON.stringify(g);
        console.log(jsonString);
        const json = JSON.parse(jsonString);
        json.id = nanoid();
        const g2 = Shape.fromJSON(json);
        expect(g2).not.toBe(g);
        expect(g2).toBeInstanceOf(Group);
        const gg = g2 as Group;
        const iter = gg[Symbol.iterator]();
        let res = iter.next(true); // "true" goes into bit bucket
        expect(res.done).toBe(false);
        expect(res.value).toBe(sh);
        res = iter.next();
        expect(res.done).toBe(true);
    });

    test('round-tripping a new object', () => {
        const sh = new Rectangle({x:100,y:100}, 40);
        const g = new Group([sh]);
        const jsonString = JSON.stringify(g);
        console.log(jsonString);
        const json = JSON.parse(jsonString);
        json.id = nanoid();
        const g2 = Shape.fromJSON(json);
        const g3 = Shape.fromJSON(JSON.parse(JSON.stringify(g2)));
        expect(g3).toBe(g2);
    });

    test('idempotency of new object', () => {
        const sh = new Rectangle({x:100,y:100}, 40);
        const g = new Group([sh]);
        const jsonString = JSON.stringify(g);
        console.log(jsonString);
        const json = JSON.parse(jsonString);
        json.id = nanoid();
        const g2 = Shape.fromJSON(json);
        expect(g2).not.toBe(g);
        const g3 = Shape.fromJSON(json);
        console.log(json.id, g2.id, g3.id);
        expect(g3).toBe(g2);
    })
})