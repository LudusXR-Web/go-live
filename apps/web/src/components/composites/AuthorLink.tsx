import Link from "next/link";
import { Button } from "@repo/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";

import { api } from "~/trpc/server";

type AuthorLinkProps = {
  userId: string;
};

const AuthorLink: React.FC<AuthorLinkProps> = async ({ userId }) => {
  const author = await api.users.getFootprintById(userId);

  return (
    <Button
      asChild
      variant="link"
      className="group/button_link px-0 text-inherit hover:no-underline"
    >
      <Link href={`/${author?.username}`}>
        <Avatar>
          <AvatarImage src={author?.image ?? ""} />
          <AvatarFallback>{author?.name.at(0)}</AvatarFallback>
        </Avatar>
        <span className="inline group-hover/button_link:underline">
          By {author?.name}
        </span>
      </Link>
    </Button>
  );
};

export default AuthorLink;
