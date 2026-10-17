local D=table.concat({"uDzxk7CKMakYpV-5Itti-cxzamKy04PjNJxXhjmBRLbCjt_qCHCImoLf5yP2LUUIWUddxL_ZAlaGlcMVmk1CyMVccKU7da0Kxea3z-TOyNCqGkHUGjPoW0EDRb7JLxvdZFmJqQ1BeI5OaiH69Dt2zi6KR1rIlkoqgcydXUXGUJxcVPmZAKluZOtslu_wrNwNtZx-7zQmWMJpP_6k8cYdCmt5qLWBtsI_0vxgWKJjNg64ZLN_r8bOe3HbuqXnJAWHVZ3oodgfz2uP0EbQikBrEUcxy6UEdZFk8d9tMnkIuO3lqN1fHDxzBY4eT5ghpS9rMNlFOE5YwnPfuwL4vAL0LMo_IiNEjC9xQoJtwrCNmUf4UvI1xImj6YgCYOjcn3Tr4S5PnDEvuqUEWyvpWDuqdBk6lQ7Q43eVmhe_wTQqTySz9d6CI2gdHVoaJuIgHwExiJHe_MoVcJ27z2vDlWP_GtW7CUOskJXAYITTWWSlTStoOcIdwlKSrZQBk7OfMU3DB8vtA9qJi8c3wCBG0yzLWic7DbdR3LoQ6ojuCcPyrmOeg4G2WKGvZbAhLE9TzmbKOVwdrNcKG4eWpKEeDapvRxic6np_aCsRlohvKbEcF5eHdbSyRCaAz3bAvEVsyz4yg_OTkMkdP6vn2xr8-lt458cFewf1iDE2kAe-D_ghxWYOz2lm-XIcwp5GyDe6xgGBbYlWR1TNRF9fuBBcEnQaGIKhLKeHPvY5xRNsAuvqKpLZESB5KbI-cz4tjbF1REluDlgHacZZmnRfUax6LzsOhajicL9kll2rgHyzHPsrvYRFoZYhPdAnxX-9roq7G1M_HUZeJbIOoDNpIJJIZx3xQujuC8xk1UBt0ThgNDJcTam0_H92lcg45SG2SwL6GjQyWMJRNJaWdBk6HHa7gnc2uPDkwTKSMGncMdA-Z8oKrWjO7rOGeIsPiJBa_MALpqFC_tiOrHRRgtWrCfLANJPtTsFFpOvg_2_clWVzJoUEfDc7i7saWZrp20ol_VtjCL92a3VRuG8wCiP4Wy-BoJFmZOjFrO6r5SIbnUExffw7BypLWI0-YVbDrOqew2z--hhoG7h0s4iJpbkfZoaoeHufgrzHHDZY4bRqYfAz8enXsN-2t85AUnc1tTGxBTztdspbYOtQMn7VmSycKl1fJULXM0BCsjm731gtzo2Q5nzI5nyrJzsVB7Rwdapo9LvpjNN0CQCcrFUAaDesNZGwD_pBxVYopONAtE59E3VE1UID9hwnhz05RC9MZFpH7BGQ"})
local A="VLF2BWkNDh6TMPdbRxo9c8p3IzAjZsY_CO-tXQlr4w7v5Kgq1emuHEnSfUJiyG0a"
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
   B[#B+1]=string.char(bit32.bxor(x,(87+p*73+math.floor(p/251)*17)%256))
   if #B==2048 then C[#C+1]=table.concat(B);B={} end
   n=n%(2^b)
  end
 end
end
if #B>0 then C[#C+1]=table.concat(B) end
if p~=957 then error("Corrupt MorantxHub script: scripts/MorantxUI.lua",0) end
local F,E=loadstring(table.concat(C),"@scripts/MorantxUI.lua")
if not F then error(E,0) end
return F()
