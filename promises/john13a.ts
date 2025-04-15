import makePromise from './promiseMaker';

async function test() {
    const d1 = makePromise('d1',false,42);
    // const d2 = makePromise('d2',true,100);
    return [13, await d1]; // don't do this
    // return Promise.all([d1]); // do this instead
}


test()
    .then((n) => console.log(`test() got result ${n}`))
    .catch((m) => console.log(`test() was rejected with message "${m}"`))