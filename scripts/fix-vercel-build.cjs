const fs = require('fs');
const path = require('path');

const oldDir = path.join(process.cwd(), '.next');
const newDir = path.join(process.cwd(), 'next.js');

if (fs.existsSync(oldDir)) {
    if (fs.existsSync(newDir)) {
        console.log(`Removing existing ${newDir}...`);
        fs.rmSync(newDir, { recursive: true, force: true });
    }
    console.log(`Renaming ${oldDir} to ${newDir}...`);
    fs.renameSync(oldDir, newDir);
    console.log('Build directory successfully prepared for Vercel.');
} else {
    console.error('Error: .next directory not found. Build may have failed.');
    process.exit(1);
}
