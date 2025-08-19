export interface IState {
  short: number,
  long: number,
  isReversed?: boolean,
  dir?: "forward" | "backward" | "none",
  value?: string,
}

export interface IKeydownState {
  state: IState,
  value: string,
  key: string,
}