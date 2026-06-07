import fs from 'fs';
import path from 'path';

const dir = 'app/dashboard';

function walk(d) {
  const files = [];
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) files.push(...walk(p));
    else if (e.name.endsWith('.tsx') || e.name.endsWith('.ts')) files.push(p);
  }
  return files;
}

const replacements = [
  [/text-\[#0E2347\]/g, 'text-foreground'],
  [/bg-\[#0E2347\](?!\/)/g, 'bg-primary'],
  [/bg-\[#0E2347\]\/10/g, 'bg-primary/10'],
  [/text-\[#D4A64A\]/g, 'text-accent'],
  [/bg-\[#D4A64A\](?!\/)/g, 'bg-accent'],
  [/bg-\[#D4A64A\]\/10/g, 'bg-accent/10'],
  [/bg-\[#D4A64A\]\/20/g, 'bg-accent/20'],
  [/border-l-\[#D4A64A\]/g, 'border-l-accent'],
  [/from-\[#D4A64A\]\/10/g, 'from-accent/10'],
  [/focus:border-\[#D4A64A\]/g, 'focus:border-accent'],
  [/focus:ring-\[#D4A64A\]\/20/g, 'focus:ring-accent/20'],
  [/text-\[#D4A64A\] focus:ring-\[#D4A64A\]/g, 'text-accent focus:ring-accent'],
  [/bg-\[#F2F2F2\]/g, 'bg-surface'],
  [/text-gray-600/g, 'text-muted'],
  [/text-gray-500/g, 'text-muted'],
  [/text-gray-700/g, 'text-foreground'],
  [/text-gray-400/g, 'text-muted'],
  [/text-gray-300/g, 'text-muted/40'],
  [/bg-gray-100/g, 'bg-surface'],
  [/bg-gray-50/g, 'bg-surface'],
  [/hover:bg-gray-100/g, 'hover:bg-surface'],
  [/hover:bg-gray-200/g, 'hover:bg-surface'],
  [/border-gray-200/g, 'border-border'],
  [/border-gray-300/g, 'border-border'],
  [/bg-\[#D4A64A\]\/5/g, 'bg-accent/5'],
  [/border-\[#D4A64A\]\/20/g, 'border-accent/20'],
  [/hover:border-\[#D4A64A\]/g, 'hover:border-accent'],
  [/border-\[#D4A64A\]/g, 'border-accent'],
  [/focus:ring-\[#D4A64A\]/g, 'focus:ring-accent'],
  [/bg-gray-200/g, 'bg-border'],
  [/text-gray-200/g, 'text-muted/30'],
  [/\? 'bg-\[#0E2347\] text-white'/g, "? 'bg-primary text-white'"],
  [/\? 'bg-\[#D4A64A\] text-white'/g, "? 'bg-accent text-primary'"],
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
