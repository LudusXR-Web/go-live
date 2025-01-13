import Image from "next/image";
import { Button } from "@repo/ui/button";

import Generic from "~/img/generic.webp";
import MotionWrapper from "~/components/utils/MotionWrapper";
import { cn } from "~/lib/utils";
import React from "react";

type FeatureCardProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actionButton?: React.ReactNode;
  side?: "left" | "right";
};

const FeatureCard: React.FC<FeatureCardProps> = ({
  title = "Title",
  description = "Lorem Ipsum! Lorem Ipsum! Lorem Ipsum!",
  actionButton = <Button>Join GoingLive Today!</Button>,
  side = "left",
}) => {
  return (
    <div className="flex-1">
      <form
        className={cn(
          "flex overflow-hidden rounded-2xl bg-slate-100",
          side === "left" ? "flex-row" : "flex-row-reverse",
        )}
      >
        <MotionWrapper
          whileHover={{ translateX: side === "left" ? "-1rem" : "1rem" }}
        >
          <Image
            src={Generic}
            alt="generic"
            width={1280}
            height={720}
            className={cn(
              side === "left" ? "clip-diagonal-to-tr" : "clip-diagonal-to-br",
            )}
          />
        </MotionWrapper>
        <div className="flex flex-col justify-between p-3">
          <div className="space-y-3">
            <h2 className="text-center text-lg font-bold lg:text-xl xl:text-2xl">
              {title}
            </h2>
            <p className="text-base lg:text-lg">{description}</p>
          </div>
          {actionButton}
        </div>
      </form>
    </div>
  );
};

export default FeatureCard;
