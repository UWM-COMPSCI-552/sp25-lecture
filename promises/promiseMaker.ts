
// makes a new thread that runs after a random delay between 0 and 1000 msecs
function makeNewThread (callback: () => any) {
    const delay = Math.random() * 1000; 
    setTimeout(callback, delay)
}

// resolves or rejects depending on the value of the flag
export default function myPromiseMaker (name: string, flag: boolean, n?:number ) : Promise<number> {
    console.log(`creating new promise ${name}`)
    return new Promise <number> ((fulfill, reject) => {       
        makeNewThread(() => {
            console.log(`promise ${name} now running; flag = ${flag}`)
            if (flag) {
                console.log (`promise ${name} now fulfilling with ${n}`)           
                fulfill(n)
            } else {
                console.log (`promise ${name} now rejecting`) 
            reject (`promise ${name} was rejected`)
            }
        })
    })
}        
