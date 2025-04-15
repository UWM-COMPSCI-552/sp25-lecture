import myPromise from './promiseMaker'
console.log("starting main")
async function ghost() {
    console.log("starting ghost()")
    const p1 = myPromise("p1", false, 10)
    console.log('A p1 = ', p1)
    console.log("calling await(p1)")
    try {
        await (p1)
    } catch (e) { 
        console.log("C catch executed"); 
        // return 4  // exits from ghost
    }
    console.log('D p1 = ', p1)
    p1.then(console.log).catch(e => console.log("E"))
    console.log("ending ghost()")
}

ghost()
console.log("ending main")
