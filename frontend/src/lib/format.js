const DEFAULT_TIME_ZONE = "Asia/Kolkata";

const resolveDateOptions = (defaultOptions, options = {}) =>
  Object.keys(options).length
    ? {
        timeZone: DEFAULT_TIME_ZONE,
        ...options,
      }
    : {
        timeZone: DEFAULT_TIME_ZONE,
        ...defaultOptions,
      };

export const formatCurrency = (value, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export const formatCompactNumber = (value) =>
  new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));

export const formatDateTime = (value, options = {}) => {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    resolveDateOptions(
      {
        dateStyle: "medium",
        timeStyle: "short",
      },
      options
    )
  ).format(new Date(value));
};

export const formatDate = (value, options = {}) => {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    resolveDateOptions(
      {
        dateStyle: "medium",
      },
      options
    )
  ).format(new Date(value));
};

export const titleCase = (value = "") =>
  String(value)
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
