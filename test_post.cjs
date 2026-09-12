const axios = require('axios');
async function test() {
  const getRes = await axios.get('http://localhost:3000/api/menu');
  const data = getRes.data;
  const restId = data.restaurantInfo.id || 'test';
  
  const token = process.env.TOKEN; // wait, need token for POST!
  console.log("Restaurant ID:", restId);
}
test();

