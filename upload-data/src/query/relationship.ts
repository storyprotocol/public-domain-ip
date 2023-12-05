import { PrismaClient, Prisma } from "@prisma/client";
import {
  RelationshipUpdateFields,
  RelationshipItem,
} from "../interfaces/IRelationship";

export async function getRelationships(
  prisma: PrismaClient,
  ipOrgStatus: number,
  iporg?: string
) {
  let finalSql;
  if (iporg) {
    finalSql = Prisma.sql`select r.id, r.ip_organization_id, ipo.org_address,relationship_type,src_asset_id,(select asset_seq_id from ip_asset where id = r.src_asset_id) as src_asset_seq_id, dst_asset_id,(select asset_seq_id from ip_asset where id = r.dst_asset_id) as dst_asset_seq_id,relationship_seq_id,r.tx_hash,r.status from relationship r inner join ip_organization ipo on r.ip_organization_id = ipo.id where r.status != ${ipOrgStatus} and ipo.id = ${iporg}`;
  } else {
    finalSql = Prisma.sql`select r.id, r.ip_organization_id, ipo.org_address,relationship_type,src_asset_id,(select asset_seq_id from ip_asset where id = r.src_asset_id) as src_asset_seq_id, dst_asset_id,(select asset_seq_id from ip_asset where id = r.dst_asset_id) as dst_asset_seq_id,relationship_seq_id,r.tx_hash,r.status from relationship r inner join ip_organization ipo on r.ip_organization_id = ipo.id where r.status != ${ipOrgStatus}`;
  }

  const result = await prisma.$queryRaw<RelationshipItem[]>(finalSql);
  return result;
}

export async function updateRelationship(
  prisma: PrismaClient,
  relationshipId: string,
  updateFields: RelationshipUpdateFields
) {
  const relationshipItem = await prisma.relationship.update({
    where: {
      id: relationshipId,
    },
    data: updateFields,
  });
  return relationshipItem;
}
