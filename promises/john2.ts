import makePromise from './promiseMaker';

const p1 = makePromise('#1',false);

setTimeout(() => {
    console.log('starting new handler')
    console.log('adding a catch now');
    const p3 = p1.catch((m) => console.log(`p3 running now, message was "${m}"`));
  }, 0);

  console.log("main now finishing")


