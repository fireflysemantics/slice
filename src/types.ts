import { Slice } from "@fs/Slice";

/**
 * Interface representing the indexed entities.
 */
export interface IEntityIndex<E> {
  [id: string]: E;
}

/**
 * Index Interface for slices stored in the store.
 */
export interface ISliceIndex<E> {
  [id: string]: Slice<E>;
}

export const enum ActionTypes {
  POST = "Post",
  PUT = "Put",
  DELETE = "Delete"
}

export interface Delta<E> {
  type: ActionTypes;
  entries: E[];
}
