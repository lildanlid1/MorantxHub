// Connector-compatible MorantxHub publisher: no filesystem/network dependencies.
// Uses connected GitHub API to read private readable scripts, build encrypted LZ
// instruction-stream wrappers and commit batches to a staging branch.
// It does not virtualize Luau program execution or promise executor compatibility.
const SRC="lildanlid1/MorantxHub-Scripts",DST="lildanlid1/MorantxHub";
const OLD="https://raw.githubusercontent.com/lildanlid1/MorantxHub-Scripts/main/";
const NEW="https://raw.githubusercontent.com/lildanlid1/MorantxHub/main/";
const BLOCK=4096;
const BASE=Array.from({length:94},(_,i)=>String.fromCharCode(i+33))
  .filter(c=>c!=="\\"&&c!=='"'&&c!=="'");
const mix=s=>{s^=s<<13;s^=s>>>17;s^=s<<5;return s>>>0};
const hex=v=>(v>>>0).toString(16).padStart(8,"0");
function utf8(s){let a=[];for(const c of s){const v=c.codePointAt(0);
if(v<128)a.push(v);
else if(v<2048)a.push(192|(v>>6),128|(v&63));
else if(v<65536)a.push(224|(v>>12),128|((v>>6)&63),128|(v&63));
else a.push(240|(v>>18),128|((v>>12)&63),128|((v>>6)&63),128|(v&63));}return a;}
function same(a,b){if(a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true}
function adler(buf){let a=1,b=0;for(const v of buf){a=(a+v)%65521;b=(b+a)%65521;}return b*65536+a;}
function shuffle(input,seed){let s=seed||0x391aba63,a=input.slice();for(let i=a.length-1;i>0;i--){s=mix(s);let j=s%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
function encode85(data,alphabet){let out="";for(let i=0;i<data.length;i+=4){
let v=(((data[i]||0)*16777216)+(data[i+1]||0)*65536+(data[i+2]||0)*256+(data[i+3]||0))>>>0;
let d=Array(5);for(let j=4;j>=0;j--){d[j]=alphabet[v%85];v=Math.floor(v/85);}
out+=d.slice(0,Math.min(4,data.length-i)+1).join("");}return out;}
function decode85(s,alphabet){let map=new Map([...alphabet].map((c,i)=>[c,i])),out=[];
for(let i=0;i<s.length;i+=5){let width=Math.min(5,s.length-i),v=0;
for(let j=0;j<width;j++){if(!map.has(s[i+j]))throw Error("Bad Base85 char");v=v*85+map.get(s[i+j]);}
for(let j=width;j<5;j++)v=v*85+84;
for(let j=0;j<width-1;j++)out.push(Math.floor(v/2**(8*(3-j)))%256);}return out;}
function compress(raw){let stream=[],literal=[],index=new Map();
const flush=()=>{if(literal.length){stream.push(literal.length-1,...literal);literal=[];}};
for(let i=0;i<raw.length;){let length=0,offset=0;
if(i+3<raw.length){const key=(raw[i]<<24)|(raw[i+1]<<16)|(raw[i+2]<<8)|raw[i+3],prev=index.get(key);
if(prev!==undefined&&i-prev<=65535){let n=0;while(n<130&&i+n<raw.length&&raw[prev+n]===raw[i+n])n++;
if(n>=4){length=n;offset=i-prev;}}}
if(length){flush();stream.push(128+length-3,offset&255,(offset>>>8)&255);
for(let j=0;j<length;j++){const p=i+j;if(p+3<raw.length)index.set((raw[p]<<24)|(raw[p+1]<<16)|(raw[p+2]<<8)|raw[p+3],p);}
i+=length;
}else{if(i+3<raw.length)index.set((raw[i]<<24)|(raw[i+1]<<16)|(raw[i+2]<<8)|raw[i+3],i);
literal.push(raw[i]);i++;if(literal.length===128)flush();}}flush();return stream;}
function expand(packed,max){let output=[],p=0;while(p<packed.length){let tag=packed[p++];
if(tag<128){let count=tag+1;if(p+count>packed.length||output.length+count>max)throw Error("Literal overflow");
for(let j=0;j<count;j++)output.push(packed[p++]);}
else{let count=tag-128+3;if(p+2>packed.length)throw Error("Truncated offset");
let off=packed[p++]+packed[p++]*256;if(off<1||off>output.length||output.length+count>max)throw Error("Invalid match");
for(let j=0;j<count;j++)output.push(output[output.length-off]);}}
if(output.length!==max)throw Error("Decompression length mismatch");return output;}
function crypt(bytes,seed,decrypt){let out=[],state=seed;
for(let i=0;i<bytes.length;i++){state=mix(state);let v=bytes[i];
if(decrypt){v^=(state>>>16)&255;v=((v>>>3)|(v<<5))&255;v=(v-((state>>>8)&255)+256)&255;v^=state&255;}
else{v^=state&255;v=(v+((state>>>8)&255))&255;v=((v<<3)|(v>>>5))&255;v^=(state>>>16)&255;}
out.push(v);}return out;}
function wrapper(raw,file){let h=2166136261;
for(const c of file){h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;}
for(let i=0;i<raw.length;i+=97)h=Math.imul(h^raw[i],16777619)>>>0;
h=(h^(raw.length>>>0))>>>0;if(!h)h=0x397e42d1;
let state=h;const next=()=>{state=mix(state);if(!state)state=0x397e42d1;return state};
const alphabet=shuffle(BASE,next()).slice(0,85).join("");
const blocks=[];
for(let start=0;start<raw.length;start+=BLOCK){let part=raw.slice(start,start+BLOCK),packed=compress(part),key=next(),cipher=crypt(packed,key,false),encoded=encode85(cipher,alphabet);
const decoded=expand(crypt(decode85(encoded,alphabet),key,true),part.length);
if(!same(decoded,part))throw Error("Internal protected roundtrip failed: "+file+" block "+start);
blocks.push({encoded,key,raw:part.length,packed:packed.length,checksum:adler(part)});}
const permutation=shuffle(blocks.map((_,i)=>i),next());
const stored=permutation.map(i=>blocks[i].encoded),order=blocks.map((_,i)=>permutation.indexOf(i)+1);
const keys=blocks.map(x=>x.key),lengths=blocks.map(x=>x.raw),packedLengths=blocks.map(x=>x.packed),sums=blocks.map(x=>x.checksum);
let used=new Set();const unique=()=>{let value;do{value="_"+hex(next())+hex(next()).slice(0,6)}while(used.has(value));used.add(value);return value;};
const names=Array.from({length:23},unique);
const [pool,positions,seeds,lens,plens,checks,alpha,map,rand,decode,decrypt,expandFn,sections,combined,source,compiled,err,checkOne,checkTwo,control,begin,finish,label]=names;
const s1=157+next()%900,s2=2300+next()%900;
const lua=[
"return (function(...)",
"local "+pool+"={"+stored.map(JSON.stringify).join(",\n")+"}",
"local "+positions+"={"+order.join(",")+"}",
"local "+seeds+"={"+keys.join(",")+"}",
"local "+lens+"={"+lengths.join(",")+"}",
"local "+plens+"={"+packedLengths.join(",")+"}",
"local "+checks+"={"+sums.join(",")+"}",
"local "+alpha+"="+JSON.stringify(alphabet),
"local "+map+"={}",
"for i=1,#"+alpha+" do "+map+"[string.byte("+alpha+",i)]=i-1 end",
"local function "+rand+"(s) s=bit32.bxor(s,bit32.lshift(s,13));s=bit32.bxor(s,bit32.rshift(s,17));s=bit32.bxor(s,bit32.lshift(s,5));return s end",
"local function "+decode+"(data,expected)",
" local arr,n={},0",
" for at=1,#data,5 do",
"  local width=math.min(5,#data-at+1)",
"  local value=0",
"  for d=0,width-1 do local digit="+map+"[string.byte(data,at+d)]; if digit==nil then error(\"Protected alphabet mismatch\",0) end;value=value*85+digit end",
"  for d=width+1,5 do value=value*85+84 end",
"  for d=1,width-1 do n=n+1;arr[n]=math.floor(value/2^(8*(4-d)))%256 end",
" end",
" if n~=expected then error(\"Protected payload size failure\",0) end",
" return arr",
"end",
"local function "+decrypt+"(data,key)",
" for i=1,#data do",
"  key="+rand+"(key)",
"  local x=bit32.bxor(data[i],bit32.band(bit32.rshift(key,16),255))",
"  x=(math.floor(x/8)+(x%8)*32)%256",
"  x=(x-bit32.band(bit32.rshift(key,8),255)+256)%256",
"  data[i]=bit32.bxor(x,bit32.band(key,255))",
" end",
" return data",
"end",
"local function "+expandFn+"(data,expected,integrity)",
" local out,n,p={},0,1",
" local a,b=1,0",
" while p<=#data do",
"  local tag=data[p];p=p+1",
"  if tag<128 then",
"   local count=tag+1",
"   if p+count-1>#data or n+count>expected then error(\"Protected literal overflow\",0) end",
"   for j=1,count do local byte=data[p];p=p+1;n=n+1;out[n]=byte;a=(a+byte)%65521;b=(b+a)%65521 end",
"  else",
"   if p+1>#data then error(\"Protected VM opcode invalid\",0) end",
"   local count=tag-128+3",
"   local off=data[p]+data[p+1]*256;p=p+2",
"   if off<1 or off>n or n+count>expected then error(\"Protected VM offset invalid\",0) end",
"   for j=1,count do local byte=out[n-off+1];n=n+1;out[n]=byte;a=(a+byte)%65521;b=(b+a)%65521 end",
"  end",
" end",
" if n~=expected or b*65536+a~=integrity then error(\"Protected block integrity failure\",0) end",
" local chunks,m={},0",
" for j=1,n,256 do m=m+1;chunks[m]=string.char(table.unpack(out,j,math.min(j+255,n))) end",
" return table.concat(chunks)",
"end",
"local "+sections+"={}",
"local "+control+"="+s1,
"while "+control+"~="+s2+" do",
" if "+control+"=="+s1+" then",
"  for block=1,#"+positions+" do",
"   local text="+pool+"["+positions+"[block]]",
"   local count="+plens+"[block]",
"   local bytes="+decode+"(text,count)",
"   local packed="+decrypt+"(bytes,"+seeds+"[block])",
"   "+sections+"[block]="+expandFn+"(packed,"+lens+"[block],"+checks+"[block])",
"  end",
"  "+control+"="+s2,
" else error(\"Protected control state invalid\",0) end",
"end",
"local "+source+"=table.concat("+sections+")",
"if #"+source+"~="+raw.length+" then error(\"Protected length mismatch\",0) end",
"local "+compiled+","+err+"=loadstring("+source+","+JSON.stringify("@"+file)+")",
"if type("+compiled+")~=\"function\" then error(\"MorantxHub Lua compile: \"..tostring("+err+"),0) end",
"return "+compiled+"(...)",
"end)(...)",""].join("\n");
return {content:lua,sourceBytes:raw.length,protectedChars:lua.length,blocks:blocks.length,compressedBytes:blocks.reduce((s,v)=>s+v.packed,0)};
}
const branch=options.branch||"heavy-release-20261019";
const [sourceTree,mainTree,stageTree,stageRef]=await Promise.all([
  tools.mcp__GitHub__fetch({url:"https://api.github.com/repos/"+SRC+"/git/trees/main?recursive=1"}),
  tools.mcp__GitHub__fetch({url:"https://api.github.com/repos/"+DST+"/git/trees/main?recursive=1"}),
  tools.mcp__GitHub__fetch({url:"https://api.github.com/repos/"+DST+"/git/trees/"+branch+"?recursive=1"}),
  tools.mcp__GitHub__fetch({url:"https://api.github.com/repos/"+DST+"/git/refs/heads/"+branch})
]);
const parse=x=>JSON.parse(x.result.content);
const sr=parse(sourceTree),ma=parse(mainTree),st=parse(stageTree);
if(sr.truncated||ma.truncated||st.truncated)throw Error("Truncated git tree");
const src={files:sr.tree.filter(x=>x.type==="blob")},
main={files:ma.tree.filter(x=>x.type==="blob")},
stage={head:parse(stageRef).object.sha,tree:st.sha,files:st.tree.filter(x=>x.type==="blob")};
const scripts=["loader.lua","library/MorantxUI.lua",...src.files.filter(x=>x.path.startsWith("scripts/")&&x.path.endsWith(".lua")).map(x=>x.path).sort()];
if(scripts.length!==193)throw Error("Unexpected source script count: "+scripts.length);
const orig=new Map(main.files.map(x=>[x.path,x.sha])),staged=new Map(stage.files.map(x=>[x.path,x.sha]));
const unprocessed=scripts.filter(p=>staged.get(p)===orig.get(p)),selected=unprocessed.slice(0,options.limit||8);
if(!selected.length)return {done:true,total:scripts.length,remaining:0,head:stage.head};
const result=[];
for(let i=0;i<selected.length;i+=(options.parallel||3)){
const part=selected.slice(i,i+(options.parallel||3));
const block=await Promise.all(part.map(async p=>{const f=(await tools.mcp__GitHub__fetch_file({repository_full_name:SRC,path:p})).result;
if(!f.content||f.content.length<200)throw Error("Missing readable contents: "+p);
const revised=f.content.split(OLD).join(NEW),data=wrapper(utf8(revised),p);
return {path:p,content:data.content,originalSourceBytes:data.sourceBytes,protectedChars:data.protectedChars,blocks:data.blocks};}));
result.push(...block);}
const tree=(await tools.mcp__GitHub__create_tree({repository_full_name:DST,base_tree_sha:stage.tree,tree_elements:result.map(x=>({path:x.path,mode:"100644",type:"blob",content:x.content}))})).result.sha;
const commit=(await tools.mcp__GitHub__create_commit({repository_full_name:DST,parent_sha:stage.head,tree_sha:tree,message:"Stage encrypted LZ protected Lua scripts ("+result.length+" files)"})).result.sha;
const advanced=(await tools.mcp__GitHub__update_ref({repository_full_name:DST,branch_name:branch,sha:commit,expected_sha:stage.head})).result.success;
if(!advanced)throw Error("Staging branch did not advance");
return {done:false,staged:result.length,remaining:unprocessed.length-result.length,total:scripts.length,
  paths:result.map(x=>x.path),head:commit,protectedBytes:result.reduce((x,v)=>x+v.protectedChars,0)};
