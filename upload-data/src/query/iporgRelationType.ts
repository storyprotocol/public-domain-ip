import { PrismaClient, Prisma } from "@prisma/client";
import { BaseUpdateFields } from "../interfaces/IBase";
import { IPOrgRelationTypeItem } from "../interfaces/IRelationship";

export async function getIPOrgRelationTypes(
  prisma: PrismaClient,
  ipOrgStatus: number,
  iporg?: string
) {
  let finalSql;
  if (iporg) {
    finalSql = Prisma.sql`select ipot.id, ip_organization_id,ipo.org_address,relationship_type, related_src, related_dst, allowed_srcs, allowed_dsts, ipot.tx_hash,ipot.status from relationship_type as ipot inner join ip_organization as ipo on ipot.ip_organization_id = ipo.id where ipot.status != ${ipOrgStatus} and ipo.id = ${iporg}`;
  } else {
    finalSql = Prisma.sql`select ipot.id, ip_organization_id,ipo.org_address,relationship_type, related_src, related_dst, allowed_srcs, allowed_dsts, ipot.tx_hash,ipot.status from relationship_type as ipot inner join ip_organization as ipo on ipot.ip_organization_id = ipo.id where ipot.status != ${ipOrgStatus}`;
  }
  const result = await prisma.$queryRaw<IPOrgRelationTypeItem[]>(finalSql);
  return result;
}

export async function updateIPOrgRelationType(
  prisma: PrismaClient,
  ipOrgRelationTypeId: string,
  updateFields: BaseUpdateFields
) {
  const ipOrgRelationTypeItem = await prisma.relationship_type.update({
    where: {
      id: ipOrgRelationTypeId,
    },
    data: updateFields,
  });
  return ipOrgRelationTypeItem;
}
