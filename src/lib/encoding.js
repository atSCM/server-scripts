/* eslint-disable import/prefer-default-export */

export function toBinaryString(byteArray) {
  return byteArray.reduce((p, c) => `${p}${String.fromCharCode(c)}`, '');
}
