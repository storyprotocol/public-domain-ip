import { fileLogger } from "../utils/WLogger";
import { PrismaClient, Prisma } from "@prisma/client";
import {
  RelationshipUpdateFields,
  RelationshipItem,
} from "../interfaces/IRelationship";

export async function getRelationships(
  prisma: PrismaClient,
  ipOrgStatus: number
) {
  const finalSql = Prisma.sql`select r.id, r.ip_org_id, ipo.org_address,relationship_type,src_address,src_id,(select asset_seq_id from ip_asset where id = r.src_id) as src_asset_id, src_type,dst_address, dst_id,(select asset_seq_id from ip_asset where id = r.dst_id) as dst_asset_id,dst_type,relationship_seq_id,r.tx_hash,r.status from relationship r inner join ip_org ipo where r.status != ${ipOrgStatus}`;
  const result = await prisma.$queryRaw<RelationshipItem[]>(
    finalSql,
    ipOrgStatus
  );
  return result;
}

export async function updateRelationship(
  prisma: PrismaClient,
  relationshipId: string,
  updateFields: RelationshipUpdateFields
) {
  const relationshipItem = await prisma.rELATIONSHIP.update({
    where: {
      id: relationshipId,
    },
    data: updateFields,
  });
  return relationshipItem;
}
