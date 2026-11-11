const fs = require('fs');
const lines = fs.readFileSync('src/layouts/Navbar.astro', 'utf8').split(/\r?\n/);
lines.forEach((l, i) => {
  if (l.includes('localizePath("/")') || l.includes('amsirar-wordmark') || l.includes('<svg')) {
    console.log(`${i+1}: ${l.trim().slice(0, 80)}`);
  }
});
