export function toStorefrontMediaUrl(
  value: string | null,
): string | null {
  if (
    !value
  ) {
    return null;
  }

  if (
    value.startsWith(
      "/api/media/",
    )
  ) {
    return value;
  }

  if (
    value.startsWith(
      "/media/",
    )
  ) {
    return `/api/media/${value.slice("/media/".length)}`;
  }

  try {
    const url =
      new URL(
        value,
      );

    if (
      url.pathname.startsWith(
        "/media/",
      )
    ) {
      const mediaPath =
        url.pathname.slice(
          "/media/".length,
        );

      return `/api/media/${mediaPath}${url.search}`;
    }
  } catch {
    return value;
  }

  return value;
}
