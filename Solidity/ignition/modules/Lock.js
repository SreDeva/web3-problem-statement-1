const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("InsuranceClaimsWithUserAndAdminModule", (m) => {


  const InsuranceClaimsWithUserAndAdmin = m.contract("InsuranceClaimsWithUserAndAdmin");

  
  console.log("InsuranceClaimsWithUserAndAdmin deployed at:", InsuranceClaimsWithUserAndAdmin.address);



  return { InsuranceClaimsWithUserAndAdmin };
});
