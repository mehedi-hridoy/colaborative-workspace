const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@teamhub.com' },
    update: {},
    create: {
      email: 'demo@teamhub.com',
      password: await bcrypt.hash('demo123', 12),
      name: 'Demo User',
      avatar: 'https://ui-avatars.com/api/?name=Demo&background=6366f1&color=fff',
    },
  });

  // Demo workspace
  const demoWorkspace = await prisma.workspace.upsert({
    where: { id: 'demo-ws' },
    update: {},
    create: {
      id: 'demo-ws',
      name: 'Demo Team Hub',
      description: 'Fredocloud demo workspace with sample data',
      color: '#6366f1',
      ownerId: demoUser.id,
    },
  });

  // Demo user as admin member
  await prisma.membership.upsert({
    where: {
      userId_workspaceId: {
        userId: demoUser.id,
        workspaceId: demoWorkspace.id,
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      workspaceId: demoWorkspace.id,
      role: 'ADMIN',
    },
  });

  // Sample goal
  const demoGoal = await prisma.goal.create({
    data: {
      title: 'Complete Fredocloud Assessment',
      description: 'Deploy full-stack app to Railway with demo data',
      status: 'IN_PROGRESS',
      workspaceId: demoWorkspace.id,
      ownerId: demoUser.id,
    },
  });

  // Sample milestone
  await prisma.milestone.create({
    data: {
      title: 'Deploy to Railway',
      completed: true,
      goalId: demoGoal.id,
    },
  });

  // Sample action item
  await prisma.actionItem.create({
    data: {
      title: 'Update README with deployment guide',
      status: 'IN_PROGRESS',
      priority: 'high',
      goalId: demoGoal.id,
    },
  });

  console.log('✅ Demo data seeded!');
  console.log(`User: demo@teamhub.com / demo123`);
  console.log(`Workspace: Demo Team Hub (ID: demo-ws)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

