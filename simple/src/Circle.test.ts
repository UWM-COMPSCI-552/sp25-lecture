import { Circle } from './Circle';

describe('circle json test', () => {
    test('simple', () => {
        const c = new Circle({y:100, x:150}, 25);
        expect(c.toJSON()).toStrictEqual({center : {x:150, y:100}, radius: 25});
    });
});