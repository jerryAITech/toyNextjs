import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { connectDB } from "../src/lib/db/connect";
import { UserModel } from "../src/lib/models/User";
import { AddressModel } from "../src/lib/models/Address";
import { CategoryModel } from "../src/lib/models/Category";
import { ProductModel } from "../src/lib/models/Product";
import { BannerModel } from "../src/lib/models/Banner";
import { CouponModel } from "../src/lib/models/Coupon";
import { OrderModel } from "../src/lib/models/Order";
import { PaymentModel } from "../src/lib/models/Payment";
import { ReviewModel } from "../src/lib/models/Review";
import { SettingsModel } from "../src/lib/models/Settings";
import { CartModel } from "../src/lib/models/Cart";
import { WishlistModel } from "../src/lib/models/Wishlist";
import { hashPassword } from "../src/lib/auth/password";
import { slugify } from "../src/lib/utils/slugify";
import mongoose from "mongoose";
import crypto from "crypto";

// Real, topic-relevant stock photos (via LoremFlickr's tag search) instead of random
// unrelated placeholder images. `lock` pins a specific photo so re-running the seed
// script or reloading a page always shows the same image for the same product.
//
// LoremFlickr occasionally falls back to the same generic filler photo for tags/locks
// it can't confidently match, which would otherwise show the identical image on several
// unrelated products. `resolveImage` downloads and hashes each candidate and skips ahead
// to a different lock whenever it collides with an image already used elsewhere in this
// seed run, so every product ends up with a genuinely distinct photo.
const usedImageHashes = new Set<string>();

// Short, freely-licensed sample clips used as stand-in product videos (no real per-product
// footage exists for a seeded demo catalog). Rotated across ~1 in 5 products so the "Explore"
// reels feed has real <video> playback to show off rather than a single repeated clip.
// Every URL here must serve without a third-party cookie and either no CORS header or a
// permissive one — media.w3.org used to be in this list but sets a Cloudflare bot-management
// cookie with no Access-Control-Allow-Origin, which Chrome blocks outright (confirmed via a
// Lighthouse audit surfacing ERR_BLOCKED_BY_RESPONSE.NotSameOrigin on its product page).
const SAMPLE_VIDEOS = [
  "https://www.w3schools.com/html/mov_bbb.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
];

function img(tags: string, lock: number, w = 800, h = 800) {
  return `https://loremflickr.com/${w}/${h}/${encodeURIComponent(tags)}?lock=${lock}`;
}

async function resolveImage(tags: string, lock: number, w = 800, h = 800, attempt = 0): Promise<string> {
  const url = img(tags, lock, w, h);

  if (attempt >= 6) {
    console.warn(`  (image dedup gave up after ${attempt} attempts for "${tags}", keeping lock=${lock})`);
    return url;
  }

  try {
    const res = await fetch(url);
    const buf = Buffer.from(await res.arrayBuffer());
    const hash = crypto.createHash("md5").update(buf).digest("hex");

    if (usedImageHashes.has(hash)) {
      return resolveImage(tags, lock + 977, w, h, attempt + 1);
    }
    usedImageHashes.add(hash);
    return url;
  } catch {
    // Network hiccup — fall back to the plain URL rather than failing the whole seed.
    return url;
  }
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randomBetween(0, arr.length - 1)];
}

async function main() {
  await connectDB();
  console.log("Connected to MongoDB. Wiping existing data...");

  await Promise.all([
    UserModel.deleteMany({}),
    AddressModel.deleteMany({}),
    CategoryModel.deleteMany({}),
    ProductModel.deleteMany({}),
    BannerModel.deleteMany({}),
    CouponModel.deleteMany({}),
    OrderModel.deleteMany({}),
    PaymentModel.deleteMany({}),
    ReviewModel.deleteMany({}),
    SettingsModel.deleteMany({}),
    CartModel.deleteMany({}),
    WishlistModel.deleteMany({}),
  ]);

  // ---------- Settings ----------
  await SettingsModel.create({
    key: "singleton",
    storeName: "ToyStore",
    contactEmail: "support@toystore.dev",
    contactPhone: "+91 90000 00000",
    address: "4th Floor, Prestige Tech Park, Bengaluru, Karnataka 560103",
    currency: "INR",
    codEnabled: true,
    codMaxOrderAmount: 20000,
    razorpayEnabled: true,
    shippingFee: 49,
    freeShippingThreshold: 999,
    cancellationWindowStatus: "PACKED",
    lowStockThreshold: 5,
  });
  console.log("Settings created.");

  // ---------- Categories ----------
  const categoryDefs = [
    { name: "Baby Toys", tagline: "Safe • Soft • Sensory", desc: "Gentle, soft, sensory-friendly toys designed for babies and infants.", imgTag: "babytoys" },
    { name: "Educational Toys", tagline: "Learn • Build • Grow", desc: "STEM kits, learning games and creative toys that make learning fun.", imgTag: "kids,learning" },
    { name: "Action Figures", tagline: "Heroes in Your Hands", desc: "Superheroes, warriors and collectible action figures for epic adventures.", imgTag: "toy,superhero" },
    { name: "Cars & Vehicles", tagline: "Drive the Fun", desc: "Die-cast cars, trucks, trains and remote-control vehicles.", imgTag: "toy,car" },
    { name: "Dolls", tagline: "Best Friends Forever", desc: "Fashion dolls, baby dolls and doll houses for imaginative play.", imgTag: "doll,toy" },
    { name: "Building Blocks", tagline: "Build Big Dreams", desc: "Interlocking blocks and construction sets to build anything imaginable.", imgTag: "lego" },
    { name: "Puzzles", tagline: "Think • Solve • Grow", desc: "Jigsaw puzzles and brain teasers for all ages.", imgTag: "jigsaw,puzzle" },
    { name: "Outdoor Toys", tagline: "Play Outside", desc: "Bikes, balls, and outdoor play equipment for active fun.", imgTag: "kids,bicycle" },
    { name: "Board Games", tagline: "Fun with Family", desc: "Classic and modern board games for family game night.", imgTag: "boardgame" },
    { name: "Soft Toys", tagline: "Cuddle Happiness", desc: "Plush toys and stuffed animals to cuddle and love.", imgTag: "teddybear,plush" },
    { name: "Remote Control Toys", tagline: "Control the Fun", desc: "RC cars, drones and robots for hands-on excitement.", imgTag: "drone,toy" },
    { name: "Pretend Play", tagline: "Imagine • Create • Grow", desc: "Kitchen sets, tool sets and dress-up costumes for imaginative play.", imgTag: "dressup,kids" },
  ];

  console.log("Resolving category images...");
  const categories = [];
  for (let i = 0; i < categoryDefs.length; i++) {
    const c = categoryDefs[i];
    const image = await resolveImage(c.imgTag, i + 1, 600, 600);
    categories.push(
      await CategoryModel.create({
        name: c.name,
        slug: slugify(c.name),
        description: c.desc,
        tagline: c.tagline,
        image,
        displayOrder: i,
        seoTitle: `${c.name} | ToyStore`,
        metaDescription: c.desc,
        status: "ACTIVE",
      })
    );
  }
  console.log(`${categories.length} categories created.`);

  const catByName = Object.fromEntries(categories.map((c) => [c.name, c]));

  // ---------- Products ----------
  const AGE_GROUPS = ["0-2", "3-5", "6-8", "9-12", "13+"] as const;
  const BRANDS = ["ToyStore", "PlaySmart", "KidLoop", "FunCraft", "TinyTribe", "BrightBlox"];

  type ProductDef = {
    name: string;
    category: string;
    ageGroup: (typeof AGE_GROUPS)[number];
    price: number;
    mrp: number;
    desc: string;
    imgTag: string;
  };

  const productDefs: ProductDef[] = [
    // Baby Toys
    { name: "Soft Rattle Teether Set", category: "Baby Toys", ageGroup: "0-2", price: 399, mrp: 599, desc: "A set of soft, BPA-free rattles and teethers to soothe and stimulate your baby's senses.", imgTag: "baby,rattle" },
    { name: "Musical Activity Cube", category: "Baby Toys", ageGroup: "0-2", price: 899, mrp: 1299, desc: "A colorful activity cube with lights, sounds and textures to encourage early development.", imgTag: "baby,toy" },
    { name: "Stacking Rings Tower", category: "Baby Toys", ageGroup: "0-2", price: 349, mrp: 499, desc: "Classic stacking rings that help babies develop hand-eye coordination and color recognition.", imgTag: "toy,rings" },
    { name: "Soft Plush Baby Gym", category: "Baby Toys", ageGroup: "0-2", price: 1199, mrp: 1699, desc: "A padded play gym with hanging toys and mirrors for tummy-time fun.", imgTag: "baby,playmat" },
    { name: "Wooden Push Walker", category: "Baby Toys", ageGroup: "0-2", price: 1599, mrp: 2199, desc: "A sturdy wooden push-along walker that supports baby's first steps.", imgTag: "baby,walker" },

    // Educational Toys
    { name: "Alphabet Learning Tablet", category: "Educational Toys", ageGroup: "3-5", price: 799, mrp: 1199, desc: "An interactive tablet that teaches letters, numbers and basic words through fun games.", imgTag: "tablet,kids" },
    { name: "STEM Circuit Building Kit", category: "Educational Toys", ageGroup: "6-8", price: 1499, mrp: 1999, desc: "Build simple circuits and learn the basics of electronics with this hands-on STEM kit.", imgTag: "electronics,kit" },
    { name: "Magnetic Letters & Numbers Board", category: "Educational Toys", ageGroup: "3-5", price: 599, mrp: 899, desc: "A magnetic whiteboard with colorful letters and numbers for early literacy and numeracy.", imgTag: "alphabet,letters" },
    { name: "World Explorer Globe", category: "Educational Toys", ageGroup: "9-12", price: 1299, mrp: 1799, desc: "An interactive talking globe that teaches geography, capitals and fun facts.", imgTag: "globe,world" },
    { name: "Coding Robot for Kids", category: "Educational Toys", ageGroup: "6-8", price: 2499, mrp: 3299, desc: "A screen-free programmable robot that teaches the basics of coding logic.", imgTag: "robot,toy" },

    // Action Figures
    { name: "Galaxy Guardian Action Figure", category: "Action Figures", ageGroup: "6-8", price: 599, mrp: 899, desc: "An articulated 12-inch action figure with 15 points of movement and accessories.", imgTag: "toy,superhero" },
    { name: "Mighty Dino Warrior", category: "Action Figures", ageGroup: "6-8", price: 449, mrp: 699, desc: "A poseable dinosaur-warrior hybrid figure with glow-in-the-dark features.", imgTag: "dinosaur,toy" },
    { name: "Superhero Squad 5-Pack", category: "Action Figures", ageGroup: "3-5", price: 999, mrp: 1499, desc: "A set of five collectible superhero figures, perfect for imaginative team-ups.", imgTag: "superhero,toy" },
    { name: "Ninja Warrior Figure Set", category: "Action Figures", ageGroup: "6-8", price: 799, mrp: 1199, desc: "A set of three ninja warrior figures with weapons and stealth accessories.", imgTag: "ninja,toy" },
    { name: "Space Ranger Figure", category: "Action Figures", ageGroup: "6-8", price: 549, mrp: 799, desc: "A detailed space ranger figure with helmet lights and a blaster accessory.", imgTag: "astronaut,toy" },

    // Cars & Vehicles
    { name: "Remote Control Racing Car", category: "Cars & Vehicles", ageGroup: "6-8", price: 1999, mrp: 2999, desc: "A high-speed remote control racing car with rechargeable battery and rugged tires.", imgTag: "toy,car" },
    { name: "Die-Cast Vehicle Collection", category: "Cars & Vehicles", ageGroup: "3-5", price: 699, mrp: 999, desc: "A set of six die-cast metal vehicles including cars, trucks and a bus.", imgTag: "diecast,car" },
    { name: "Express Train Track Set", category: "Cars & Vehicles", ageGroup: "3-5", price: 1799, mrp: 2499, desc: "A 100-piece wooden train track set compatible with all major train toy brands.", imgTag: "toy,train" },
    { name: "Construction Truck Set", category: "Cars & Vehicles", ageGroup: "3-5", price: 899, mrp: 1299, desc: "A set of durable construction vehicles including a bulldozer, crane and dump truck.", imgTag: "truck,toy" },
    { name: "Monster Truck Toy", category: "Cars & Vehicles", ageGroup: "6-8", price: 1099, mrp: 1599, desc: "An oversized monster truck with big grip tires built for backyard stunts.", imgTag: "monster,truck" },

    // Dolls
    { name: "Fashionista Doll House", category: "Dolls", ageGroup: "6-8", price: 2499, mrp: 3499, desc: "A three-story doll house with furniture, lights and accessories for hours of play.", imgTag: "doll,house" },
    { name: "Baby Care Doll Set", category: "Dolls", ageGroup: "3-5", price: 1199, mrp: 1699, desc: "A realistic baby doll with feeding and care accessories to nurture imaginative play.", imgTag: "baby,doll" },
    { name: "Princess Fashion Doll", category: "Dolls", ageGroup: "3-5", price: 599, mrp: 899, desc: "An elegant fashion doll with interchangeable outfits and accessories.", imgTag: "doll,princess" },
    { name: "Twin Baby Dolls Set", category: "Dolls", ageGroup: "3-5", price: 1399, mrp: 1899, desc: "A set of two soft-bodied twin baby dolls with matching outfits.", imgTag: "baby,dolls" },
    { name: "Ballerina Doll", category: "Dolls", ageGroup: "3-5", price: 649, mrp: 949, desc: "A graceful ballerina doll with a spinning music-box stand.", imgTag: "ballerina,doll" },

    // Building Blocks
    { name: "Mega Blocks Builder Set", category: "Building Blocks", ageGroup: "3-5", price: 1299, mrp: 1799, desc: "A 250-piece building block set compatible with all major interlocking brick brands.", imgTag: "lego" },
    { name: "Robot Building Blocks Kit", category: "Building Blocks", ageGroup: "6-8", price: 1599, mrp: 2199, desc: "Build your own robot with this motorized building block kit with LED lights.", imgTag: "lego" },
    { name: "Castle Adventure Block Set", category: "Building Blocks", ageGroup: "6-8", price: 1899, mrp: 2599, desc: "A 500-piece medieval castle building set with knights and dragon figures.", imgTag: "lego" },
    { name: "City Builder Block Set", category: "Building Blocks", ageGroup: "6-8", price: 2199, mrp: 2999, desc: "Build a bustling mini city with roads, buildings and vehicles.", imgTag: "lego" },
    { name: "Space Station Building Kit", category: "Building Blocks", ageGroup: "9-12", price: 2599, mrp: 3499, desc: "A detailed space station building kit with astronaut minifigures.", imgTag: "lego" },

    // Puzzles
    { name: "Wooden Animal Jigsaw Puzzle", category: "Puzzles", ageGroup: "0-2", price: 349, mrp: 499, desc: "A chunky wooden jigsaw puzzle featuring colorful farm animals.", imgTag: "puzzle,animal" },
    { name: "500-Piece Landscape Puzzle", category: "Puzzles", ageGroup: "9-12", price: 449, mrp: 699, desc: "A beautiful 500-piece jigsaw puzzle of a scenic mountain landscape.", imgTag: "puzzle,landscape" },
    { name: "3D Brain Teaser Cube", category: "Puzzles", ageGroup: "9-12", price: 299, mrp: 449, desc: "A twisty 3D puzzle cube that challenges logic and spatial reasoning.", imgTag: "puzzle,cube" },
    { name: "Dinosaur Floor Puzzle", category: "Puzzles", ageGroup: "3-5", price: 399, mrp: 599, desc: "An extra-large floor puzzle featuring friendly dinosaurs, great for group play.", imgTag: "puzzle,dinosaur" },
    { name: "Magnetic Travel Puzzle", category: "Puzzles", ageGroup: "6-8", price: 449, mrp: 649, desc: "A compact magnetic puzzle case perfect for road trips and travel.", imgTag: "puzzle,travel" },

    // Outdoor Toys
    { name: "Kids Bicycle 16-inch", category: "Outdoor Toys", ageGroup: "6-8", price: 4999, mrp: 6499, desc: "A sturdy 16-inch bicycle with training wheels and adjustable seat.", imgTag: "kids,bicycle" },
    { name: "Trampoline with Safety Net", category: "Outdoor Toys", ageGroup: "6-8", price: 8999, mrp: 11999, desc: "A 10-foot outdoor trampoline with enclosure net for safe backyard bouncing.", imgTag: "trampoline,kids" },
    { name: "Bubble Blaster Gun", category: "Outdoor Toys", ageGroup: "3-5", price: 399, mrp: 599, desc: "An automatic bubble blaster that fills the yard with hundreds of bubbles.", imgTag: "bubbles,toy" },
    { name: "Water Sprinkler Play Mat", category: "Outdoor Toys", ageGroup: "3-5", price: 899, mrp: 1299, desc: "A splash pad sprinkler mat that keeps kids cool and active outdoors.", imgTag: "sprinkler,kids" },
    { name: "Kids Scooter", category: "Outdoor Toys", ageGroup: "6-8", price: 1999, mrp: 2799, desc: "A 3-wheel foldable scooter with adjustable height and LED wheels.", imgTag: "kids,scooter" },

    // Board Games
    { name: "Family Trivia Board Game", category: "Board Games", ageGroup: "9-12", price: 799, mrp: 1099, desc: "A fun trivia board game with questions for the whole family to enjoy together.", imgTag: "boardgame" },
    { name: "Snakes & Ladders Deluxe", category: "Board Games", ageGroup: "3-5", price: 349, mrp: 499, desc: "A deluxe wooden edition of the timeless classic Snakes & Ladders.", imgTag: "boardgame,dice" },
    { name: "Strategy Chess Set", category: "Board Games", ageGroup: "9-12", price: 999, mrp: 1399, desc: "A wooden chess set with felt-lined storage for pieces, perfect for beginners.", imgTag: "chess" },
    { name: "Ludo & Carrom Combo", category: "Board Games", ageGroup: "6-8", price: 899, mrp: 1299, desc: "A 2-in-1 wooden Ludo and Carrom board for classic family game nights.", imgTag: "boardgame,family" },
    { name: "Memory Match Card Game", category: "Board Games", ageGroup: "3-5", price: 249, mrp: 399, desc: "A colorful memory-matching card game that builds focus and recall.", imgTag: "cards,game" },

    // Soft Toys
    { name: "Giant Teddy Bear 3ft", category: "Soft Toys", ageGroup: "0-2", price: 1499, mrp: 2199, desc: "A huggable 3-foot teddy bear made from ultra-soft, hypoallergenic fabric.", imgTag: "teddybear" },
    { name: "Plush Unicorn Pillow", category: "Soft Toys", ageGroup: "3-5", price: 699, mrp: 999, desc: "A soft plush unicorn that doubles as a cuddly pillow for nap time.", imgTag: "unicorn,plush" },
    { name: "Animal Friends Plush Set", category: "Soft Toys", ageGroup: "0-2", price: 899, mrp: 1299, desc: "A set of four adorable plush animal friends, safe for babies and toddlers.", imgTag: "plush,animal" },
    { name: "Cuddly Elephant Plush", category: "Soft Toys", ageGroup: "0-2", price: 749, mrp: 1099, desc: "An oversized, super-soft elephant plush perfect for cuddling and naps.", imgTag: "elephant,plush" },
    { name: "Soft Baby Blanket Toy", category: "Soft Toys", ageGroup: "0-2", price: 599, mrp: 849, desc: "A plush security blanket with an attached soft toy head, safe from birth.", imgTag: "baby,blanket" },

    // Remote Control Toys
    { name: "Aerial Stunt Drone", category: "Remote Control Toys", ageGroup: "9-12", price: 2999, mrp: 3999, desc: "A beginner-friendly stunt drone with HD camera and one-touch flips.", imgTag: "drone,toy" },
    { name: "RC Robot Explorer", category: "Remote Control Toys", ageGroup: "6-8", price: 1799, mrp: 2499, desc: "A remote control robot that walks, talks and dances with light-up eyes.", imgTag: "robot,toy" },
    { name: "RC Monster Truck", category: "Remote Control Toys", ageGroup: "9-12", price: 2799, mrp: 3699, desc: "An all-terrain remote control monster truck with shock-absorbing suspension.", imgTag: "monster,truck" },
    { name: "RC Helicopter", category: "Remote Control Toys", ageGroup: "9-12", price: 1999, mrp: 2699, desc: "A stable indoor RC helicopter with gyroscopic balance for easy flying.", imgTag: "helicopter,toy" },
    { name: "RC Speed Boat", category: "Remote Control Toys", ageGroup: "9-12", price: 2299, mrp: 3099, desc: "A fast, waterproof remote control speed boat for pool and lake play.", imgTag: "toy,boat" },

    // Pretend Play
    { name: "Kids Kitchen Playset", category: "Pretend Play", ageGroup: "3-5", price: 2199, mrp: 2999, desc: "A realistic kitchen playset with sounds, lights and play food accessories.", imgTag: "kitchen" },
    { name: "Doctor Role Play Kit", category: "Pretend Play", ageGroup: "3-5", price: 599, mrp: 899, desc: "A complete doctor kit with stethoscope and tools for imaginative healthcare play.", imgTag: "doctor,toy" },
    { name: "Builder Tool Bench Set", category: "Pretend Play", ageGroup: "3-5", price: 1399, mrp: 1899, desc: "A pretend workbench with tools and accessories for little builders.", imgTag: "tools,toy" },
    { name: "Supermarket Cash Register Set", category: "Pretend Play", ageGroup: "3-5", price: 1099, mrp: 1599, desc: "A play cash register with scanner sounds and pretend groceries.", imgTag: "grocery,toy" },
    { name: "Vet Clinic Playset", category: "Pretend Play", ageGroup: "3-5", price: 1299, mrp: 1799, desc: "A veterinary clinic playset with a plush pet patient and care tools.", imgTag: "vet,toy" },
  ];

  console.log("Resolving product images (this takes a few minutes)...");
  const products = [];
  for (let i = 0; i < productDefs.length; i++) {
    const p = productDefs[i];
    const category = catByName[p.category];
    const slug = slugify(p.name);
    const brand = pick(BRANDS);

    const image1 = await resolveImage(p.imgTag, i * 10 + 1);
    const image2 = await resolveImage(p.imgTag, i * 10 + 2);
    const image3 = await resolveImage(p.imgTag, i * 10 + 3);
    if ((i + 1) % 10 === 0) console.log(`  ...${i + 1}/${productDefs.length} products`);

    const product = await ProductModel.create({
      name: p.name,
      slug,
      sku: `TS-${(i + 1).toString().padStart(4, "0")}`,
      brand,
      category: category._id,
      price: p.price,
      mrp: p.mrp,
      stock: randomBetween(0, 60),
      lowStockThreshold: 5,
      ageGroup: p.ageGroup,
      description: p.desc,
      highlights: ["Premium quality materials", "Safety tested & certified", "Encourages creativity and skill development", "Makes a perfect gift"],
      specifications: [
        { key: "Material", value: "Non-toxic ABS plastic" },
        { key: "Recommended Age", value: p.ageGroup + " years" },
        { key: "Batteries Required", value: i % 4 === 0 ? "Yes (2x AA, included)" : "No" },
      ],
      material: "Non-toxic ABS plastic",
      dimensions: `${randomBetween(15, 40)}cm x ${randomBetween(10, 30)}cm x ${randomBetween(5, 20)}cm`,
      safetyInformation: "Complies with international toy safety standards. Adult supervision recommended for children under 3.",
      whatsIncluded: ["1x " + p.name, "Instruction manual", "Warranty card"],
      manufacturer: brand,
      images: [image1, image2, image3],
      video: i % 5 === 0 ? SAMPLE_VIDEOS[(i / 5) % SAMPLE_VIDEOS.length] : null,
      seoTitle: `Buy ${p.name} Online | ToyStore`,
      metaDescription: p.desc,
      keywords: [p.name, p.category, brand, "toys for kids", "buy toys online"],
      ogImage: image1,
      codAvailable: true,
      status: "ACTIVE",
      isFeatured: i % 5 === 0,
      isBestSeller: i % 4 === 0,
      isTrending: i % 6 === 0,
      isNewArrival: i % 3 === 0,
    });
    products.push(product);
  }
  console.log(`${products.length} products created.`);

  // ---------- Users ----------
  const adminEmail = process.env.ADMIN_SEED_EMAIL || "admin@toystore.dev";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || "Admin@12345";

  const admin = await UserModel.create({
    name: "Store Admin",
    email: adminEmail,
    mobile: "9000000001",
    password: await hashPassword(adminPassword),
    role: "ADMIN",
    status: "ACTIVE",
  });

  const customerDefs = [
    { name: "Aarav Sharma", email: "aarav@example.com" },
    { name: "Diya Patel", email: "diya@example.com" },
    { name: "Rohan Mehta", email: "rohan@example.com" },
    { name: "Ananya Iyer", email: "ananya@example.com" },
  ];
  const customerPassword = "Customer@123";
  const hashedCustomerPassword = await hashPassword(customerPassword);

  const customers = await Promise.all(
    customerDefs.map((c, i) =>
      UserModel.create({
        name: c.name,
        email: c.email,
        mobile: `900000000${i + 2}`,
        password: hashedCustomerPassword,
        role: "USER",
        status: "ACTIVE",
      })
    )
  );
  console.log(`Admin + ${customers.length} customers created.`);

  const cities = [
    { city: "Bengaluru", state: "Karnataka", pincode: "560103" },
    { city: "Mumbai", state: "Maharashtra", pincode: "400001" },
    { city: "Delhi", state: "Delhi", pincode: "110001" },
    { city: "Pune", state: "Maharashtra", pincode: "411001" },
  ];

  const addresses = await Promise.all(
    customers.map((c, i) =>
      AddressModel.create({
        userId: c._id,
        fullName: c.name,
        mobile: c.mobile,
        house: `${randomBetween(1, 200)}, Green Park Apartments`,
        street: "MG Road",
        area: "Central Area",
        city: cities[i].city,
        state: cities[i].state,
        pincode: cities[i].pincode,
        landmark: "Near City Mall",
        type: "HOME",
        isDefault: true,
      })
    )
  );
  console.log(`${addresses.length} addresses created.`);

  // ---------- Coupons ----------
  const now = new Date();
  const future = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 60);

  await CouponModel.create([
    {
      code: "WELCOME10",
      description: "10% off on your first order",
      type: "PERCENTAGE",
      value: 10,
      minimumCartValue: 0,
      maximumDiscount: 200,
      firstOrderOnly: true,
      perUserLimit: 1,
      status: "ACTIVE",
    },
    {
      code: "FLAT200",
      description: "Flat ₹200 off on orders above ₹999",
      type: "FIXED",
      value: 200,
      minimumCartValue: 999,
      perUserLimit: 2,
      status: "ACTIVE",
    },
    {
      code: "TOY20",
      description: "20% off on orders above ₹1500",
      type: "PERCENTAGE",
      value: 20,
      minimumCartValue: 1500,
      maximumDiscount: 500,
      perUserLimit: 3,
      status: "ACTIVE",
    },
    {
      code: "KIDS50",
      description: "Flat ₹50 off, no minimum",
      type: "FIXED",
      value: 50,
      minimumCartValue: 0,
      perUserLimit: 5,
      status: "ACTIVE",
    },
    {
      code: "FESTIVE15",
      description: "Festive season special - 15% off",
      type: "PERCENTAGE",
      value: 15,
      minimumCartValue: 2000,
      maximumDiscount: 1000,
      startDate: now,
      endDate: future,
      perUserLimit: 1,
      status: "ACTIVE",
    },
  ]);
  console.log("5 coupons created.");

  // ---------- Homepage Banners ----------
  const homeBannerDefs = [
    { title: "Big Dreams Start with Toys", subtitle: "Up to 50% Off on Educational Toys", cta: "Shop Now", productSlug: productDefs[3].name, imgTag: "toys,educational" },
    { title: "New Arrivals Are Here", subtitle: "Discover the latest additions to our toy universe", cta: "Explore New Arrivals", categoryName: "Action Figures", imgTag: "toy,superhero" },
    { title: "Outdoor Fun Awaits", subtitle: "Bikes, trampolines & more for active kids", cta: "Shop Outdoor Toys", categoryName: "Outdoor Toys", imgTag: "kids,bicycle" },
    { title: "Build. Create. Imagine.", subtitle: "Explore our building blocks collection", cta: "Shop Building Blocks", categoryName: "Building Blocks", imgTag: "lego" },
  ];

  console.log("Resolving homepage banner images...");
  for (let i = 0; i < homeBannerDefs.length; i++) {
    const b = homeBannerDefs[i];
    const desktopImage = await resolveImage(b.imgTag, i * 10 + 1, 1600, 500);
    const mobileImage = await resolveImage(b.imgTag, i * 10 + 2, 800, 900);
    await BannerModel.create({
      type: "HOME",
      title: b.title,
      subtitle: b.subtitle,
      desktopImage,
      mobileImage,
      ctaText: b.cta,
      linkType: b.categoryName ? "CATEGORY" : "PRODUCT",
      linkedCategoryId: b.categoryName ? catByName[b.categoryName]._id : null,
      productId: b.productSlug ? products.find((p) => p.name === b.productSlug)?._id : null,
      priority: homeBannerDefs.length - i,
      status: "ACTIVE",
    });
  }
  console.log(`${homeBannerDefs.length} homepage banners created.`);

  // ---------- Category Banners ----------
  console.log("Resolving category banner images...");
  const categoryBannerTargets = ["Educational Toys", "Cars & Vehicles", "Dolls", "Action Figures", "Soft Toys", "Board Games"];
  const categoryDefByName = Object.fromEntries(categoryDefs.map((c) => [c.name, c]));
  for (let i = 0; i < categoryBannerTargets.length; i++) {
    const catName = categoryBannerTargets[i];
    const category = catByName[catName];
    const imgTag = categoryDefByName[catName].imgTag;
    const desktopImage = await resolveImage(imgTag, i * 10 + 21, 1600, 500);
    const mobileImage = await resolveImage(imgTag, i * 10 + 22, 800, 900);
    await BannerModel.create({
      type: "CATEGORY",
      categoryId: category._id,
      title: category.name,
      subtitle: category.tagline,
      desktopImage,
      mobileImage,
      ctaText: "Shop Now",
      linkType: "NONE",
      priority: 1,
      status: "ACTIVE",
    });
  }
  console.log(`${categoryBannerTargets.length} category banners created.`);

  // ---------- Orders ----------
  const orderStatusPlan: { status: string; paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED"; paymentMethod: "COD" | "RAZORPAY" }[] = [
    { status: "DELIVERED", paymentStatus: "PAID", paymentMethod: "RAZORPAY" },
    { status: "DELIVERED", paymentStatus: "PAID", paymentMethod: "COD" },
    { status: "DELIVERED", paymentStatus: "PAID", paymentMethod: "RAZORPAY" },
    { status: "SHIPPED", paymentStatus: "PAID", paymentMethod: "RAZORPAY" },
    { status: "OUT_FOR_DELIVERY", paymentStatus: "PENDING", paymentMethod: "COD" },
    { status: "PACKED", paymentStatus: "PAID", paymentMethod: "RAZORPAY" },
    { status: "PROCESSING", paymentStatus: "PENDING", paymentMethod: "COD" },
    { status: "CONFIRMED", paymentStatus: "PENDING", paymentMethod: "COD" },
    { status: "CANCELLED", paymentStatus: "REFUNDED", paymentMethod: "RAZORPAY" },
    { status: "PAYMENT_FAILED", paymentStatus: "FAILED", paymentMethod: "RAZORPAY" },
  ];

  const createdOrders: Array<InstanceType<typeof OrderModel>> = [];

  for (let i = 0; i < orderStatusPlan.length; i++) {
    const plan = orderStatusPlan[i];
    const customer = customers[i % customers.length];
    const address = addresses[i % addresses.length];
    const orderProducts = [pick(products), pick(products)];
    const uniqueProducts = Array.from(new Set(orderProducts.map((p) => p._id.toString()))).map(
      (id) => orderProducts.find((p) => p._id.toString() === id)!
    );

    const items = uniqueProducts.map((p) => {
      const quantity = randomBetween(1, 2);
      return {
        productId: p._id,
        productName: p.name,
        slug: p.slug,
        sku: p.sku,
        image: p.images[0],
        mrp: p.mrp,
        price: p.price,
        quantity,
        discount: (p.mrp - p.price) * quantity,
        finalPrice: p.price * quantity,
      };
    });

    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const discount = items.reduce((s, it) => s + it.discount, 0);
    const shipping = subtotal >= 999 ? 0 : 49;
    const total = subtotal + shipping;

    const createdAt = new Date(now.getTime() - randomBetween(1, 45) * 24 * 60 * 60 * 1000);

    const order = await OrderModel.create({
      orderNumber: `TS${(1000 + i).toString()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
      userId: customer._id,
      items,
      addressSnapshot: {
        fullName: address.fullName,
        mobile: address.mobile,
        house: address.house,
        street: address.street,
        area: address.area,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        landmark: address.landmark,
        type: address.type,
      },
      subtotal,
      discount,
      couponDiscount: 0,
      shipping,
      total,
      paymentMethod: plan.paymentMethod,
      paymentStatus: plan.paymentStatus,
      orderStatus: plan.status,
      timeline: [{ status: "PENDING", at: createdAt, note: "Order placed" }, { status: plan.status, at: createdAt, note: `Order ${plan.status.toLowerCase()}` }],
      deliveryEstimate: "3-5 business days",
      createdAt,
      updatedAt: createdAt,
    });

    await PaymentModel.create({
      orderId: order._id,
      userId: customer._id,
      razorpayOrderId: plan.paymentMethod === "RAZORPAY" ? `order_seed_${i}` : null,
      razorpayPaymentId: plan.paymentMethod === "RAZORPAY" && plan.paymentStatus === "PAID" ? `pay_seed_${i}` : null,
      amount: total,
      method: plan.paymentMethod,
      status: plan.paymentStatus,
    });

    createdOrders.push(order);
  }
  console.log(`${createdOrders.length} orders + payments created.`);

  // ---------- Reviews (only on delivered orders) ----------
  const deliveredOrders = createdOrders.filter((o) => o.orderStatus === "DELIVERED");
  const reviewComments = [
    "My kid absolutely loves this! Great quality and safe materials.",
    "Exceeded expectations. Fast delivery and well packaged.",
    "Good value for money. Would recommend to other parents.",
    "The colors are vibrant and it kept my child engaged for hours.",
    "Solid build quality, though slightly smaller than expected.",
    "Perfect gift for a birthday. Highly recommend ToyStore!",
    "Arrived on time and exactly as described. Very happy!",
    "Great educational value alongside the fun factor.",
  ];

  let reviewCount = 0;
  for (const order of deliveredOrders) {
    for (const item of order.items) {
      if (reviewCount >= 20) break;
      const exists = await ReviewModel.exists({ userId: order.userId, productId: item.productId });
      if (exists) continue;

      await ReviewModel.create({
        userId: order.userId,
        productId: item.productId,
        orderId: order._id,
        rating: randomBetween(3, 5),
        comment: pick(reviewComments),
        verifiedPurchase: true,
        status: "APPROVED",
      });
      reviewCount++;
    }
  }

  // Fill remaining reviews with random verified customers/products if under 20
  while (reviewCount < 20) {
    const customer = pick(customers);
    const product = pick(products);
    const exists = await ReviewModel.exists({ userId: customer._id, productId: product._id });
    if (exists) continue;

    await ReviewModel.create({
      userId: customer._id,
      productId: product._id,
      rating: randomBetween(3, 5),
      comment: pick(reviewComments),
      verifiedPurchase: false,
      status: "APPROVED",
    });
    reviewCount++;
  }
  console.log(`${reviewCount} reviews created.`);

  // Recompute product rating aggregates
  const ratingAgg = await ReviewModel.aggregate([
    { $match: { status: "APPROVED" } },
    { $group: { _id: "$productId", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  for (const r of ratingAgg) {
    await ProductModel.findByIdAndUpdate(r._id, { rating: Math.round(r.avg * 10) / 10, reviewCount: r.count });
  }
  console.log("Product rating aggregates updated.");

  console.log("\nSeed complete!\n");
  console.log("Admin login:");
  console.log(`  Email: ${adminEmail}`);
  console.log(`  Password: ${adminPassword}`);
  console.log("\nCustomer logins (all use the same password):");
  customerDefs.forEach((c) => console.log(`  ${c.email}`));
  console.log(`  Password: ${customerPassword}`);

  await mongoose.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
