let freeKassa = require('./app/FreeKassa');

async function checkOrder(id) {
    let result = await freeKassa.checkOrder(id);
    console.log(result);
}

checkOrder(692);