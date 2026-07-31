import { cp, mkdir } from 'node:fs/promises';

await mkdir('dist/JoyfulExoticCakeNCream', { recursive: true });
await cp('dist/assets', 'dist/JoyfulExoticCakeNCream/assets', { recursive: true });