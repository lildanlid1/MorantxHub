return (function(...)
local _850056d67480f6={"r#9>4#Leawu4MSY/d52lxn]k+xY,,v>(`s,LKG{Wh/U,~*IwPiEbyE6D/_EIucu$Se?_5O&F9|mS@2uZms|={+3ax9$i`tn6nrlhXETVf4~2QkH~it=iIwm2@|!&03THA8BW+M!0re~hl.O5$fqeH^e-s|W|l|KMqPB5A*s9Xa33Cls^LB+_/d[!%c+N~X%U]ZmdD-e<x]9y63.Qi..iek(KUb#u(+e%_0@.9as.Ny|{HlsGy`Wn87_Bx!uX{by0Zh+~8El-B?s^{q](Gb~z?!@b@uVl]xFO%K4=z=_ny09{6W4Q_ViBsae$hWDUvHhj`-8N0*LmyL]4Q8UXu|%K2aLIzGFHTQb$i(D&iQn~I:7dpiYctDe-hUa2mi>4QsQP%=NhFv|T-j(>|0.>a?~jzcm6f|eS^G0VyDy6MFhOwXxf}#p:>2d2+`5I&3k:Z<y@5mDeVdP,l)AV=*]6P<>b@}[H$U,M5ZM4sOP+^z2_i8A]^B#,S]iC2/suP%*QL8"}
local _233fccbe8fa45c={1}
local _8212c8f2ba904b={2935716012}
local _ce3cd263da6393={595}
local _a8904019b2f53a={408}
local _a259216f48e4c8={64340908}
local _eeba01087df19e="_qnk9`U0+DX$/y2rfQc7I<Ti(]~EZuKx)}:dzhGV5MLsBlA>p%#-meH*a.?@^8O[C&!|YFNvj,4PS6=3b{wWt"
local _8b8e2793a0f065={}
for i=1,#_eeba01087df19e do _8b8e2793a0f065[string.byte(_eeba01087df19e,i)]=i-1 end
local function _2473e60d4eff20(s) s=bit32.bxor(s,bit32.lshift(s,13));s=bit32.bxor(s,bit32.rshift(s,17));s=bit32.bxor(s,bit32.lshift(s,5));return s end
local function _f65b4166508e05(data,expected)
 local arr,n={},0
 for at=1,#data,5 do
  local width=math.min(5,#data-at+1)
  local value=0
  for d=0,width-1 do local digit=_8b8e2793a0f065[string.byte(data,at+d)]; if digit==nil then error("Protected alphabet mismatch",0) end;value=value*85+digit end
  for d=width+1,5 do value=value*85+84 end
  for d=1,width-1 do n=n+1;arr[n]=math.floor(value/2^(8*(4-d)))%256 end
 end
 if n~=expected then error("Protected payload size failure",0) end
 return arr
end
local function _960c514598bb15(data,key)
 for i=1,#data do
  key=_2473e60d4eff20(key)
  local x=bit32.bxor(data[i],bit32.band(bit32.rshift(key,16),255))
  x=(math.floor(x/8)+(x%8)*32)%256
  x=(x-bit32.band(bit32.rshift(key,8),255)+256)%256
  data[i]=bit32.bxor(x,bit32.band(key,255))
 end
 return data
end
local function _bbbc9e9125bbfe(data,expected,integrity)
 local out,n,p={},0,1
 local a,b=1,0
 while p<=#data do
  local tag=data[p];p=p+1
  if tag<128 then
   local count=tag+1
   if p+count-1>#data or n+count>expected then error("Protected literal overflow",0) end
   for j=1,count do local byte=data[p];p=p+1;n=n+1;out[n]=byte;a=(a+byte)%65521;b=(b+a)%65521 end
  else
   if p+1>#data then error("Protected VM opcode invalid",0) end
   local count=tag-128+3
   local off=data[p]+data[p+1]*256;p=p+2
   if off<1 or off>n or n+count>expected then error("Protected VM offset invalid",0) end
   for j=1,count do local byte=out[n-off+1];n=n+1;out[n]=byte;a=(a+byte)%65521;b=(b+a)%65521 end
  end
 end
 if n~=expected or b*65536+a~=integrity then error("Protected block integrity failure",0) end
 local chunks,m={},0
 for j=1,n,256 do m=m+1;chunks[m]=string.char(table.unpack(out,j,math.min(j+255,n))) end
 return table.concat(chunks)
end
local _149578fdcada22={}
local _c4a496349a259d=1003
while _c4a496349a259d~=2317 do
 if _c4a496349a259d==1003 then
  for block=1,#_233fccbe8fa45c do
   local text=_850056d67480f6[_233fccbe8fa45c[block]]
   local count=_a8904019b2f53a[block]
   local bytes=_f65b4166508e05(text,count)
   local packed=_960c514598bb15(bytes,_8212c8f2ba904b[block])
   _149578fdcada22[block]=_bbbc9e9125bbfe(packed,_ce3cd263da6393[block],_a259216f48e4c8[block])
  end
  _c4a496349a259d=2317
 else error("Protected control state invalid",0) end
end
local _551d6716c604a6=table.concat(_149578fdcada22)
if #_551d6716c604a6~=595 then error("Protected length mismatch",0) end
local _09685b474217f2,_342adc469be759=loadstring(_551d6716c604a6,"@scripts/loader.lua")
if type(_09685b474217f2)~="function" then error("MorantxHub Lua compile: "..tostring(_342adc469be759),0) end
return _09685b474217f2(...)
end)(...)
