import { cp, mkdir, rm } from 'node:fs/promises';

await rm('pages-dist', { recursive: true, force: true });
await cp('dist', 'pages-dist', { recursive: true });
await mkdir('pages-dist/JoyfulExoticCakeNCream', { recursive: true });
await cp('dist/assets', 'pages-dist/JoyfulExoticCakeNCream/assets', { recursive: true });