export function ownerMediaUrl(
  value: string | null | undefined,
) {
  if (!value) {
    return null;
  }

  if (value.startsWith("/media/")) {
    return `/api/media/${value.slice("/media/".length)}`;
  }

  return value;
}
