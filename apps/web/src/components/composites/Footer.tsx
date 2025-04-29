import Image from "next/image";

import EuFund from "~/img/eu_fund.png";

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary h-fit min-h-64 w-full">
      <div className="container m-auto py-2 text-white">
        <div className="max-w-78 space-y-4 md:max-w-96 lg:max-w-128">
          <Image src={EuFund} alt="Co-funded by the European Union" />
          <p>
            Co-funded by the European Union. Views and opinions expressed are
            however those of the author(s) only and do not necessarily reflect
            those of the European Union or the European Education and Culture
            Executive Agency (EACEA). Neither the European Union nor EACEA can
            be held responsible for them.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
