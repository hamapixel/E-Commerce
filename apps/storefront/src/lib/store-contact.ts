export const STORE_PHONE =
  process.env.NEXT_PUBLIC_STORE_PHONE?.trim() ?? "";

export const STORE_WHATSAPP =
  process.env.NEXT_PUBLIC_STORE_WHATSAPP?.trim() ??
  STORE_PHONE;

export const STORE_EMAIL =
  process.env.NEXT_PUBLIC_STORE_EMAIL?.trim() ?? "";


export function phoneHref(
  phone = STORE_PHONE,
) {
  const cleaned = phone.replace(
    /[^+\d]/g,
    "",
  );

  return cleaned
    ? `tel:${cleaned}`
    : "";
}


export function whatsappHref(
  message = "Bonjour SUGU KURA, je souhaite avoir des informations.",
) {
  const digits = STORE_WHATSAPP.replace(
    /\D/g,
    "",
  );

  if (!digits) {
    return "";
  }

  return (
    `https://wa.me/${digits}` +
    `?text=${encodeURIComponent(message)}`
  );
}
