import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import z from "zod";

import { s3 } from "~/server/aws/s3";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const s3Router = createTRPCRouter({
  getObjectByKey: protectedProcedure
    .input(
      z.object({
        bucket: z.string(),
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
    }),
  deleteObjectByKey: protectedProcedure
    .input(
      z.object({
        bucket: z.string(),
        key: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return await s3.send(
        new DeleteObjectCommand({
          Bucket: input.bucket,
          Key: input.key,
        }),
      );
    }),
});

export default s3Router;
