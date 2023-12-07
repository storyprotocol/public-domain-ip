import { PrismaClient, Prisma } from "@prisma/client";
import { IPAssetUpdateFields } from "../interfaces/IIPAsset";
import { IPAssetItem } from "../interfaces/IIPAsset";

export async function getIpAssets(
  prisma: PrismaClient,
  ipOrgStatus: number,
  iporg?: string
): Promise<IPAssetItem[]> {
  let finalSql;
  if (iporg) {
    finalSql = Prisma.sql`select asset.id, ip_organization_id, ipo.org_address, type, asset.name, ip_hash, asset.metadata_url, metadata_raw, asset.description, image_url, asset.owner, asset_seq_id, asset.tx_hash, asset.status from ip_asset as asset inner join ip_organization as ipo on asset.ip_organization_id = ipo.id where asset.status != ${ipOrgStatus} and ipo.id = ${iporg}`;
  } else {
    finalSql = Prisma.sql`select asset.id, ip_organization_id, ipo.org_address, type, asset.name, ip_hash, asset.metadata_url, metadata_raw, asset.description, image_url, asset.owner, asset_seq_id, asset.tx_hash, asset.status from ip_asset as asset inner join ip_organization as ipo on asset.ip_organization_id = ipo.id where asset.status != ${ipOrgStatus}`;
  }
  const result = await prisma.$queryRaw<IPAssetItem[]>(finalSql);
  return result;
}

export async function updateIPAsset(
  prisma: PrismaClient,
  assetId: string,
  updateFields: IPAssetUpdateFields
) {
  const ipOrgItem = await prisma.ip_asset.update({
    where: {
      id: assetId,
    },
    data: updateFields,
  });
  return ipOrgItem;
}
