import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import z from "zod";

import { env } from "~/env";
import { s3 } from "~/server/aws/s3";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const s3Router = createTRPCRouter({
  getObjectByKey:
    publicProcedure
      .input(
        z.object({
          bucket: z.string().default(env.NEXT_PUBLIC_AWS_BUCKET_NAME),
          key: z.string(),
        }),
      )
      .query(async ({ input }) => {
        return await s3.send(
          new GetObjectCommand({
            Bucket: input.bucket,
            Key: input.key,
          }),
        );
      }) ?? null,
  deleteObjectByKey: protectedProcedure
    .input(
      z.object({
        bucket: z.string().default(env.NEXT_PUBLIC_AWS_BUCKET_NAME),
        key: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return await s3.send(
        new DeleteObjectCommand({
          Bucket: input.bucket,
          Key: input.key,
        }),
      );
    }),
});

export default s3Router;
