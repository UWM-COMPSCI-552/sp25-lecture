import makePromise from './promiseMaker';

async function test(flag : boolean) {
    await makePromise(`test(${flag})`,flag,42);
}

const p1 = test(true);
const p2 = test(false);
p1.then((n) => console.log(`Got result ${n}`));
p2.catch((m) => console.log(`caught rejection ${m}`));