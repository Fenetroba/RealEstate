import fs from 'fs';
import path from 'path';

const dir = 'app/dashboard';

function walk(d) {
  const files = [];
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) files.push(...walk(p));
    else if (e.name.endsWith('.tsx')) files.push(p);
  }
  return files;
}

const replacements = [
  [/bg-red-100/g, 'bg-destructive/10'],
  [/bg-red-50/g, 'bg-destructive/10'],
  [/text-red-900/g, 'text-destructive'],
  [/text-red-700/g, 'text-destructive'],
  [/text-red-600/g, 'text-destructive'],
  [/text-red-500/g, 'text-destructive'],
  [/border-red-200/g, 'border-destructive/20'],
  [/hover:bg-red-50/g, 'hover:bg-destructive/10'],
  [/hover:text-red-500/g, 'hover:text-destructive'],
  [/bg-green-50/g, 'bg-success/10'],
  [/bg-green-100/g, 'bg-success/10'],
  [/border-green-200/g, 'border-success/20'],
  [/text-green-900/g, 'text-success'],
  [/text-green-700/g, 'text-success'],
  [/bg-blue-50/g, 'bg-primary/10'],
  [/bg-blue-100/g, 'bg-primary/10'],
  [/border-blue-200/g, 'border-primary/20'],
  [/border-blue-100/g, 'border-primary/20'],
  [/text-blue-900/g, 'text-primary dark:text-foreground'],
  [/text-blue-700/g, 'text-primary dark:text-foreground'],
  [/text-blue-600/g, 'text-primary dark:text-foreground'],
  [/text-blue-500/g, 'text-primary dark:text-foreground'],
  [/bg-yellow-100/g, 'bg-warning/10'],
  [/text-yellow-600/g, 'text-warning'],
  [/text-yellow-700/g, 'text-warning'],
  [/bg-orange-100/g, 'bg-warning/10'],
  [/text-orange-700/g, 'text-warning'],
  [/text-orange-600/g, 'text-warning'],
  [/bg-red-500/g, 'bg-destructive'],
];

const files = walk(dir);
let total = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const orig = content;
  for (const [from, to] of replacements) {
    content = content.replace(from, to);
  }
  if (content !== orig) {
    fs.writeFileSync(file, content);
    total++;
    console.log('Updated:', file);
  }
}
console.log('Done. Files updated:', total);
