import v1 from "uuid/v1";
import { GUID } from "./constants";

export type Predicate<E> = (e: E) => boolean;

export function attachGUID<E>(e: E): string {
  let id: string = v1();
  (<any>e)[GUID] = id;
  return id;
}

export function attachGUIDs<E>(e: E[]) {
  e.forEach(e => {
    attachGUID(e);
  });
}