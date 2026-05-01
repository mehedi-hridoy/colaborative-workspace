import { prisma } from "./config/db.js";

async function testDB() {
  const users = await prisma.user.findMany();
  console.log(users);
}

testDB();