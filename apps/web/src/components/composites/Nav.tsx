import { Button } from "@repo/ui/button";

const Nav: React.FC = () => {
  return (
    <nav className="flex justify-between">
      <div>branding here</div>
      <div className="flex gap-4">
        <Button>Example</Button>
        <Button>Example</Button>
        <Button>Example</Button>
        <Button>Example</Button>
        <Button>Example</Button>
      </div>
      <div className="">language switcher</div>
    </nav>
  );
};

export default Nav;
