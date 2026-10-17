import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
const source=path.resolve(process.argv[2]||'_source');
const release=path.resolve(process.argv[3]||'.');
const oldUrl='https://raw.githubusercontent.com/lildanlid1/MorantxHub-Scripts/main/';
const newUrl='https://raw.githubusercontent.com/lildanlid1/MorantxHub/main/';
const files=folder=>fs.readdirSync(folder,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(folder,entry.name)):[path.join(folder,entry.name)]);
const original=JSON.parse(fs.readFileSync(path.join(source,'games.json'),'utf8'));
const published=JSON.parse(fs.readFileSync(path.join(release,'games.json'),'utf8'));
if(JSON.stringify(original)!==JSON.stringify(published))throw Error('Published game catalog differs from source');
const sourcePaths=files(path.join(source,'scripts')).filter(x=>x.endsWith('.lua')).map(x=>path.relative(source,x).replace(/\\/g,'/'));
const releasePaths=files(path.join(release,'scripts')).filter(x=>x.endsWith('.lua')).map(x=>path.relative(release,x).replace(/\\/g,'/'));
if(sourcePaths.length!==releasePaths.length||releasePaths.some(x=>!sourcePaths.includes(x)))throw Error('Published game scripts differ from source');
const listed=new Set(original.games.map(x=>x.path));
for(const row of original.games)if(!sourcePaths.includes(row.path))throw Error('Missing catalog script: '+row.path);
for(const kind of ['ids','names'])for(const [key,row] of Object.entries(original[kind]||{}))if(!listed.has(row.path))throw Error('Invalid '+kind+' mapping: '+key);
if(!listed.has(original.names.universal?.path))throw Error('Universal fallback missing');
if(!Object.keys(original.ids).length)throw Error('Game ID mappings missing');
const paths=['loader.lua','library/MorantxUI.lua',...sourcePaths];
for(const name of paths){
 const script=fs.readFileSync(path.join(release,name),'utf8');
 if(!script.includes('bit32.bxor')||!script.includes('loadstring(table.concat')||script.includes(oldUrl))throw Error('Invalid protected script: '+name);
}
const samples=['loader.lua','library/MorantxUI.lua','scripts/Sell-Lemons.lua','scripts/RIVALS.lua','scripts/Blox-Fruits.lua'];
const biggest=sourcePaths.slice().sort((a,b)=>fs.statSync(path.join(source,b)).size-fs.statSync(path.join(source,a)).size)[0];
if(biggest)samples.push(biggest);
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'morantx-release-'));
try{
 const validator=path.join(temp,'check.lua');
 fs.writeFileSync(validator,'local f=assert(io.open(arg[2],"rb"));local expected=f:read("*a");f:close()\nloadstring=function(text,label) assert(text==expected,"Decoder changed source: "..tostring(label));return function() return 421 end end\nassert(dofile(arg[1])==421)\n');
 for(const name of [...new Set(samples)]){
   if(!fs.existsSync(path.join(source,name)))continue;
   const exact=fs.readFileSync(path.join(source,name),'utf8').split(oldUrl).join(newUrl);
   const desired=path.join(temp,'expected.lua');fs.writeFileSync(desired,exact);
   const p=spawnSync(process.env.LUA_BIN||'lua5.2',[validator,path.join(release,name),desired],{encoding:'utf8',timeout:120000});
   if(p.status!==0)throw Error('Lua decoder verification failed: '+name+': '+(p.stderr||p.stdout||p.error));
 }
}finally{fs.rmSync(temp,{recursive:true,force:true});}
console.log(JSON.stringify({status:'passed',games:original.games.length,ids:Object.keys(original.ids).length,luaFiles:paths.length}));
