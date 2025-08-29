export function hslToHex(h: number, s: number, l: number): string {
  // HSL 값을 0-1 범위로 정규화합니다.
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    // 채도가 0이면 회색 계열이므로 r, g, b 모두 l과 같습니다.
    r = g = b = l;
  } else {
    // 색조(h), 채도(s), 명도(l)를 사용하여 RGB 값 계산을 위한 헬퍼 함수
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  // RGB 값을 0-255 범위로 변환하고 16진수 문자열로 포맷팅합니다.
  const toHex = (c: number): string => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex; // 한 자리 숫자면 앞에 0을 붙여 두 자리로 만듭니다.
  };

  return "#" + toHex(r) + toHex(g) + toHex(b);
}