import prisma from '../config/prisma';

interface AuditOptions {
  organizationId?: string;
  userId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export async function audit(opts: AuditOptions): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action:         opts.action,
        organizationId: opts.organizationId ?? null,
        userId:         opts.userId         ?? null,
        resourceType:   opts.resourceType   ?? null,
        resourceId:     opts.resourceId     ?? null,
        metadata:       opts.metadata ? JSON.stringify(opts.metadata) : null,
        ipAddress:      opts.ipAddress      ?? null,
      },
    });
  } catch {
    // Audit log failure should never crash the app
  }
}
