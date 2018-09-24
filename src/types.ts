import { Slice } from "@fs/Slice";
import { ReplaySubject } from 'rxjs';

export type Predicate<E> = (e: E) => boolean;

/**
 * Interface representing the indexed entities.
 */
export interface IEntityIndex<E> {
  [id: string]: E;
}

/**
 * Interface representing key value pairs.
 */
export interface IKeyValue {
  [id: string]: any;
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
  DELETE = "Delete",
  RESET = "Reset"
}

export interface Delta<E> {
  type: ActionTypes;
  entries: E[];
}

/**
 * Interface representing key value pairs.
 */
export interface IKeyReplaySubject {
  [id: string]: ReplaySubject<any>;
}
