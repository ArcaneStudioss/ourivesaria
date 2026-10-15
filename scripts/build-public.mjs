import { cp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'dist');
const destination = join(root, 'public');
const config = JSON.parse(await readFile(join(source, 'config.json'), 'utf8'));
const origin = new URL(process.env.SITE_URL || 'https://ourivesaria.arcanestudios.io').origin;
if (!/^https?:\/\//.test(origin)) throw new Error('SITE_URL precisa ser um endereço HTTP ou HTTPS.');
await readFile(join(source, 'index.html'));
await rm(destination, { recursive: true, force: true });
await cp(source, destination, { recursive: true });
async function update(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await update(path);
    else if (/\.(html|json|xml|txt)$/.test(entry.name)) {
      const contents = await readFile(path, 'utf8');
      await writeFile(path, contents.replaceAll(config.origin, origin));
    }
  }
}
await update(destination);
console.log(`Site preparado em public/ para ${origin}`);
