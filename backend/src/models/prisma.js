// backend/src/models/prisma.js
const { PrismaClient } = require('@prisma/client');

// Singleton pattern — prevents multiple Prisma instances in dev (hot reload)
const globalForPrisma = global;

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
