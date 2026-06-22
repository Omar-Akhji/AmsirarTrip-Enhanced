import type { CSSProperties, ImgHTMLAttributes } from "react";

export type ImageProps = {
  src: string;
  alt: string;
  fill?: boolean;
  quality?: number;
  priority?: boolean;
  sizes?: string;
} & ImgHTMLAttributes<HTMLImageElement>;

export default function Image({
  src,
  alt,
  fill,
  quality: _quality,
  priority,
  style,
  className,
  ...properties
}: ImageProps) {
  const fillStyle: CSSProperties =
    fill ?
      { position: "absolute", height: "100%", width: "100%", left: 0, top: 0, right: 0, bottom: 0 }
    : {};

  return (
    <img
      src={src}
      alt={alt}
      style={{ ...fillStyle, ...style }}
      className={className}
      loading={priority ? "eager" : "lazy"}
      {...properties}
    />
  );
}
