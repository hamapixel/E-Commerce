import type {
  ImageLoaderProps,
} from "next/image";

import {
  toStorefrontMediaUrl,
} from "@/lib/storefront-media";


export default function storefrontImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps) {
  const normalized =
    toStorefrontMediaUrl(
      src,
    ) ?? src;

  const separator =
    normalized.includes("?")
      ? "&"
      : "?";

  return `${normalized}${separator}w=${width}&q=${quality ?? 75}`;
}
