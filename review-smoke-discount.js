// Smoke fixture: apply a percentage discount to a price.
// Example: discountPrice(100, 20) should return 80.
export function discountPrice(price, percent) {
  return price - percent / 100;
}
