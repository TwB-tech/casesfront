import fs from 'fs';
import path from 'path';

const filePath = path.resolve(process.cwd(), 'scripts', 'setup-appwrite.js');
let content = fs.readFileSync(filePath, 'utf-8');

// Replace the old permissions object format with new permissions array format

// Pattern for public read / users write
const oldPublic = /permissions:\s*\{\s*read:\s*\[\s*'any'\s*\],\s*write:\s*\[\s*'users'\s*]\s*},/g;
const newPublic = `permissions: ['read("any")', 'create("users")', 'update("users")', 'delete("users")'],`;

content = content.replace(oldPublic, newPublic);

// Pattern for users-only read/write
const oldUsers = /permissions:\s*\{\s*read:\s*\[\s*'role:users'\s*\],\s*write:\s*\[\s*'role:users'\s*]\s*},/g;
const newUsers = `permissions: ['read("users")', 'create("users")', 'update("users")', 'delete("users")'],`;

content = content.replace(oldUsers, newUsers);

// Write back
fs.writeFileSync(filePath, content, 'utf-8');
console.log('✅ Updated permissions format in setup-appwrite.js');
