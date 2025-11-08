import { randomUUID } from "crypto";

const ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
function randBase62(len = 6) {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

export function generateShortCode(len = 6) {
  return randBase62(len);
}

export const SHORT_CODE_REGEX = /^[0-9A-Za-z_-]{4,64}$/;
