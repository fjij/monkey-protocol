import { Web3Storage, File } from 'web3.storage'
import { config } from "dotenv";
import fs from "fs-extra";
import { getAllFilesSync } from "get-all-files";
import path from "path";
config();

function readDirectory(dir: string): File[] {
  const names = getAllFilesSync(dir).toArray().map((name) => name.substring(dir.length));
  return names.map(
    (name) =>
      new File([fs.readFileSync(path.join(dir, name)) as BlobPart], name)
  );
}

(async () => {
  // Construct with token and endpoint
  const client = new Web3Storage({ token: process.env.WEB3_STORAGE_API_TOKEN! })

  // Pack files into a CAR and send to web3.storage
  const rootCid = await client.put(readDirectory(path.join(__dirname, "../../frontend/build")))

  console.log("rootCid:", rootCid);

  // Get info on the Filecoin deals that the CID is stored in
  const info = await client.status(rootCid) // Promise<Status | undefined>

  console.log("info:", info);
})();
