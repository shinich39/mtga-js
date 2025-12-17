export interface IPairs {
  [key: string]: string,
}

export const isOpening = function(pairs: IPairs, value: string): boolean {
  return Object.keys(pairs).includes(value);
}

export const isClosing = function(pairs: IPairs, value: string): boolean {
  return Object.values(pairs).includes(value);
}

export const isPair = function(pairs: IPairs, opening: string, closing: string): boolean {
  return !!pairs[opening] && pairs[opening] === closing;
}

export const getOpening = function(pairs: IPairs, value: string): string | undefined {
  return Object.entries(pairs).find((entry) => entry[1] === value)?.[0];
}

export const getClosing = function(pairs: IPairs, value: string): string {
  return pairs[value];
}