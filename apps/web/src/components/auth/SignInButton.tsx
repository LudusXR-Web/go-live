import { signIn } from "~/server/auth";
import { Button } from "@repo/ui/button";

type SignInButtonProps = {
  children?: React.ReactNode;
};

const SignInButton: React.FC<SignInButtonProps> = ({ children }) => {
  return (
    <form
      action={async () => {
        "use server";

        return signIn("google");
      }}
    >
      <Button type="submit">{children ?? "Sign In with Google"}</Button>
    </form>
  );
};

export default SignInButton;
