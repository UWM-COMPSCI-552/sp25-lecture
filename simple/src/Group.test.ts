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
})