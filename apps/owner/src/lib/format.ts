export function formatMoney(
  value:
    | string
    | number,
) {
  const amount =
    Number(value);

  if (
    Number.isNaN(
      amount,
    )
  ) {
    return "0 F CFA";
  }

  return new Intl.NumberFormat(
    "fr-FR",
    {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    },
  ).format(
    amount,
  );
}


export function formatDate(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(
    date,
  );
}