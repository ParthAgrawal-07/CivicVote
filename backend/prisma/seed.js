// backend/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin
  const adminPass = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@college.edu' },
    update: {},
    create: {
      studentId: 'ADM-001',
      email: 'admin@college.edu',
      password: adminPass,
      name: 'Election Admin',
      year: 4,
      department: 'Administration',
      role: 'ADMIN',
      verified: true,
    },
  });

  // Create students
  const studentPass = await bcrypt.hash('Student@123', 12);
  const students = await Promise.all([
    prisma.user.upsert({
      where: { email: 'alex.patel@college.edu' },
      update: {},
      create: { studentId: 'STU-2024-001', email: 'alex.patel@college.edu', password: studentPass, name: 'Alex Patel', year: 3, department: 'Computer Science', verified: true },
    }),
    prisma.user.upsert({
      where: { email: 'priya.nair@college.edu' },
      update: {},
      create: { studentId: 'STU-2024-002', email: 'priya.nair@college.edu', password: studentPass, name: 'Priya Nair', year: 2, department: 'Engineering', verified: true },
    }),
    prisma.user.upsert({
      where: { email: 'rohan.mehta@college.edu' },
      update: {},
      create: { studentId: 'STU-2024-003', email: 'rohan.mehta@college.edu', password: studentPass, name: 'Rohan Mehta', year: 3, department: 'Mechanical', verified: true },
    }),
  ]);

  // Create elections
  const now = new Date();
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const fiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

  const presidentialElection = await prisma.election.create({
    data: {
      title: 'Student Body President',
      category: 'PRESIDENT_VP',
      eligibleGroup: 'ALL',
      anonymous: true,
      status: 'LIVE',
      startsAt: now,
      endsAt: threeDays,
      candidates: {
        create: [
          { name: 'Jordan Smith', role: 'Year 2 · Business Administration' },
          { name: 'Sneha Iyer', role: 'Year 3 · Electronics' },
          { name: 'Dev Anand', role: 'Year 4 · Computer Science' },
        ],
      },
    },
  });

  const vpElection = await prisma.election.create({
    data: {
      title: 'Student VP — Academic Affairs',
      category: 'PRESIDENT_VP',
      eligibleGroup: 'ALL',
      anonymous: true,
      status: 'LIVE',
      startsAt: now,
      endsAt: threeDays,
      candidates: {
        create: [
          { name: 'Riya Sharma', role: 'Year 3 · Economics' },
          { name: 'Kabir Menon', role: 'Year 4 · Physics' },
        ],
      },
    },
  });

  const techClubElection = await prisma.election.create({
    data: {
      title: 'Tech Club President',
      category: 'CLUB_HEAD',
      eligibleGroup: 'ALL',
      anonymous: true,
      status: 'LIVE',
      startsAt: now,
      endsAt: fiveDays,
      candidates: {
        create: [
          { name: 'Meera Joshi', role: 'Year 3 · Electronics' },
          { name: 'Nikhil Bose', role: 'Year 2 · IT' },
          { name: 'Anjali Rao', role: 'Year 2 · Computer Science' },
        ],
      },
    },
  });

  const classRepElection = await prisma.election.create({
    data: {
      title: 'Class Representative — Batch 2027',
      category: 'CLASS_REP',
      eligibleGroup: 'Year 2 only',
      anonymous: true,
      status: 'LIVE',
      startsAt: now,
      endsAt: sevenDays,
      candidates: {
        create: [
          { name: 'Rahul Verma', role: 'Year 2 · Mass Communication' },
          { name: 'Pooja Singh', role: 'Year 2 · Mechanical' },
        ],
      },
    },
  });

  // Seed some audit logs
  await prisma.auditLog.createMany({
    data: [
      { type: 'SYS', message: 'Database seeded', detail: 'Initial seed with 4 elections and candidates', userId: admin.id },
      { type: 'ADMIN', message: 'Election "Student Body President" published', detail: `Admin · ${admin.email}`, userId: admin.id },
      { type: 'ADMIN', message: 'Election "Tech Club President" published', detail: `Admin · ${admin.email}`, userId: admin.id },
      { type: 'SYS', message: 'System integrity check passed', detail: 'All audit hashes verified · No tampering detected' },
    ],
  });

  console.log('✅ Seed complete!');
  console.log('\n📋 Login credentials:');
  console.log('   Admin   → admin@college.edu / Admin@123');
  console.log('   Student → alex.patel@college.edu / Student@123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
