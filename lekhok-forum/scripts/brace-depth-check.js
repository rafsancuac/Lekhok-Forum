const fs = require('fs');
const s = fs.readFileSync(process.argv[2], 'utf8');
let out = '', i = 0, inC = false, inStr = null;
while (i < s.length) {
  const ch = s[i], nx = s[i + 1];
  if (inC) { if (ch === '*' && nx === '/') { inC = false; i += 2; continue } i++; continue }
  if (inStr) { out += ch; if (ch === '\\') { out += s[i + 1]; i += 2; continue } if (ch === inStr) inStr = null; i++; continue }
  if (ch === '"' || ch === "'") { inStr = ch; out += ch; i++; continue }
  if (ch === '/' && nx === '*') { inC = true; i += 2; continue }
  out += ch; i++;
}
let d = 0; for (const c of out) { if (c === '{') d++; if (c === '}') d-- }
console.log('comment-stripped brace-depth:', d);
