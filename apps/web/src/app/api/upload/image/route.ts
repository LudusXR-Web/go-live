import { S3Client } from "@aws-sdk/client-s3";
import { createUploadRouteHandler, route } from "better-upload/server";

const s3 = new S3Client();

export const { POST } = createUploadRouteHandler({
  client: s3,
  bucketName: "ludus-golive",
  routes: {
    demo: route({
      fileTypes: ["image/*"],
    }),
  },
});
