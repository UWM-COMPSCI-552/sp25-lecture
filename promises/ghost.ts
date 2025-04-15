import myPromise from './promiseMaker'
console.log("starting main")
async function ghost () {
    console.log("starting ghost()")
    const p1 = myPromise("p1",true,10)
    console.log('p1 = ', p1)
    p1.then(n => console.log(`p1 ended with ${n}`))
    console.log("calling await(p1)")
    await(p1)
    console.log('p1 = ', p1)
    // p1.then(n => console.log(`p1 ended with ${n}`))
    console.log("ending ghost()")
}

ghost()
console.log("ending main")
