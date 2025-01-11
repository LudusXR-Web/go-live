"use client";

import { type PropsWithChildren } from "react";
import { motion, type HTMLMotionProps } from "motion/react";

const MotionWrapper: React.FC<PropsWithChildren & HTMLMotionProps<"div">> = ({
  children,
  ...props
}) => {
  return <motion.div {...props}>{children}</motion.div>;
};

export default MotionWrapper;
