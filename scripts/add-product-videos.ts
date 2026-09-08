import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { connectDB } from "../src/lib/db/connect";
import { ProductModel } from "../src/lib/models/Product";
import mongoose from "mongoose";

// media.w3.org sets a third-party cookie with no CORS header, which Chrome blocks outright —
// dropped from rotation after a Lighthouse audit surfaced ERR_BLOCKED_BY_RESPONSE.NotSameOrigin.
const SAMPLE_VIDEOS = [
  "https://www.w3schools.com/html/mov_bbb.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
];

async function main() {
  await connectDB();
  const products = await ProductModel.find({}).sort({ sku: 1 });

  let updated = 0;
  for (let i = 0; i < products.length; i++) {
    const video = i % 5 === 0 ? SAMPLE_VIDEOS[(i / 5) % SAMPLE_VIDEOS.length] : null;
    if (products[i].video !== video) {
      products[i].video = video;
      await products[i].save();
      updated++;
    }
  }

  console.log(`Updated video field on ${updated}/${products.length} products.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
