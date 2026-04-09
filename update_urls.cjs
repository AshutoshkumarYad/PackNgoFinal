const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));
let replacedCount = 0;

for (const f of files) {
  const content = fs.readFileSync(f, 'utf-8');
  if (content.includes('http://localhost:5000')) {
    let replaced = content
      .replace(/http:\/\/localhost:5000\/api\//g, '/api/')
      .replace(/http:\/\/localhost:5000\/uploads\//g, '/uploads/')
      .replace(/http:\/\/localhost:5000/g, ''); // For base usages like `http://localhost:5000${avatar}`
      
    fs.writeFileSync(f, replaced, 'utf-8');
    replacedCount++;
  }
}

console.log(`Replaced hardcoded localhost URL in ${replacedCount} files.`);
