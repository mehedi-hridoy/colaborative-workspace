import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
	log: ["info", "warn", "error"],
});

async function connectPrisma() {
	try {
		await prisma.$connect();
		console.log("Prisma connected to database");
	} catch (err) {
		console.error("Prisma connection error:", err);
	}
}

async function disconnectPrisma() {
	try {
		await prisma.$disconnect();
		console.log("Prisma disconnected");
	} catch (err) {
		console.error("Error disconnecting Prisma:", err);
	}
}

// graceful shutdown
const shutdown = async () => {
	await disconnectPrisma();
	process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("uncaughtException", async (err) => {
	console.error("Uncaught exception:", err);
	await shutdown();
});

export { prisma, connectPrisma };