import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const src = path.resolve(process.argv[2] || '_source');
const dst = path.resolve(process.argv[3] || '.');
const oldUrl = 'https://raw.githubusercontent.com/lildanlid1/MorantxHub-Scripts/main/';
const newUrl = 'https://raw.githubusercontent.com/lildanlid1/MorantxHub/main/';
const fail = message => { throw new Error(message); };
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const relative = file => path.relative(src, file).split(path.sep).join('/');
const sourceText = p => fs.readFileSync(path.join(src, p), 'utf8').split(oldUrl).join(newUrl);
const releaseText = p => fs.readFileSync(path.join(dst, p), 'utf8');
const same = (a, b) => Buffer.compare(a, b) === 0;
function unpack(wrapper, file) {
  const prefix = wrapper.match(/^local Z=\{([\s\S]*?)\}\nlocal A=("(?:\\.|[^"\\])*")\n/);
  if (!prefix) fail('Missing protected Lua header: ' + file);
  const parts = JSON.parse('[' + prefix[1] + ']');
  const alphabet = JSON.parse(prefix[2]);
  if (alphabet.length !== 64 || new Set(alphabet).size !== 64) fail('Invalid alphabet: ' + file);
  const constants = wrapper.match(/bit32\.bxor\(X,\((\d+)\+P\*73\+math\.floor\(P\/251\)\*17\)%256\)-\((\d+)\+P\*19\)%256/);
  const declared = wrapper.match(/if P~=(\d+) or T\*65536\+S~=(\d+) then/);
  if (!constants || !declared || !wrapper.includes('return F()')) fail('Invalid decoder: ' + file);
  const k1 = Number(constants[1]), k2 = Number(constants[2]);
  const declaredLength = Number(declared[1]), declaredChecksum = Number(declared[2]);
  const output = Buffer.alloc(declaredLength);
  const values = new Map(Array.from(alphabet).map((c, i) => [c, i]));
  let accumulator = 0, bits = 0, count = 0, a = 1, b = 0;
  for (const part of parts) for (const ch of part) {
    const value = values.get(ch);
    if (value === undefined) fail('Invalid encoded byte: ' + file);
    accumulator = accumulator * 64 + value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      count++;
      if (count > declaredLength) fail('Decoded overflow: ' + file);
      const x = Math.floor(accumulator / (2 ** bits)) % 256;
      const y = ((x ^ ((k1 + count * 73 + Math.floor(count / 251) * 17) % 256)) -
        ((k2 + count * 19) % 256) + 256) % 256;
      output[count - 1] = y;
      a = (a + y) % 65521;
      b = (b + a) % 65521;
      accumulator %= 2 ** bits;
    }
  }
  if (count !== declaredLength || b * 65536 + a !== declaredChecksum)
    fail('Decoded length/checksum mismatch: ' + file);
  return output;
}
const catalog = JSON.parse(fs.readFileSync(path.join(src, 'games.json'), 'utf8'));
const sourceLua = ['loader.lua', 'library/MorantxUI.lua', ...walk(path.join(src, 'scripts'))
  .filter(f => f.endsWith('.lua')).map(relative).sort()];
const expectedLua = new Set(sourceLua);
if (catalog.games.length !== new Set(catalog.games.map(g => g.path)).size)
  fail('Duplicate game path in catalog');
for (const g of catalog.games)
  if (!expectedLua.has(g.path)) fail('Missing listed game script: ' + g.path);
for (const [id, g] of Object.entries(catalog.ids || {}))
  if (!expectedLua.has(g.path)) fail('Invalid game ID mapping: ' + id);
for (const [name, g] of Object.entries(catalog.names || {}))
  if (!expectedLua.has(g.path)) fail('Invalid name mapping: ' + name);
if (!catalog.games.some(g => g.path === 'scripts/Universal.lua') ||
    !catalog.games.some(g => g.path === 'scripts/Sell-Lemons.lua'))
  fail('Missing baseline game entries');
for (const file of sourceLua) {
  const expected = Buffer.from(sourceText(file), 'utf8');
  const actual = unpack(releaseText(file), file);
  if (!same(actual, expected)) fail('Decoded source mismatch: ' + file);
}
if (!same(Buffer.from(releaseText('games.json')), Buffer.from(JSON.stringify(catalog, null, 2) + '\n')))
  fail('Game catalog mismatch');
if (releaseText('games.md') !== sourceText('games.md')) fail('Game list mismatch');
const assets = walk(path.join(src, 'assets')).map(relative);
for (const asset of assets) {
  const source = fs.readFileSync(path.join(src, asset));
  const release = fs.readFileSync(path.join(dst, asset));
  const hash = b => crypto.createHash('sha256').update(b).digest('hex');
  if (hash(source) !== hash(release)) fail('Artwork mismatch: ' + asset);
}
const report = {
  verifiedLua: sourceLua.length,
  verifiedAssets: assets.length,
  uniqueCatalogEntries: catalog.games.length,
  gameSpecificEntries: catalog.games.filter(g => g.path !== 'scripts/Universal.lua').length,
  sourceReferencesRedirectedToRelease: true,
  testType: 'Byte-exact static decode/integrity checks, not live Roblox execution'
};
console.log(JSON.stringify(report, null, 2));
