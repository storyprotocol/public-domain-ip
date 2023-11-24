import { fileLogger } from "../utils/WLogger";
import { PrismaClient } from "@prisma/client";
import { IPOrgUpdateFields } from "../interfaces/IIPOrg";

export async function getIpOrgs(prisma: PrismaClient, ipOrgStatus: number) {
  const ipOrgItems = await prisma.iP_ORG.findMany({
    where: {
      NOT: {
        status: ipOrgStatus,
      },
    },
  });
  return ipOrgItems;
}

export async function updateIPOrg(
  prisma: PrismaClient,
  ipOrgId: string,
  updateFields: IPOrgUpdateFields
) {
  const ipOrgItem = await prisma.iP_ORG.update({
    where: {
      id: ipOrgId,
    },
    data: updateFields,
  });
  return ipOrgItem;
}
