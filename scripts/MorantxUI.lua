local Z={"xGiBu57rTVMNwJFy7j573LMYIVfa54Ek0XlcUbsxoAj_MMOKXlt9EmssmJfmC_dycHqTJMX73gf2IhldA0-kLHbO8bEoMmlwXorsXIw0z-4dEIy_KVW-VUBsfd5iT2WEQTBHI8besDUD10ZlgbVUdZ9N6VctuJeZHIJQ4sBkuwv8Wi9uLKHxI3bz189Pk8r0O8IaILV5UztoGuKbXFcjK-dLRjsjQuK08YotW8YQcy-ww8PcT77M80lQxLCpDshfa5eaRBvLs-vLa9Bto_f23ZBK7Ug15v1O2TtL3vVV9ys04k1JMEzmu_1nLGFPbmn0HcjarAZJP79C74f1JPNIHWbNWijLXSkipVVDtndKEI3IUSCDAIyLVd4FP1TtVRKhd4jJhkViqT61Ad7dUyheyPlDuGP2bQDPyb3lMFuY9iAVJaWDk9Hh5PKzWrLnBwPgoMpuFSaGxelpdBW1ZQHeBDo1aJQVFUhdyIubFrBszFoKDbsMzjH1Tvoy6_-HMh66BFObCOT2MDAm5e4zYpQmJ0GDVvxRhXek3WlDCd0fz3tP07oXzzR2uInW4SBfjjBkQGu_m7t_79EUI32rhX_ODjDGr3kBwrOPv8ObmiBJC1uC9lL2VCRwSO3x77g6F0_eOFZ1TrOxOvT0VgiZ628cxYQxggyRC7yoCk5CPqZgPsRsV8y1_v2iU06gqjLnR4O44eU59uYRXu8TUkyALakDug8Y7mZTkou3u8jG0ZUHw4ZRl92f5yhX_TDwhYi_Gm6NfKsrN1Nser383QjDRecuIhmReULZyD1ndNWFD48W9NNZn-IQqGZjnSpwsfAnt9S9J6WAPlfgSAckScWyqw1Gtd1WYNLi6ENzBbhIhMf70W39dbRYFwak7C0wO089_vN5hc6SPh3kSYbZgEIDnn1OEHnutOR3LRyG6c4CUbJY32gskXfHK3sdT2zQ8CI2DfUFpC6fUzalbRbAgcfDvlMl1qpdW_GgwkzBGLzmJqfrrUxogWER4VstfQpDtKuFKBHjNSiZkgoRHFqCi2nEzMhHkX1EcLNyjA7TMfcF6_jxpIm2tRz3vQm9Fl4TguZK_MCAWhSRQfF1Yhe_y0gu1MXrafRJmObo_pe8uNuq0QBBAKI4SR5GqxMKCiTXEZZJwT2QOUXBqT9qcWahNe91opZNpqtG6H5reduark4v7RFdr8WdF9Ee0hNGZ0OLtA6gM4Pu4-XpsFe1f-Gbh9GYQJJ0WiyOP9Ar7vzaY86ye9wqE2Lc-cOVNONNxIOmfubE"}
local A="YUjAzO-uKsCdZ2hvkewFSVI5r7WJiP8391RmgEQGcb_q0LTynDHfoltBpxaMN6X4"
local M={}
for i=1,#A do M[string.byte(A,i)]=i-1 end
local D=table.concat(Z)
local B,C={},{}
local N,Q,P=0,0,0
local S,T=1,0
for i=1,#D do
 local V=M[string.byte(D,i)]
 if V~=nil then
  N=N*64+V;Q=Q+6
  if Q>=8 then
   Q=Q-8;P=P+1
   local X=math.floor(N/(2^Q))%256
   local Y=(bit32.bxor(X,(114+P*73+math.floor(P/251)*17)%256)-(222+P*19)%256+256)%256
   S=(S+Y)%65521;T=(T+S)%65521
   B[#B+1]=string.char(Y)
   if #B==2048 then C[#C+1]=table.concat(B);B={} end
   N=N%(2^Q)
  end
 end
end
if #B>0 then C[#C+1]=table.concat(B) end
if P~=957 or T*65536+S~=2455978169 then error("Corrupt MorantxHub script: scripts/MorantxUI.lua",0) end
local F,E=loadstring(table.concat(C))
if not F then error("Compile error in scripts/MorantxUI.lua: "..tostring(E),0) end
return F()
