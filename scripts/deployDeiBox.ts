import { deployDeiBox } from "./deployHelpters";

async function networkDeployDeiBox() {
  console.log("Deploying Dei Box ...");
  let deiBox = await deployDeiBox("0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3");
  console.log("DeiBox Deployed", deiBox.address);
}

networkDeployDeiBox()
  .then(() => process.exit(0))
  .catch(console.log);
