const fs = require('fs');
const file = './src/data/schools.json';
let data = JSON.parse(fs.readFileSync(file, 'utf8'));

const toRemove = [
  "Government Nutan Higher Secondary School",
  "Nalanda Academy",
  "Shree J K Public School",
  "Panchsheel Academy",
  "Alpha International School"
];

const filtered = data.filter(s => !toRemove.includes(s.name));

fs.writeFileSync(file, JSON.stringify(filtered, null, 2));
console.log(`Removed ${data.length - filtered.length} schools.`);
