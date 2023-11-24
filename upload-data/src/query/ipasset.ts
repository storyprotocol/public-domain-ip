import { fileLogger } from "../utils/WLogger";
import { PrismaClient, Prisma } from "@prisma/client";
import { IPAssetUpdateFields } from "../interfaces/IIPAsset";
import { IPAssetItem } from "../interfaces/IIPAsset";

export async function getIpAssets(
  prisma: PrismaClient,
  ipOrgStatus: number
): Promise<IPAssetItem[]> {
  const result = await prisma.$queryRaw<
    IPAssetItem[]
  >`select asset.id, ip_org_id, ipo.org_address, type, asset.name, ip_hash, asset.url, asset.owner, asset_seq_id, asset.tx_hash, asset.status from ip_asset as asset inner join ip_org as ipo on asset.ip_org_id = ipo.id where asset.status != ${ipOrgStatus}`;
  return result;
}

export async function updateIPAsset(
  prisma: PrismaClient,
  assetId: string,
  updateFields: IPAssetUpdateFields
) {
  const ipOrgItem = await prisma.iP_ASSET.update({
    where: {
      id: assetId,
    },
    data: updateFields,
  });
  return ipOrgItem;
}
