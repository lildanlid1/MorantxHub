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
function protect(source,name){
 const bytes=Buffer.from(source,'utf8'), hash=crypto.createHash('sha256').update(name).digest();
 const k1=23+hash[0]%200,k2=13+hash[1]%210;
 const letters=base64.split('');
 for(let i=63;i>0;i--){let j=hash[i%32]%(i+1);[letters[i],letters[j]]=[letters[j],letters[i]];}
 const alphabet=letters.join(''), encodedBytes=Buffer.alloc(bytes.length);
 for(let i=0;i<bytes.length;i++){const n=i+1;encodedBytes[i]=((bytes[i]+(k2+n*19)%256)%256)^((k1+n*73+Math.floor(n/251)*17)%256);}
 const encoded=encodedBytes.toString('base64').replace(/=+$/,'').replace(/\+/g,'-').replace(/\//g,'_').replace(/[A-Za-z0-9_-]/g,c=>alphabet[base64.indexOf(c)]);
 const backward=Buffer.from(encoded.replace(/[A-Za-z0-9_-]/g,c=>base64[alphabet.indexOf(c)]).replace(/-/g,'+').replace(/_/g,'/'),'base64');
 if(!backward.equals(encodedBytes))throw Error('Base64 failed: '+name);
 for(let i=0;i<bytes.length;i++){const n=i+1;let x=(backward[i]^((k1+n*73+Math.floor(n/251)*17)%256));x=(x-(k2+n*19)%256+256)%256;if(bytes[i]!==x)throw Error('Decoder failed: '+name+':'+i);}
 const chunks=encoded.match(/.{1,8192}/g)||[''];
 const lua=[
 'local Z={'+chunks.map(JSON.stringify).join(',\n')+'}',
 'local A='+JSON.stringify(alphabet),
 'local M={}',
 'for i=1,#A do M[string.byte(A,i)]=i-1 end',
 'local D=table.concat(Z)',
 'local B,C={},{}',
 'local N,Q,P=0,0,0',
 'local S,T=1,0',
 'for i=1,#D do',
 ' local V=M[string.byte(D,i)]',
 ' if V~=nil then',
 '  N=N*64+V;Q=Q+6',
 '  if Q>=8 then',
 '   Q=Q-8;P=P+1',
 '   local X=math.floor(N/(2^Q))%256',
 '   local Y=(bit32.bxor(X,('+k1+'+P*73+math.floor(P/251)*17)%256)-('+k2+'+P*19)%256+256)%256',
 '   S=(S+Y)%65521;T=(T+S)%65521',
 '   B[#B+1]=string.char(Y)',
 '   if #B==2048 then C[#C+1]=table.concat(B);B={} end',
 '   N=N%(2^Q)',
 '  end',
 ' end',
 'end',
 'if #B>0 then C[#C+1]=table.concat(B) end',
 'if P~='+bytes.length+' or T*65536+S~='+check(bytes)+' then error("Corrupt MorantxHub script: '+name+'",0) end',
 'local F,E=loadstring(table.concat(C),'+JSON.stringify('@'+name)+')',
 'if not F then error("Compile error in '+name+': "..tostring(E),0) end',
 'return F()',
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
