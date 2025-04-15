import makePromise from './promiseMaker';

async function test0(flag : boolean) {
    console.log(`test0(${flag}) is starting`)
    const delayed = makePromise(`test1(${flag})`,flag,42);
    console.log(await makePromise(`test2(${flag})`,true,100));
    const value = await delayed;
    console.log(`test0(${flag}) returning with ${value}`)
    return value
    // return (await delayed)
}

const p1 = test0(true);
const p2 = test0(false);
p1.then((n) => console.log(`.then is running got result ${n}`));
p2.catch((m) => console.log(`.catch is running, caught rejection ${m}`));