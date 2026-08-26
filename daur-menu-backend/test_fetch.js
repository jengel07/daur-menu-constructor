import fetch from 'node-fetch'; // wait, node 24 has native fetch
async function run() {
  const res = await fetch('http://127.0.0.1:3000/api/menu');
  const data = await res.json();
  console.log("Without ID:", JSON.stringify(data).substring(0, 200));

  // Let's get a random restaurant ID if possible, but we don't know it.
  // We can just dump what we have.
}
run();

