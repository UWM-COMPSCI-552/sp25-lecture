import myPromiseMaker from './promiseMaker'

let x = 10

let doubler = myPromiseMaker("doubler",true,10).then(n => {x = 2*x})
let adder   = myPromiseMaker("incrementer",true,10).then(n => {x = x+1})

Promise.all([adder,doubler]).then(values => console.log(x))

