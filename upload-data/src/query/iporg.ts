import { PrismaClient } from "@prisma/client";
import { IPOrgUpdateFields } from "../interfaces/IIPOrg";
import { fileLogger } from "../utils/WLogger";

export async function getIpOrgs(
  prisma: PrismaClient,
  ipOrgStatus: number,
  iporg?: string
) {
  let ipOrgItems;
  if (iporg) {
    ipOrgItems = await prisma.ip_organization.findMany({
      where: {
        AND: {
          NOT: {
            status: ipOrgStatus,
          },
          id: iporg,
        },
      },
    });
  } else {
    ipOrgItems = await prisma.ip_organization.findMany({
      where: {
        NOT: {
          status: ipOrgStatus,
        },
      },
    });
  }
  return ipOrgItems;
}

export async function updateIPOrg(
  prisma: PrismaClient,
  ipOrgId: string,
  updateFields: IPOrgUpdateFields
) {
  const ipOrgItem = await prisma.ip_organization.update({
    where: {
      id: ipOrgId,
    },
    data: updateFields,
  });
  return ipOrgItem;
}
