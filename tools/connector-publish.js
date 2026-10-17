const SRC="lildanlid1/MorantxHub-Scripts",DST="lildanlid1/MorantxHub";
const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
function sha256(input){const b=utf8(input);const len=b.length*8;b.push(128);while(b.length%64!==56)b.push(0);for(let i=7;i>=0;i--)b.push(Math.floor(len/2**(i*8))%256);let H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];const R=(a,n)=>(a>>>n)|(a<<(32-n));for(let pos=0;pos<b.length;pos+=64){let w=new Uint32Array(64);for(let i=0;i<16;i++)w[i]=((b[pos+i*4]<<24)|(b[pos+i*4+1]<<16)|(b[pos+i*4+2]<<8)|b[pos+i*4+3])>>>0;for(let i=16;i<64;i++)w[i]=(w[i-16]+(R(w[i-15],7)^R(w[i-15],18)^(w[i-15]>>>3))+w[i-7]+(R(w[i-2],17)^R(w[i-2],19)^(w[i-2]>>>10)))>>>0;let [a,c,d,e,f,g,h,j]=H;for(let i=0;i<64;i++){let T1=(j+(R(f,6)^R(f,11)^R(f,25))+((f&g)^(~f&h))+K[i]+w[i])>>>0;let T2=((R(a,2)^R(a,13)^R(a,22))+((a&c)^(a&d)^(c&d)))>>>0;j=h;h=g;g=f;f=(e+T1)>>>0;e=d;d=c;c=a;a=(T1+T2)>>>0;}const V=[a,c,d,e,f,g,h,j];H=H.map((x,i)=>(x+V[i])>>>0);}return H.flatMap(x=>[(x>>>24)&255,(x>>>16)&255,(x>>>8)&255,x&255]);}
function utf8(s){let a=[];for(const ch of s){const c=ch.codePointAt(0);if(c<128)a.push(c);else if(c<2048)a.push(192|(c>>6),128|(c&63));else if(c<65536)a.push(224|(c>>12),128|((c>>6)&63),128|(c&63));else a.push(240|(c>>18),128|((c>>12)&63),128|((c>>6)&63),128|(c&63));}return a;}
const b64="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

const alphaBase=Array.from({length:94},(_,i)=>String.fromCharCode(i+33)).filter(c=>c!=="'"&&c!=='"'&&c!=='\\');
const read32=(b,i)=>((b[i]|b[i+1]<<8|b[i+2]<<16|b[i+3]<<24)>>>0);
const next32=s=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0;};
function encode85(data,alphabet){
 let out='';
 for(let i=0;i<data.length;i+=4){
  let v=((data[i]||0)*16777216+(data[i+1]||0)*65536+(data[i+2]||0)*256+(data[i+3]||0))>>>0;
  const digits=Array(5);for(let j=4;j>=0;j--){digits[j]=alphabet[v%85];v=Math.floor(v/85);}
  out+=digits.slice(0,Math.min(4,data.length-i)+1).join('');
 }
 return out;
}
function protect(src,name){
 const bytes=utf8(src);
 const hash=sha256(name+'\0'+src);
 const key=read32(hash,0)||0x52adb002;
 const letters=alphaBase.slice();
 let state=(key^0x92dc6a4f)>>>0;
 for(let i=letters.length-1;i>0;i--){state=next32(state);const j=state%(i+1);[letters[i],letters[j]]=[letters[j],letters[i]];}
 const alpha=letters.slice(0,85).join('');
 const BLOCK=2048,chunks=[],seeds=[];
 let A=1,B=0;
 for(let start=0;start<bytes.length;start+=BLOCK){
  const data=bytes.slice(start,Math.min(start+BLOCK,bytes.length));
  let seed=(key^Math.imul(start/BLOCK+1,0x9e3779b1)^read32(hash,4))>>>0;
  if(seed===0)seed=0x1f842dc5;
  seeds.push(seed);
  let current=seed;
  const encoded=new Uint8Array(data.length);
  for(let i=0;i<data.length;i++){
   const value=data[i];
   A=(A+value)%65521;B=(B+A)%65521;
   current=next32(current);
   let v=value^(current&255);v=(v+((current>>>8)&255))&255;v=((v<<3)|(v>>>5))&255;
   encoded[i]=v^((current>>>16)&255);
  }
  chunks.push(encode85(encoded,alpha));
 }
 const order=chunks.map((_,i)=>i);
 for(let i=order.length-1;i>0;i--){state=next32(state);const j=state%(i+1);[order[i],order[j]]=[order[j],order[i]];}
 const indices=Array(order.length);order.forEach((logical,stored)=>{indices[logical]=stored+1});
 const shuffled=order.map(i=>chunks[i]);
 const v=Array.from({length:11},(_,i)=>'_'+hash.map(x=>x.toString(16).padStart(2,'0')).join('').slice(i*2,i*2+6)+'_'+i.toString(36));
 const lua=[
 'local '+v[0]+'={'+shuffled.map(JSON.stringify).join(',\n')+'}',
 'local '+v[1]+'={'+indices.join(',')+'}',
 'local '+v[2]+'={'+seeds.join(',')+'}',
 'local '+v[3]+'='+JSON.stringify(alpha),
 'local '+v[4]+'={}',
 'for i=1,#'+v[3]+' do '+v[4]+'[string.byte('+v[3]+',i)]=i-1 end',
 'local '+v[5]+'={}',
 'local '+v[6]+','+v[7]+'=1,0',
 'local function '+v[8]+'(s) s=bit32.bxor(s,bit32.lshift(s,13));s=bit32.bxor(s,bit32.rshift(s,17));s=bit32.bxor(s,bit32.lshift(s,5));return s end',
 'for block=1,#'+v[1]+' do',
 ' local part='+v[0]+'['+v[1]+'[block]]',
 ' local remaining=math.min('+BLOCK+','+bytes.length+'-(block-1)*'+BLOCK+')',
 ' local seed='+v[2]+'[block]',
 ' local pieces,n={},0',
 ' for at=1,#part,5 do',
 '  local width=math.min(5,#part-at+1)',
 '  local value=0',
 '  for j=0,width-1 do local digit='+v[4]+'[string.byte(part,at+j)];if digit==nil then error("Corrupt protected payload",0) end;value=value*85+digit end',
 '  for j=width+1,5 do value=value*85+84 end',
 '  for j=1,math.min(width-1,remaining-n) do',
 '   local exponent=2^(8*(4-j))',
 '   local byte=math.floor(value/exponent)%256',
 '   seed='+v[8]+'(seed)',
 '   byte=bit32.bxor(byte,bit32.band(bit32.rshift(seed,16),255))',
 '   byte=(math.floor(byte/8)+(byte%8)*32)%256',
 '   byte=(byte-bit32.band(bit32.rshift(seed,8),255)+256)%256',
 '   byte=bit32.bxor(byte,bit32.band(seed,255))',
 '   '+v[6]+'=('+v[6]+'+byte)%65521;'+v[7]+'=('+v[7]+'+'+v[6]+')%65521',
 '   n=n+1;pieces[n]=string.char(byte)',
 '  end',
 ' end',
 ' if n~=remaining then error("Protected payload length mismatch",0) end',
 ' '+v[5]+'[block]=table.concat(pieces)',
 'end',
 'if '+v[7]+'*65536+'+v[6]+'~='+(B*65536+A)+' then error("Protected payload integrity failure",0) end',
 'local '+v[9]+','+v[10]+'=loadstring(table.concat('+v[5]+'),'+JSON.stringify('@'+name)+')',
 'if not '+v[9]+' then error("Protected script compile failure: "..tostring('+v[10]+'),0) end',
 'return '+v[9]+'()',
 ''
 ].join('\n');
 return {lua,sourceBytes:bytes.length,releaseBytes:utf8(lua).length};
}

const snapshot=JSON.parse((await tools.mcp__GitHub__fetch({url:"https://api.github.com/repos/"+SRC+"/git/trees/main?recursive=1"})).result.content);
const scripts=["loader.lua","library/MorantxUI.lua",...snapshot.tree.filter(x=>x.type==="blob"&&x.path.startsWith("scripts/")&&x.path.endsWith(".lua")).map(x=>x.path)];
const assets=snapshot.tree.filter(x=>x.type==="blob"&&x.path.startsWith("assets/")).map(x=>x.path);
let paths=options.mode==="lua"?scripts:options.mode==="assets"?assets:["games.json","games.md",".gitignore"];
paths=paths.slice(options.start||0,(options.start||0)+(options.limit||8));
const results=[],elements=[];
for(let i=0;i<paths.length;i+=options.parallel||4){
 const part=paths.slice(i,i+(options.parallel||4));
 const done=await Promise.all(part.map(async p=>{
   if(options.mode==="assets"){const f=(await tools.mcp__GitHub__fetch_file({repository_full_name:SRC,path:p,encoding:"base64"})).result;const blob=await tools.mcp__GitHub__create_blob({repository_full_name:DST,content:f.content.replace(/\s+/g,""),encoding:"base64"});if(blob.result.sha!==f.sha)throw Error("Asset mismatch "+p);return {path:p,sha:blob.result.sha,mode:"100644",type:"blob"};}
   const f=(await tools.mcp__GitHub__fetch_file({repository_full_name:SRC,path:p})).result;
   const updated=f.content.split("https://raw.githubusercontent.com/lildanlid1/MorantxHub-Scripts/main/").join("https://raw.githubusercontent.com/lildanlid1/MorantxHub/main/");
   if(options.mode==="lua"){if(updated.length<200)throw Error("Suspiciously short file "+p);const result=protect(updated,p);results.push({file:p,sourceBytes:result.sourceBytes,releaseBytes:result.releaseBytes,redirects:f.content.split("https://raw.githubusercontent.com/lildanlid1/MorantxHub-Scripts/main/").length-1});return {path:p,mode:"100644",type:"blob",content:result.lua};}
   return {path:p,mode:"100644",type:"blob",content:updated};
 }));
 elements.push(...done);
}
if(!elements.length)return {mode:options.mode,processed:0};
const tree=(await tools.mcp__GitHub__create_tree({repository_full_name:DST,base_tree_sha:options.base,tree_elements:elements})).result.sha;
return {tree,mode:options.mode,start:options.start||0,processed:elements.length,total:options.mode==="lua"?scripts.length:options.mode==="assets"?assets.length:3,paths,sourceTreeSha:snapshot.sha,report:results.map(x=>({file:x.file,sourceBytes:x.sourceBytes,releaseBytes:x.releaseBytes,redirects:x.redirects}))};
