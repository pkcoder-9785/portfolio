// Price after a discount percentage from 0 to 100.
// Example: discountPrice(100, 20) should return 80.
export function discountPrice(price, percent) {
  return price - percent / 100;
}
