import { fileLogger } from "../utils/WLogger";
import { PrismaClient, Prisma } from "@prisma/client";
import { BaseUpdateFields } from "../interfaces/IBase";
import { IPOrgRelationTypeItem } from "../interfaces/IRelationship";

export async function getIPOrgRelationTypes(
  prisma: PrismaClient,
  ipOrgStatus: number
) {
  const finalSql = Prisma.sql`select ipot.id, ip_org_id,ipo.org_address,relationship_type, related_src, related_dst, allowed_srcs, allowed_dsts, ipot.tx_hash,ipot.status from ip_org_relation_type as ipot inner join ip_org as ipo on ipot.ip_org_id = ipo.id where ipot.status != ${ipOrgStatus}`;
  const result = await prisma.$queryRaw<IPOrgRelationTypeItem[]>(
    finalSql,
    ipOrgStatus
  );
  return result;
}

export async function updateIPOrgRelationType(
  prisma: PrismaClient,
  ipOrgRelationTypeId: string,
  updateFields: BaseUpdateFields
) {
  const ipOrgRelationTypeItem = await prisma.iP_ORG_RELATION_TYPE.update({
    where: {
      id: ipOrgRelationTypeId,
    },
    data: updateFields,
  });
  return ipOrgRelationTypeItem;
}
