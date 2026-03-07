import AuditLog from "../models/auditLogModel.js";

type AuditInput = {
  actorId?: string | null;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Record<string, unknown>;
};

export const createAuditLog = async ({
  actorId = null,
  action,
  entity,
  entityId,
  metadata = {},
}: AuditInput) => {
  await AuditLog.create({
    actorId,
    action,
    entity,
    entityId,
    metadata,
  });
};