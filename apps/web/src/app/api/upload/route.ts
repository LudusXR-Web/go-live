import { createUploadRouteHandler, route } from "better-upload/server";

import { s3 } from "~/server/aws/s3";
import { env } from "~/env";

export const { POST } = createUploadRouteHandler({
  client: s3,
  bucketName: env.NEXT_PUBLIC_AWS_BUCKET_NAME,
  routes: {
    image: route({
      fileTypes: ["image/*"],
      maxFileSize: 1024 * 1024 * 4,
    }),
    file: route({
      maxFileSize: 1024 * 1024 * 50,
    }),
  },
});
