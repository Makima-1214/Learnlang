async function main() {
  const res = await fetch('http://localhost:3000/api/learn/session/cmpgupn4o000rw7584g62eomc');
  const data = await res.json();
  console.dir(data.data.questions[0], { depth: null });
}
main();
