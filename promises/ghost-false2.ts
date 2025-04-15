import myPromise from './promiseMaker'
console.log("starting main")
async function ghost() {
    console.log("starting ghost()")
    const p1 = myPromise("p1", false, 10)
    console.log('A p1 = ', p1)
    console.log("A calling await(p1)")
    try {
        await (p1)
        console.log('B p1 = ', p1)
        p1.then(console.log)
    } catch (e) {
        console.log("C p1 was rejected")
        console.log('C p1 = ', p1)
    }
    console.log("ending ghost()")
}

ghost()
console.log("ending main")
