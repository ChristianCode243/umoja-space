import { prisma } from "@/lib/prisma";

export async function getAuditLogs(limit = 200) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      actor: {
        select: {
          name: true,
          email: true,
          profile: true,
        },
      },
    },
  });
}
