async function main() {
  const CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
  console.log("Deploying CertificateRegistry...");
  
  const certificateRegistry = await CertificateRegistry.deploy();
  await certificateRegistry.waitForDeployment();
  
  const contractAddress = await certificateRegistry.getAddress();
  console.log("CertificateRegistry deployed to:", contractAddress);
  
  // Save contract address
  const fs = require("fs");
  const config = {
    contractAddress: contractAddress,
    network: "sepolia",
    deploymentTime: new Date().toISOString()
  };
  
  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(config, null, 2)
  );
  
  console.log("Deployment config saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
