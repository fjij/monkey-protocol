import { NFTStorage, File } from "nft.storage";
import fs from "fs-extra";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.NFT_STORAGE_API_KEY;

if (!apiKey) {
  throw new Error("Missing environment variable NFT_STORAGE_API_KEY");
}

function readDirectory(dir: string): File[] {
  const names = fs.readdirSync(dir);
  return names.map(
    (name) =>
      new File([fs.readFileSync(path.join(dir, name)) as BlobPart], name)
  );
}

async function main() {
  const client = new NFTStorage({ token: apiKey! });

  const images = readDirectory(path.join(__dirname, "../assets"));
  console.log(images);
  const imageMetadata = await client.storeDirectory(images);
  console.log("hi");
  console.log("Images uploaded to: ", imageMetadata);

  const monkeyFiles = readDirectory(path.join(__dirname, "../metadata"));
  const monkeyFilesModified = await Promise.all(
    monkeyFiles.map(async (file) => {
      const obj = JSON.parse(await file.text());
      obj.image = `ipfs://${imageMetadata.toString()}/${obj.image}`;
      return new File([JSON.stringify(obj)], file.name);
    })
  );
  const fileMetadata = await client.storeDirectory(monkeyFilesModified);
  console.log("Files uploaded to: ", fileMetadata);

  const locationPath = path.join(__dirname, "../../location.json");
  fs.writeFileSync(
    locationPath,
    JSON.stringify(
      {
        images: imageMetadata.toString(),
        metadata: fileMetadata.toString(),
        count: monkeyFiles.length,
      },
      null,
      2
    )
  );
  console.log("monkey locations saved to: ", locationPath);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
