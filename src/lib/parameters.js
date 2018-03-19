/* eslint-disable import/prefer-default-export */

export function getOptions(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    throw new Error('Failed to parse JSON');
  }
}
