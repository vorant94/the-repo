import type { ImageMetadata } from "astro";
import type { FC, ImgHTMLAttributes } from "react";

interface ThemedImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: ImageMetadata | string;
  srcDark?: ImageMetadata | string | null;
}

export const ThemedImage: FC<ThemedImageProps> = ({
  srcDark,
  src,
  alt,
  ...rest
}) => {
  const srcStr = typeof src === "string" ? src : src.src;
  const srcDarkStr =
    srcDark && (typeof srcDark === "string" ? srcDark : srcDark.src);

  return (
    <picture>
      {srcDarkStr && (
        <source
          srcSet={srcDarkStr}
          media="(prefers-color-scheme:dark)"
        />
      )}
      <img
        src={srcStr}
        alt={alt}
        {...rest}
      />
    </picture>
  );
};
