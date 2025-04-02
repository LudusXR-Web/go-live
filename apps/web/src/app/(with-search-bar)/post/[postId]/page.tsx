import { notFound } from "next/navigation";

import { api } from "~/trpc/server";
import { auth } from "~/server/auth";
import Post from "~/components/composites/Post";
import CreatePostForm from "~/components/forms/CreatePostForm";

type PostPageProps = {
  params: Promise<{
    postId: string;
  }>;
};

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = await params;
  const postWithChildren = await api.posts.getByIdWithComments(postId);

  if (!postWithChildren) notFound();

  const session = await auth();

  return (
    <main className="mx-auto *:first:py-5">
      <Post {...postWithChildren} hideCommentButton hideExpansionLink />
      {session && (
        <CreatePostForm
          standalone
          placeholder={`Comment on ${postWithChildren.author.name.split(" ").at(0)}'s post!`}
          parentId={postId}
        />
      )}
      <div className="border-t border-l *:pl-4 *:first:pt-4">
        {postWithChildren.children.map((post) => (
          <Post {...post} hideCommentButton={!session} key={post.id} />
        ))}
      </div>
    </main>
  );
}
