import { createUploadRouteHandler, route } from "better-upload/server";

import { s3 } from "~/server/aws/s3";

export const { POST } = createUploadRouteHandler({
  client: s3,
  bucketName: "ludus-golive",
  routes: {
    image: route({
      fileTypes: ["image/*"],
    }),
  },
});
