export interface IPairs {
  [key: string]: string,
}

export const isOpening = function(pairs: IPairs, value: string) {
  return Object.keys(pairs).includes(value);
}

export const isClosing = function(pairs: IPairs, value: string) {
  return Object.values(pairs).includes(value);
}

export const isPair = function(pairs: IPairs, opening: string, closing: string) {
  return pairs[opening] && pairs[opening] === closing;
}

export const getOpening = function(pairs: IPairs, value: string) {
  return Object.entries(pairs).find((entry) => entry[1] === value)?.[0];
}

export const getClosing = function(pairs: IPairs, value: string) {
  return pairs[value];
}