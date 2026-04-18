/**
 * Currency Configuration & Utilities
 */

export const CURRENCIES = {
  KES: {
    code: 'KES',
    symbol: 'KSh',
    name: 'Kenyan Shilling',
    position: 'prefix',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    position: 'prefix',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    position: 'prefix',
    decimals: 2,
    thousandsSeparator: '.',
    decimalSeparator: ',',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    position: 'prefix',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    position: 'prefix',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  UGX: {
    code: 'UGX',
    symbol: 'USh',
    name: 'Ugandan Shilling',
    position: 'prefix',
    decimals: 0,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  TZS: {
    code: 'TZS',
    symbol: 'TSh',
    name: 'Tanzanian Shilling',
    position: 'prefix',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  ETB: {
    code: 'ETB',
    symbol: 'Br',
    name: 'Ethiopian Birr',
    position: 'prefix',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  BTC: {
    code: 'BTC',
    symbol: '₿',
    name: 'Bitcoin',
    position: 'prefix',
    decimals: 8,
    thousandsSeparator: ' ',
    decimalSeparator: '.',
  },
  ETH: {
    code: 'ETH',
    symbol: 'Ξ',
    name: 'Ethereum',
    position: 'prefix',
    decimals: 18,
    thousandsSeparator: ' ',
    decimalSeparator: '.',
  },
};

/**
 * Format a number as currency based on currency code
 */
export const formatCurrency = (amount, currencyCode = 'KES') => {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.KES;
  const num =
    typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]/g, '')) : Number(amount);

  if (isNaN(num)) return `${currency.symbol}0.00`;

  // Round to appropriate decimals
  const rounded = currency.decimals === 0 ? Math.round(num) : num.toFixed(currency.decimals);

  // Split into parts
  const parts = rounded.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1] || '';

  // Add thousands separators
  const withThousands = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandsSeparator);

  // Combine
  const formatted = currency.decimalSeparator
    ? `${withThousands}${currency.decimalSeparator}${decimalPart}`
    : withThousands;

  // Add symbol
  const symbolWithSpace =
    currency.position === 'prefix' ? `${currency.symbol} ` : ` ${currency.symbol}`;
  return currency.position === 'prefix'
    ? `${currency.symbol}${formatted}`
    : `${formatted}${currency.symbol}`;
};

/**
 * Parse a currency string to number (handles various formats)
 */
export const parseCurrency = (value, currencyCode = 'KES') => {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  const currency = CURRENCIES[currencyCode] || CURRENCIES.KES;
  // Remove symbol and separators
  const clean = value
    .replace(new RegExp(currency.symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '')
    .replace(
      new RegExp(currency.thousandsSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      ''
    )
    .replace(currency.decimalSeparator, '.')
    .trim();

  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

/**
 * Get list of supported currency codes
 */
export const getSupportedCurrencies = () => Object.keys(CURRENCIES);

/**
 * Get currency name by code
 */
export const getCurrencyName = (code) => CURRENCIES[code]?.name || code;
