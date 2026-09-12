const { Client } = require('pg');
const client = new Client('postgresql://myuser:mypassword@localhost:5432/mydb');
client.connect().then(() => client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'Dish'"))
  .then(res => console.log(res.rows.map(r => r.column_name)))
  .catch(err => console.error(err))
  .finally(() => client.end());

