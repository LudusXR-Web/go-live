import { Fragment } from "react";

type MultilineTextProps = {
  children: string;
};

const MultilineText: React.FC<MultilineTextProps> = ({ children }) =>
  children.split("\n").map((line, idx) => (
    <Fragment key={idx}>
      {line}
      <br />
    </Fragment>
  ));

export default MultilineText;
