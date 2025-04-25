import z from "zod";
import { NextResponse, type NextRequest } from "next/server";
import { notFound } from "next/navigation";

import { api } from "~/trpc/server";
import { auth } from "~/server/auth";
import { type media } from "~/server/db/schema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const session = await auth();
  const query = (await params).key.join("/");
  const isIdQuery = z.string().cuid2().safeParse(query);

  let mediaDetails: typeof media.$inferSelect | null;

  try {
    mediaDetails = isIdQuery.success
      ? await api.media.getById(query)
      : await api.media.getByKey(query);
  } catch {
    return NextResponse.json("401 Unauthorized", {
      status: 401,
    });
  }

  if (!mediaDetails) notFound();

  if (!mediaDetails.public && !session)
    return NextResponse.json("401 Unauthorized", {
      status: 401,
    });

  const image = await api.s3.getObjectByKey({ key: mediaDetails.key });

  return new Response(image.Body?.transformToWebStream());
}
