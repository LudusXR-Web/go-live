import z from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { s3 } from "~/server/aws/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "~/env";

const s3Router = createTRPCRouter({
  getObjectByKey: publicProcedure.input(z.string()).query(async ({ input }) => {
    return await s3.send(
      new GetObjectCommand({
        Bucket: env.NEXT_PUBLIC_AWS_BUCKET_NAME,
        Key: input,
      }),
    );
  }),
});

export default s3Router;
