import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const rs = await p.userReport.findMany({ orderBy: { createdAt: "desc" }, take: 6 });
for (const r of rs) console.log(r.status, "|", r.senderName, "|", JSON.stringify((r.messageText||"").slice(0,60)), "|", r.createdAt.toISOString());
const tag = process.argv[2];
if (tag) {
  const d1 = await p.userReport.deleteMany({ where: { messageText: { contains: tag } } });
  const d2 = await p.message.deleteMany({ where: { content: { contains: tag } } });
  console.log("cleanup:", d1.count, d2.count);
}
await p.$disconnect();
