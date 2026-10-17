local Z={"AC1LAT591O14k0wT-Jv82sxVHGvZpUolXsfNaiaVHAlqQAR-IeeKrj_CdH6iaysex_JMA-A9V2uPwncpQ5pwLAOS1lY_3ABGMjrDGGxvj_ENwWDloDhvsWyytRg9ePZH38IfxVp6YGkcKsjRmC7LKjrhXiNa6RQWFyfDulaEiLPqWOQrvXs73teqSUNAqmcgpt6OuC7LUl-kSi3y8dwRxE8Gr9bmAW3G0uunnvCE5lGczK_c1NwdQliwHjYdyARTA_8tsR69-zBv22w11Iy27Osmv94FdzmGvlPa1cCQls527NS9npCvrntgfbNcMZpmNlS5t1MA4GgKQYGdNqaeTaInHnoLMPfzr4lzq7H5TJz4AeXzPMk7J6nsZ1Ke3bc2w-PI_mQKws6eNbRodp8t2wbvF6KRDMFSDlkUA-G6TRprVwgFURWMp3ASUmlTPNd6xb5rIpeK7jjkiEX-oggEh06QiQnLj6EnR4wLP0a1FRu20E50FHd2_SAMhX639NYOTJ1dBZKblt0Jr_45GEa1U84PmYGMvhEFwc9THCUbWBJREb_qPhUVLBDgWfZ3c6l1RJlW0gi5_101SSx973KoeorvB17IeYEE-_j4sYVlIJUj-H71XTqVJ2itTg3J1LM4J7D2J30WIQlVF5F9Wl-EVab_XJC9hQ0Ec7uRweyCxwQpEtPRMtfdFPL5Bb6G5LHsVpdzAexQA567a90hwZjUo6bw4palyyCiI5lI_cx5MEhYN7HlvU6jrwlYGBRTTfNyZZ8PaDkI4Eu9ed0o_Q1M3RMfCl"}
local A="XhnwTROMBt1uP5xkEY4vVJz0KU_pQH3mLFIge6fZo7qaSbNcldCGW-Dy2rj9s8Ai"
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
   local Y=(bit32.bxor(X,(170+P*73+math.floor(P/251)*17)%256)-(137+P*19)%256+256)%256
   S=(S+Y)%65521;T=(T+S)%65521
   B[#B+1]=string.char(Y)
   if #B==2048 then C[#C+1]=table.concat(B);B={} end
   N=N%(2^Q)
  end
 end
end
if #B>0 then C[#C+1]=table.concat(B) end
if P~=595 or T*65536+S~=64340908 then error("Corrupt MorantxHub script: scripts/loader.lua",0) end
local F,E=loadstring(table.concat(C))
if not F then error("Compile error in scripts/loader.lua: "..tostring(E),0) end
return F()
