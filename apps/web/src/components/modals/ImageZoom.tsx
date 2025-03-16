import { type PropsWithChildren } from "react";
import Image, { type StaticImageData } from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/dialog";

type ImageZoomProps = PropsWithChildren & {
  image: string | StaticImageData;
  fileName: string;
};

const ImageZoom: React.FC<ImageZoomProps> = ({ children, image, fileName }) => {
  return (
    <Dialog>
      <DialogTrigger asChild className="cursor-pointer">
        {children}
      </DialogTrigger>
      <DialogContent
        hideCloseButton
        aria-describedby={fileName}
        className="h-full w-fit max-w-dvw content-center justify-center border-0 bg-transparent p-0 shadow-none focus-visible:outline-none"
      >
        <DialogTitle className="sr-only">
          Uploaded image {fileName} zoomed in
        </DialogTitle>
        <Image
          src={image}
          alt=""
          className="h-auto w-5/6"
          width={1280}
          height={720}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImageZoom;
