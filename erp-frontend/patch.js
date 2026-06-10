import fs from 'fs';
import path from 'path';

function walkSync(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.tsx')) {
        filelist.push(dirFile);
      }
    }
  }
  return filelist;
}

const files = walkSync('d:/ERP/erp-frontend/erp-frontend/src');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Add dark classes safely (only if not already there)
  content = content.replace(/bg-white(?! dark:bg-)/g, 'bg-white dark:bg-neutral-900');
  content = content.replace(/bg-gray-50(?! dark:bg-)/g, 'bg-gray-50 dark:bg-black');
  content = content.replace(/border-gray-200(?! dark:border-)/g, 'border-gray-200 dark:border-neutral-800');
  content = content.replace(/border-gray-100(?! dark:border-)/g, 'border-gray-100 dark:border-neutral-800');
  content = content.replace(/text-gray-900(?! dark:text-)/g, 'text-gray-900 dark:text-gray-100');
  content = content.replace(/text-gray-600(?! dark:text-)/g, 'text-gray-600 dark:text-gray-400');
  content = content.replace(/text-gray-500(?! dark:text-)/g, 'text-gray-500 dark:text-gray-400');
  content = content.replace(/bg-gray-100(?! dark:bg-)/g, 'bg-gray-100 dark:bg-neutral-800');
  
  // Replace the bluish grays with pure black for the requested full black theme
  content = content.replace(/dark:bg-gray-900/g, 'dark:bg-neutral-900');
  content = content.replace(/dark:bg-gray-950/g, 'dark:bg-black');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated:', file);
  }
}
