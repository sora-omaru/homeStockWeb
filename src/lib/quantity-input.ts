//数値入力欄の文字列から数字以外と不要な先頭の0を取り除く
export function parseQuantityInput(value: string): number {
  const digitsOnly = value.replace(/\D/g, "");
  const withoutLeadingZeros = digitsOnly.replace(/^0+(?=\d)/, "");

  return Number(withoutLeadingZeros || "0");
}
