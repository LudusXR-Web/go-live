import type { DetailedHTMLProps, ButtonHTMLAttributes } from "react";
import { Button, type ButtonProps } from "@repo/ui/button";

import { signIn } from "~/server/auth";

type SignInButtonProps = {
  children?: React.ReactNode;
} & DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  ButtonProps;

const SignInButton: React.FC<SignInButtonProps> = ({ children, ...props }) => {
  return (
    <form
      action={async () => {
        "use server";

        return signIn("google");
      }}
    >
      <Button type="submit" {...props}>
        {children ?? "Sign In with Google"}
      </Button>
    </form>
  );
};

export default SignInButton;
