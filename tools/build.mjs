import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const input=path.resolve(process.argv[2]||'_source');
const output=path.resolve(process.argv[3]||'.');
const oldUrl='https://raw.githubusercontent.com/lildanlid1/MorantxHub-Scripts/main/';
const newUrl='https://raw.githubusercontent.com/lildanlid1/MorantxHub/main/';
const base64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?files(path.join(dir,x.name)):[path.join(dir,x.name)]);}
function save(name,data){const p=path.join(output,name);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,data);}
function check(bytes){let a=1,b=0;for(const x of bytes){a=(a+x)%65521;b=(b+a)%65521;}return b*65536+a;}

const alphabetBase=Array.from({length:94},(_,i)=>String.fromCharCode(i+33)).filter(c=>c!=="'"&&c!=='"'&&c!=='\\');
function next32(s){s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;}
function encode85(bytes,alphabet){
 let result='';
 for(let i=0;i<bytes.length;i+=4){
   let v=((bytes[i]||0)*16777216+(bytes[i+1]||0)*65536+(bytes[i+2]||0)*256+(bytes[i+3]||0))>>>0;
   const digits=Array(5);
   for(let j=4;j>=0;j--){digits[j]=alphabet[v%85];v=Math.floor(v/85);}
   result+=digits.slice(0,Math.min(4,bytes.length-i)+1).join('');
 }
 return result;
}
function protect(source,name){
 const raw=Buffer.from(source,'utf8');
 const fingerprint=crypto.createHash('sha256').update(Buffer.concat([Buffer.from(name+'\0','utf8'),raw])).digest();
 const key=fingerprint.readUInt32LE(0)||0x52adb002;
 const letters=alphabetBase.slice();
 let state=(key^0x92dc6a4f)>>>0;
 for(let i=letters.length-1;i>0;i--){state=next32(state);const j=state%(i+1);[letters[i],letters[j]]=[letters[j],letters[i]];}
 const alphabet=letters.slice(0,85).join('');
 const blockSize=2048,chunks=[],seeds=[];
 for(let start=0;start<raw.length;start+=blockSize){
   const block=raw.subarray(start,Math.min(start+blockSize,raw.length));
   const index=start/blockSize;
   let s=(key^Math.imul(index+1,0x9e3779b1)^fingerprint.readUInt32LE(4))>>>0;
   if(s===0)s=0x1f842dc5;
   seeds.push(s);
   let current=s;
   const encrypted=Buffer.alloc(block.length);
   for(let i=0;i<block.length;i++){
     current=next32(current);
     let v=raw[start+i]^(current&255);
     v=(v+((current>>>8)&255))&255;
     v=((v<<3)|(v>>>5))&255;
     encrypted[i]=v^((current>>>16)&255);
   }
   chunks.push(encode85(encrypted,alphabet));
 }
 const order=chunks.map((_,i)=>i);
 for(let i=order.length-1;i>0;i--){state=next32(state);const j=state%(i+1);[order[i],order[j]]=[order[j],order[i]];}
 const positions=Array(order.length);
 order.forEach((logical,stored)=>positions[logical]=stored+1);
 const shuffled=order.map(index=>chunks[index]);
 const names=Array.from({length:11},(_,i)=>'_'+fingerprint.toString('hex').slice(i*2,i*2+6)+'_'+i.toString(36));
 const lua=[
 'local '+names[0]+'={'+shuffled.map(JSON.stringify).join(',\n')+'}',
 'local '+names[1]+'={'+positions.join(',')+'}',
 'local '+names[2]+'={'+seeds.join(',')+'}',
 'local '+names[3]+'='+JSON.stringify(alphabet),
 'local '+names[4]+'={}',
 'for i=1,#'+names[3]+' do '+names[4]+'[string.byte('+names[3]+',i)]=i-1 end',
 'local '+names[5]+'={}',
 'local '+names[6]+','+names[7]+'=1,0',
 'local function '+names[8]+'(s) s=bit32.bxor(s,bit32.lshift(s,13));s=bit32.bxor(s,bit32.rshift(s,17));s=bit32.bxor(s,bit32.lshift(s,5));return s end',
 'for block=1,#'+names[1]+' do',
 ' local part='+names[0]+'['+names[1]+'[block]]',
 ' local remaining=math.min('+blockSize+','+raw.length+'-(block-1)*'+blockSize+')',
 ' local seed='+names[2]+'[block]',
 ' local pieces,n={},0',
 ' for at=1,#part,5 do',
 '  local width=math.min(5,#part-at+1)',
 '  local value=0',
 '  for j=0,width-1 do local digit='+names[4]+'[string.byte(part,at+j)];if digit==nil then error("Corrupt protected payload",0) end;value=value*85+digit end',
 '  for j=width+1,5 do value=value*85+84 end',
 '  for j=1,math.min(width-1,remaining-n) do',
 '   local exponent=2^(8*(4-j))',
 '   local byte=math.floor(value/exponent)%256',
 '   seed='+names[8]+'(seed)',
 '   byte=bit32.bxor(byte,bit32.band(bit32.rshift(seed,16),255))',
 '   byte=(math.floor(byte/8)+(byte%8)*32)%256',
 '   byte=(byte-bit32.band(bit32.rshift(seed,8),255)+256)%256',
 '   byte=bit32.bxor(byte,bit32.band(seed,255))',
 '   '+names[6]+'=('+names[6]+'+byte)%65521;'+names[7]+'=('+names[7]+'+'+names[6]+')%65521',
 '   n=n+1;pieces[n]=string.char(byte)',
 '  end',
 ' end',
 ' if n~=remaining then error("Protected payload length mismatch",0) end',
 ' '+names[5]+'[block]=table.concat(pieces)',
 'end',
 'if '+names[7]+'*65536+'+names[6]+'~='+check(raw)+' then error("Protected payload integrity failure",0) end',
 'local '+names[9]+','+names[10]+'=loadstring(table.concat('+names[5]+'),'+JSON.stringify('@'+name)+')',
 'if not '+names[9]+' then error("Protected script compile failure: "..tostring('+names[10]+'),0) end',
 'return '+names[9]+'()',
 ''
 ].join('\n');
 return lua;
}

const catalog=JSON.parse(fs.readFileSync(path.join(input,'games.json'),'utf8'));
const all=files(path.join(input,'scripts')).filter(x=>x.endsWith('.lua'));
const paths=all.map(p=>path.relative(input,p).replace(/\\/g,'/')),known=new Set(paths),seen=new Set(),duplicates=[];
catalog.games=catalog.games.filter(g=>{if(!known.has(g.path))throw Error('Missing catalog path '+g.path);if(seen.has(g.path)){duplicates.push(g.path);return false;}seen.add(g.path);return true;});
for(const [k,v] of Object.entries(catalog.ids||{}))if(!known.has(v.path))throw Error('Missing id '+k);
for(const [k,v] of Object.entries(catalog.names||{}))if(!known.has(v.path))throw Error('Missing name '+k);
if(!seen.has('scripts/Universal.lua')||!seen.has('scripts/Sell-Lemons.lua'))throw Error('Baseline missing');
const report=[];
for(const file of ['loader.lua','library/MorantxUI.lua',...paths]){
 const original=fs.readFileSync(path.join(input,file),'utf8');
 if(original.length<200)throw Error('Suspiciously short file '+file);
 const revised=original.split(oldUrl).join(newUrl);
 const protectedText=protect(revised,file);
 save(file,protectedText);
 report.push({file,sourceBytes:Buffer.byteLength(revised),obfuscatedBytes:Buffer.byteLength(protectedText),oldUrlReferences:original.split(oldUrl).length-1,remoteLoad:/loadstring\s*\(\s*game:HttpGet/i.test(original)});
}
save('games.json',JSON.stringify(catalog,null,2)+'\n');
save('games.md',fs.readFileSync(path.join(input,'games.md'),'utf8').split(oldUrl).join(newUrl));
const number=catalog.games.filter(g=>g.path!=='scripts/Universal.lua').length;
save('README.md','# MorantxHub\n\n**'+number+' games**, plus Universal fallback.\n\nScripts: scripts/  |  UI: library/\n\nLoad using:\n\n'+
 '    loadstring(game:HttpGet("https://raw.githubusercontent.com/lildanlid1/MorantxHub/main/loader.lua"))()\n\n'+
 '[Game list and features](games.md) | [Testing notes](TESTING.md)\n\nLive Roblox gameplay has not been verified by the release builder.\n');
save('TESTING.md','# Game testing\n\nSell Lemons was reported working before obfuscation. Re-test it as the baseline.\n\nSuggested unverified tests: RIVALS, Blox Fruits, Anime Dice, Steal An Egg, Arsenal, Sell Ores, Flee the Facility.\n\nVerify the correct game script is selected, UI appears, a safe feature works, toggles stop correctly, and errors are absent.\n\nThe release builder retains game-specific logic and only redirects old MorantxHub-Scripts URLs. Not all scripts have been tested in live games.\n\nRepository visibility must be changed separately in GitHub Settings. Obfuscation is reversible by determined users.\n');
const summary={gameCount:number,catalogEntries:catalog.games.length,luaFiles:report.length,duplicatesRemoved:duplicates,redirectedReferences:report.reduce((n,r)=>n+r.oldUrlReferences,0),files:report};
save('build-report.json',JSON.stringify(summary,null,2)+'\n');
save('.obfuscation-smoke.lua',protect('return 7+8\n','test-smoke.lua'));
console.log(JSON.stringify({gameCount:number,catalogEntries:catalog.games.length,luaFiles:report.length,duplicates,redirectedReferences:summary.redirectedReferences}));
