import { createId } from "@paralleldrive/cuid2";
import { createUploadRouteHandler, route, Router } from "better-upload/server";

import { s3 } from "~/server/aws/s3";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ path: string }> },
) {
  const { path } = await params;

  const router: Router = {
    client: s3,
    bucketName: `ludus-golive`,
    routes: {
      image: route({
        fileTypes: ["image/*"],
        onBeforeUpload: (data) => ({
          metadata: data.clientMetadata,
          objectKey: path + "/" + createId() + data.file.name,
        }),
      }),
    },
  };

  return createUploadRouteHandler(router).POST(req);
}
