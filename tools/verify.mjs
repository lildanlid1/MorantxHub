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

function unpack85(wrapper, file, expectedLength) {
  const match = wrapper.match(/^local (\w+)=\{([\s\S]*?)\}\nlocal (\w+)=\{([\s\S]*?)\}\nlocal (\w+)=\{([\s\S]*?)\}\nlocal (\w+)=("(?:\\.|[^"\\])*")\n/);
  if (!match) fail('Malformed Base85 block header: ' + file);
  const chunks = JSON.parse('[' + match[2] + ']');
  const positions = JSON.parse('[' + match[4] + ']');
  const seeds = JSON.parse('[' + match[6] + ']');
  const alphabet = JSON.parse(match[8]);
  if (new Set(alphabet).size !== 85 || alphabet.length !== 85)
    fail('Invalid protected alphabet: ' + file);
  if (chunks.length !== seeds.length || chunks.length !== positions.length)
    fail('Shuffled block count mismatch: ' + file);
  const ordered = new Set(positions);
  if (ordered.size !== chunks.length ||
      [...ordered].some(x => !Number.isInteger(x) || x < 1 || x > chunks.length))
    fail('Invalid protected block permutation: ' + file);
  const checksum = wrapper.match(/if \w+\*65536\+\w+~=(\d+) then error\("Protected payload integrity failure"/);
  if (!checksum) fail('Missing payload integrity check: ' + file);
  const code = Buffer.alloc(expectedLength);
  const decodeMap = new Map([...alphabet].map((c, i) => [c, i]));
  const next32 = input => {
    input ^= input << 13;
    input ^= input >>> 17;
    input ^= input << 5;
    return input >>> 0;
  };
  let offset = 0, a = 1, b = 0;
  for (let block = 0; block < positions.length; block++) {
    const part = chunks[positions[block] - 1];
    const remaining = Math.min(2048, expectedLength - block * 2048);
    let seed = seeds[block] >>> 0;
    let n = 0;
    for (let at = 0; at < part.length; at += 5) {
      const width = Math.min(5, part.length - at);
      let value = 0;
      for (let j = 0; j < width; j++) {
        const digit = decodeMap.get(part[at + j]);
        if (digit === undefined) fail('Invalid Base85 symbol in ' + file);
        value = value * 85 + digit;
      }
      for (let j = width; j < 5; j++) value = value * 85 + 84;
      const outputWidth = Math.min(width - 1, remaining - n);
      for (let j = 1; j <= outputWidth; j++) {
        if (offset >= expectedLength) fail('Payload byte overflow: ' + file);
        let byte = Math.floor(value / (2 ** (8 * (4 - j)))) % 256;
        seed = next32(seed);
        byte ^= (seed >>> 16) & 255;
        byte = (Math.floor(byte / 8) + (byte % 8) * 32) % 256;
        byte = (byte - ((seed >>> 8) & 255) + 256) % 256;
        byte ^= seed & 255;
        code[offset++] = byte;
        a = (a + byte) % 65521;
        b = (b + a) % 65521;
        n++;
      }
    }
    if (n !== remaining) fail('Protected block length mismatch: ' + file);
  }
  if (offset !== expectedLength || b * 65536 + a !== Number(checksum[1]))
    fail('Protected payload length/checksum mismatch: ' + file);
  return code;
}

function unpack(wrapper, file, expectedLength) {
  if (/^local _[a-f0-9]{6}_0=\{/.test(wrapper)) return unpack85(wrapper, file, expectedLength);
  const layered = wrapper.match(/^local Z=\{([\s\S]*?)\}\nlocal A=("(?:\\.|[^"\\])*")\n/);
  const legacy = wrapper.match(/^local a=\{([\s\S]*?)\}\nlocal k=(\d+)/);
  if (!layered && !legacy) fail('Not an obfuscated Lua file: ' + file);
  const parts = JSON.parse('[' + (layered ? layered[1] : legacy[1]) + ']');
  const alphabet = layered ? JSON.parse(layered[2]) :
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  if (alphabet.length !== 64 || new Set(alphabet).size !== 64) fail('Invalid alphabet: ' + file);
  const constants = layered && wrapper.match(/bit32\.bxor\(X,\((\d+)\+P\*73\+math\.floor\(P\/251\)\*17\)%256\)-\((\d+)\+P\*19\)%256/);
  const declared = layered && wrapper.match(/if P~=(\d+) or T\*65536\+S~=(\d+) then/);
  if (layered && (!constants || !declared)) fail('Invalid layered decoder: ' + file);
  if (!wrapper.includes('return F()')) fail('Missing execution wrapper: ' + file);
  const k1 = layered ? Number(constants[1]) : Number(legacy[2]);
  const k2 = layered ? Number(constants[2]) : 0;
  const declaredLength = layered ? Number(declared[1]) : expectedLength;
  const declaredChecksum = layered ? Number(declared[2]) : null;
  if (declaredLength !== expectedLength) fail('Incorrect declared byte count: ' + file);
  const output = Buffer.alloc(declaredLength);
  const values = new Map(Array.from(alphabet).map((c, i) => [c, i]));
  let accumulator = 0, bits = 0, count = 0, a = 1, b = 0;
  for (const part of parts) for (const ch of part) {
    const value = values.get(ch);
    if (value === undefined) {
      if (!layered && ch === '=') continue;
      fail('Invalid encoded byte: ' + file);
    }
    accumulator = accumulator * 64 + value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      count++;
      if (count > expectedLength) fail('Decoded overflow: ' + file);
      const x = Math.floor(accumulator / (2 ** bits)) % 256;
      const y = layered ?
        ((x ^ ((k1 + count * 73 + Math.floor(count / 251) * 17) % 256)) -
          ((k2 + count * 19) % 256) + 256) % 256 :
        x ^ ((k1 + ((count - 1) * 73) % 251) % 256);
      output[count - 1] = y;
      a = (a + y) % 65521;
      b = (b + a) % 65521;
      accumulator %= 2 ** bits;
    }
  }
  if (count !== expectedLength || (layered && b * 65536 + a !== declaredChecksum))
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
  const actual = unpack(releaseText(file), file, expected.length);
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
  protectionLayer: 'Build input decoded byte-exact (may include Obscura AST/VM stage)',
  testType: 'Byte-exact static decode/integrity checks, not live Roblox execution'
};
console.log(JSON.stringify(report, null, 2));
