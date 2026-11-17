import fs from 'fs';
import path from 'path';

// Fix for Windows Application Control blocking native .node C++ DLLs
const src = path.resolve('node_modules/@rollup/wasm-node');
const dest = path.resolve('node_modules/rollup');

if (fs.existsSync(src) && fs.existsSync(dest)) {
  try {
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log('[Selloi] Applied @rollup/wasm-node fallback for Windows compatibility.');
  } catch (err) {
    // Non-fatal if already patched
  }
}
