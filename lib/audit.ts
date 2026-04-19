import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type AuditPayload = {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Prisma.InputJsonValue | null;
};

export async function auditLog(payload: AuditPayload): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: payload.actorId ?? null,
        action: payload.action,
        entityType: payload.entityType,
        entityId: payload.entityId ?? null,
        details: payload.details ?? Prisma.JsonNull,
      },
    });
  } catch {
    // Do not block business flows if audit logging fails.
  }
}
