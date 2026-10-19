return (function(...)
local _a3c27f17683dc9={"Q*Tes~<TE!5Hm7lU)I6bqobgvC#(bBbRPa<nhK+!;<sm4tA}!VIF1d94aT/A(3$HKs,NGP!Jk_}WdDEV;IJI!y9I[V6N::)/2RdP`H1{/K,dX5Bh:H8IzU)432uY{GO!(iFs#<@WRiO-K:k~gppNN=f++<Y_L5oQN/P_7,=,$,_LAA-VELCJ)Vvd}q6+I-Gb5|BLQg#P68q?aA.QfVsM92*ut.`Eq/iwV-G(/Y.O8b0Q#2ap}^(Sh@d^O4T$-Vf@r6U{Hn7=A+[eLLFq}OK|g?;I~LUB,a^)Atv5C=gbRfS9kt1.QY{sIPLD<q4~;LrH~w!Q5p#r_y}uB)D)R:2DUq@t^nvB{6a2g_Y_nqvL/O<;Eqf,0/B|+{b(&b{rLJ^TP!%MaD|-Btk/-sBCN1N@D&4C,K;.`7HeT2%_^*3iF$YvJpC;+F7Iu6iqSPad0A-tb`:NFVC6Q0?D2k1.RtODwLT1B*~/4(J9.1|DGKwVO}LLgF}I#QQ6lN5e`Q)UT5MKby}RfkD0$q%g?&y88uiDY!?Kv!Gl+$J|hH0Jyo6L`,$lSE,@oubTe3.N_i(7G-^=aMUv-REJA?:!re}CT;d^w2q8F$AF#RtT8e@OkN<Yw2Tps1DpD7O--#TSX(C?P/;it$H/w}HDV.nBK8vLm+V+P}7P1wFQt0%!#B9Y[+Wk.(5)GGX18w3mEV7;AX-t?$?}D5%.Wkq21ur0rtU8k%*neo^_P:e-$hr{IGhBK.kp4b!Tk,"}
local _f1296d874fa59a={1}
local _62e01eb347ff8b={782110902}
local _65c0dcc5b5503e={957}
local _e3a1b62d79ebef={600}
local _8485a2dd2b1d4c={2455978169}
local _d2eafbd33f8b7e=":u.WS?K<Of;CPV#Ib3N$na`7wtU1!B^T,pL)iDlg5G(~yY}qh%*verJA=06+/sX@zQE2&F_k9H[o4M-R|m{d8"
local _58c2fd79ead607={}
for i=1,#_d2eafbd33f8b7e do _58c2fd79ead607[string.byte(_d2eafbd33f8b7e,i)]=i-1 end
local function _6c4db4f680b02a(s) s=bit32.bxor(s,bit32.lshift(s,13));s=bit32.bxor(s,bit32.rshift(s,17));s=bit32.bxor(s,bit32.lshift(s,5));return s end
local function _3a0e9880cac36d(data,expected)
 local arr,n={},0
 for at=1,#data,5 do
  local width=math.min(5,#data-at+1)
  local value=0
  for d=0,width-1 do local digit=_58c2fd79ead607[string.byte(data,at+d)]; if digit==nil then error("Protected alphabet mismatch",0) end;value=value*85+digit end
  for d=width+1,5 do value=value*85+84 end
  for d=1,width-1 do n=n+1;arr[n]=math.floor(value/2^(8*(4-d)))%256 end
 end
 if n~=expected then error("Protected payload size failure",0) end
 return arr
end
local function _48a51450afc349(data,key)
 for i=1,#data do
  key=_6c4db4f680b02a(key)
  local x=bit32.bxor(data[i],bit32.band(bit32.rshift(key,16),255))
  x=(math.floor(x/8)+(x%8)*32)%256
  x=(x-bit32.band(bit32.rshift(key,8),255)+256)%256
  data[i]=bit32.bxor(x,bit32.band(key,255))
 end
 return data
end
local function _180e915c8e8bfd(data,expected,integrity)
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
local _d672e773d90485={}
local _92a3f93d5d01d0=1043
while _92a3f93d5d01d0~=2852 do
 if _92a3f93d5d01d0==1043 then
  for block=1,#_f1296d874fa59a do
   local text=_a3c27f17683dc9[_f1296d874fa59a[block]]
   local count=_e3a1b62d79ebef[block]
   local bytes=_3a0e9880cac36d(text,count)
   local packed=_48a51450afc349(bytes,_62e01eb347ff8b[block])
   _d672e773d90485[block]=_180e915c8e8bfd(packed,_65c0dcc5b5503e[block],_8485a2dd2b1d4c[block])
  end
  _92a3f93d5d01d0=2852
 else error("Protected control state invalid",0) end
end
local _aae885ddf03c66=table.concat(_d672e773d90485)
if #_aae885ddf03c66~=957 then error("Protected length mismatch",0) end
local _e2a9d9adea1eb9,_9ae6341cd0d6df=loadstring(_aae885ddf03c66,"@scripts/MorantxUI.lua")
if type(_e2a9d9adea1eb9)~="function" then error("MorantxHub Lua compile: "..tostring(_9ae6341cd0d6df),0) end
return _e2a9d9adea1eb9(...)
end)(...)
