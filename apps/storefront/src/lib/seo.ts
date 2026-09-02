export const SITE_NAME =
  "SUGU KURA";

export const SITE_DESCRIPTION =
  "SUGU KURA — téléphones, électronique, maison, technologie et équipements au meilleur prix.";

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL
    ?.trim()
  || "http://localhost:3000";

export const SITE_URL =
  new URL(
    rawSiteUrl.endsWith("/")
      ? rawSiteUrl
      : `${rawSiteUrl}/`,
  );

export function absoluteUrl(
  path = "/",
) {
  return new URL(
    path,
    SITE_URL,
  ).toString();
}

export function readTextField(
  source: unknown,
  key: string,
) {
  if (
    !source
    ||
    typeof source !==
    "object"
  ) {
    return "";
  }

  const value =
    (
      source as Record<
        string,
        unknown
      >
    )[key];

  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value.trim();
}

export function firstText(
  ...values: Array<
    string | null | undefined
  >
) {
  for (
    const value
    of values
  ) {
    const cleaned =
      value?.trim();

    if (cleaned) {
      return cleaned;
    }
  }

  return "";
}

export function truncateText(
  value: string,
  maxLength = 160,
) {
  const cleaned =
    value
      .replace(
        /\s+/g,
        " ",
      )
      .trim();

  if (
    cleaned.length <=
    maxLength
  ) {
    return cleaned;
  }

  return (
    cleaned
      .slice(
        0,
        Math.max(
          0,
          maxLength - 1,
        ),
      )
      .trimEnd()
    + "…"
  );
}

export function absoluteImageUrl(
  value:
    | string
    | null
    | undefined,
) {
  const cleaned =
    value?.trim();

  if (!cleaned) {
    return null;
  }

  try {
    return new URL(
      cleaned,
      SITE_URL,
    ).toString();
  }
  catch {
    return null;
  }
}

export function uniqueUrls(
  values: Array<
    string | null | undefined
  >,
) {
  const result: string[] = [];
  const seen =
    new Set<string>();

  for (
    const value
    of values
  ) {
    const url =
      absoluteImageUrl(
        value,
      );

    if (
      url
      &&
      !seen.has(url)
    ) {
      seen.add(url);
      result.push(url);
    }
  }

  return result;
}

export function safeJsonLd(
  value: unknown,
) {
  return JSON.stringify(
    value,
  ).replace(
    /</g,
    "\\u003c",
  );
}
