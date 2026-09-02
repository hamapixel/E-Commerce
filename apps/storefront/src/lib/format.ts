export function formatMoney(
  value: string | number,
) {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return "0 F CFA";
  }

  return `${new Intl.NumberFormat(
    "fr-FR",
    {
      maximumFractionDigits: 0,
    },
  ).format(amount)} F CFA`;
}