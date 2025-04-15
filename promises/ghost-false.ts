import myPromise from './promiseMaker'

async function ghost () {
    console.log("starting ghost()")
    const p1 = myPromise("p1",false,10)
    console.log('p1 = ', p1)
    console.log("calling await(p1)")
    await(p1)
    console.log('p1 = ', p1)
    p1.then(console.log)
    console.log("ending ghost()")
}

console.log("starting main")
ghost()
console.log("ending main")
