export type Predicate<E> = (e: E) => boolean;

export const enum ActionTypes {
  POST = "Post",
  PUT = "Put",
  DELETE = "Delete",
  INTIALIZE = "Initialize",
  RESET = "Reset"
}

export interface Delta<E> {
  type: ActionTypes;
  entries: E[];
}