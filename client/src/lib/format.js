export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);

export const formatDate = (value, options = {}) =>
  new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    ...options,
  }).format(new Date(value));
