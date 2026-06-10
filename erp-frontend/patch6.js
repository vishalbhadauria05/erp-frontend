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

const files = walkSync('d:/ERP/erp-frontend/erp-frontend/src/features');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // 1. Convert all Cards to bluish grey
  // Exclude specific inputs in LoginPage/CustomersPage that might have matched
  content = content.replace(/className="w-full rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-black/g, 'className="w-full rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-black'); // no-op for now, inputs should be black

  content = content.replace(/bg-white dark:bg-black py-2 pl-9 pr-3/g, 'bg-white dark:bg-black py-2 pl-9 pr-3'); // no-op

  // Now replace remaining cards
  content = content.replace(/bg-white dark:bg-black/g, 'bg-white dark:bg-gray-800/50');

  // 2. Fix the inputs back to pitch black so they look recessed inside the new bluish-grey cards!
  // The current inputClass has dark:bg-slate-800/40
  content = content.replace(
    /const inputClass = 'w-full rounded-lg border border-gray-300 dark:border-slate-700\/50 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-800\/40 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors';/g,
    "const inputClass = 'w-full rounded-lg border border-gray-300 dark:border-neutral-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-black placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner';"
  );

  // 3. Fix the smaller info boxes in OrderForm to be pitch black so they contrast with the bluish-grey card
  if (file.endsWith('OrderForm.tsx')) {
    content = content.replace(
      /<div className="bg-blue-50 dark:bg-gray-800\/50 text-blue-800 dark:text-gray-200 p-3 rounded-lg text-xs flex justify-between items-center border border-transparent dark:border-neutral-800">/g,
      '<div className="bg-blue-50 dark:bg-black text-blue-800 dark:text-gray-200 p-3 rounded-lg text-xs flex justify-between items-center border border-transparent dark:border-neutral-800">'
    );
    content = content.replace(
      /<div className="bg-blue-50 dark:bg-gray-800\/50 text-blue-800 dark:text-gray-200 border border-transparent dark:border-neutral-800 p-3 rounded-lg text-xs text-right">/g,
      '<div className="bg-blue-50 dark:bg-black text-blue-800 dark:text-gray-200 border border-transparent dark:border-neutral-800 p-3 rounded-lg text-xs text-right">'
    );
  }

  // Also make sure LoginPage inputs are black if they were changed
  if (file.endsWith('LoginPage.tsx')) {
    content = content.replace(/bg-white dark:bg-gray-800\/50 py-2.5 pl-9 pr-3/g, 'bg-white dark:bg-black py-2.5 pl-9 pr-3');
  }
  
  if (file.endsWith('CustomersPage.tsx')) {
    content = content.replace(/bg-white dark:bg-gray-800\/50 py-2 pl-9 pr-3/g, 'bg-white dark:bg-black py-2 pl-9 pr-3');
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated:', file);
  }
}
