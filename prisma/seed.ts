import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const db = new PrismaClient();

const entries = [
  { code: "JP", name: "Jepang", emoji: "🇯🇵", plans: [
    { name: "Japan Explorer 5GB", description: "Teman perjalanan singkat untuk tetap terkoneksi di Jepang.", quotaGb: 5, validityDays: 7, priceIdr: 69000 },
    { name: "Japan Adventure 12GB", description: "Lebih leluasa berbagi momen sepanjang perjalananmu.", quotaGb: 12, validityDays: 14, priceIdr: 129000 },
  ] },
  { code: "SG", name: "Singapura", emoji: "🇸🇬", plans: [
    { name: "Singapore Quick Trip 3GB", description: "Pas untuk liburan akhir pekan atau perjalanan bisnis.", quotaGb: 3, validityDays: 5, priceIdr: 39000 },
    { name: "Singapore Plus 10GB", description: "Data lebih besar untuk eksplorasi tanpa jeda.", quotaGb: 10, validityDays: 10, priceIdr: 89000 },
  ] },
  { code: "KR", name: "Korea Selatan", emoji: "🇰🇷", plans: [
    { name: "Korea Discovery 8GB", description: "Tetap online dari Seoul sampai destinasi favoritmu.", quotaGb: 8, validityDays: 10, priceIdr: 99000 },
  ] },
  { code: "MY", name: "Malaysia", emoji: "🇲🇾", plans: [
    { name: "Malaysia Easy 5GB", description: "Koneksi praktis untuk perjalanan dekat yang seru.", quotaGb: 5, validityDays: 7, priceIdr: 49000 },
  ] },
  { code: "TH", name: "Thailand", emoji: "🇹🇭", plans: [
    { name: "Thailand Escape 7GB", description: "Siap menemani eksplorasi kota dan pantai.", quotaGb: 7, validityDays: 10, priceIdr: 79000 },
  ] },
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD before seeding.");
  await db.admin.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: { passwordHash: await hash(adminPassword, 12) },
    create: { email: adminEmail.toLowerCase(), passwordHash: await hash(adminPassword, 12) },
  });
  for (const entry of entries) {
    const destination = await db.destination.upsert({
      where: { code: entry.code }, update: { name: entry.name, emoji: entry.emoji, isActive: true },
      create: { code: entry.code, name: entry.name, emoji: entry.emoji },
    });
    for (const plan of entry.plans) {
      const existing = await db.plan.findFirst({ where: { destinationId: destination.id, name: plan.name } });
      if (!existing) await db.plan.create({ data: { ...plan, destinationId: destination.id, isActive: true } });
    }
  }
  console.log("Seed complete: admin, destinations, and sample plans.");
}

main().finally(() => db.$disconnect());
