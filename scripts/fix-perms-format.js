import fs from 'fs';
import path from 'path';

const filePath = path.resolve(process.cwd(), 'scripts', 'setup-appwrite.js');
let content = fs.readFileSync(filePath, 'utf-8');

// Simple string replacements
const replacements = [
  // public read, users write
  {
    old: "{ read: ['any'], write: ['users'] }",
    new: "['read(\"any\")', 'create(\"users\")', 'update(\"users\")', 'delete(\"users\")']"
  },
  // users read/write
  {
    old: "{ read: ['role:users'], write: ['role:users'] }",
    new: "['read(\"users\")', 'create(\"users\")', 'update(\"users\")', 'delete(\"users\")']"
  },
];

let changed = false;
for (const { old, new: repl } of replacements) {
  if (content.includes(old)) {
    content = content.split(old).join(repl);
    console.log(`Replaced ${old.length} chars occurrence(s)`);
    changed = true;
  } else {
    console.log(`Pattern not found: ${old.substring(0,30)}...`);
  }
}

if (changed) {
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('✅ File updated');
} else {
  console.log('⚠️ No changes made');
}
