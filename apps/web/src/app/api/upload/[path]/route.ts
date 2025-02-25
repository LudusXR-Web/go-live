import { createId } from "@paralleldrive/cuid2";
import { createUploadRouteHandler, route, Router } from "better-upload/server";

import { s3 } from "~/server/aws/s3";
import { env } from "~/env";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ path: string }> },
) {
  const { path } = await params;

  const router: Router = {
    client: s3,
    bucketName: env.NEXT_PUBLIC_AWS_BUCKET_NAME,
    routes: {
      image: route({
        fileTypes: ["image/*"],
        maxFileSize: 1024 * 1024 * 4,
        onBeforeUpload: (data) => ({
          metadata: data.clientMetadata,
          objectKey: path + "/" + createId() + data.file.name,
        }),
      }),
      file: route({
        maxFileSize: 1024 * 1024 * 50,
        onBeforeUpload: (data) => ({
          metadata: data.clientMetadata,
          objectKey: path + "/" + createId() + data.file.name,
        }),
      }),
    },
  };

  return createUploadRouteHandler(router).POST(req);
}
