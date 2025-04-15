import makePromise from './promiseMaker';

async function test(flag : boolean) {
    const n1 = await makePromise(`promise1a(${flag})`,flag, 42);
    return await makePromise(`promise1b(${flag})`, true, n1*4);
}

const p1 = test(true);
const p2 = test(false);
p1.then((n) => console.log(`test(true) got result ${n}`));
p2.catch((m) => console.log(`test(false): catch is running, caught: ${m}`));