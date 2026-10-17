local D=table.concat({"xRJOB1l6_3OCFU5IGQBLGK80lcjfxyMnmN68WjDU41iGZ3ECJ8VA57RQ1wAUoJYpWfMBsv8GI2Eibw3wl7kpkgJvm1kTS4fx-M-PSKwC4wPOae0pXZ2jxU16A3NLMzmNSdBa-SgSKl_JvIM7xu1AejArGiQ0edt3uE4Wa7D0cB6C1MuNOUcoNx3ZEAV63BXy97U87yFLCQFu0Y1yNVE9PeEYu5Qoq0YVBgvqvt_d8LLlVqzyh0HUygHKnDJEo40HqioLdCP6-zEfdTrbH84Cfld6g1vX2qJqpNZIPznobD44D5jiLr9-g172CqGfOfntP-Zotlizlctrx9G6CBYxQMF-hk9cVV-hSdweNEiyfD7PUrbvkYcEONFlunE1e2BEP5S2xeNdoZD_nXkZZMI3zx-78Ta0DwznQDoZ5kFxvWKdOGneutqvt0td5Hikicb6o_hQWtK9pGBIunnKtoawapELn2YAaC6lWPKq834IRjaKsKw4DFmmnRJNHke8vQ_fZGXIAVzxsKSMgKQkUwY_gveujXNB4usTentiGBxRloyDjH7UcbuSLLT_-bIw0lsdYwHwlAL4LyhilL2tE-1isMnAT7Br3y4paFJNiIllnL98hUDf6tWR0K3ys84vK2NJCgfqjJdDFXkCIVsP8248-wPBcDusvmlEKYkMW-NBN6QdeVtC-yqFrcxrxgFfm1ksXi2W-GpMS3yXMTmNletDiZO7BN2SSsFtz_E4hdBmzwi-rcLIjHUWmL6wA3ciFC-tS0rCOB8jrF0uip9g_1NsFQLHSl"})
local A="dOEwFAZRuN-PMGzV0Tp8heISJY3tb6s4l2HaDc5rL1XifCQx9KBmo7gyvkjWU_nq"
local M={}
for i=1,#A do M[string.byte(A,i)]=i-1 end
local B,C={},{}
local n,b,p=0,0,0
for i=1,#D do
 local v=M[string.byte(D,i)]
 if v~=nil then
  n=n*64+v;b=b+6
  if b>=8 then
   b=b-8;p=p+1
   local x=math.floor(n/(2^b))%256
   B[#B+1]=string.char(bit32.bxor(x,(135+p*73+math.floor(p/251)*17)%256))
   if #B==2048 then C[#C+1]=table.concat(B);B={} end
   n=n%(2^b)
  end
 end
end
if #B>0 then C[#C+1]=table.concat(B) end
if p~=595 then error("Corrupt MorantxHub script: scripts/loader.lua",0) end
local F,E=loadstring(table.concat(C),"@scripts/loader.lua")
if not F then error(E,0) end
return F()
