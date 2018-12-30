import v1 from "uuid/v1";

export const enum TodoSliceEnum {
  COMPLETE = "Complete",
  INCOMPLETE = "Incomplete"
}

export class Todo {
  constructor(public complete: boolean, public title: string,public gid?:string, public id?:string) {}
}

export let todos = [new Todo(false, "You complete me!"), new Todo(true, "You completed me!")];

export function todosFactory():Todo[] {
  return [new Todo(false, "You complete me!"), new Todo(true, "You completed me!")];
}

export function todosClone():Todo[] {
  return todos.map(obj => ({...obj}));
}

export function attachGUID<E>(e: E): string {
  let id: string = v1();
  (<any>e)['gid'] = id;
  return id;
}

export function attachGUIDs<E>(e: E[]) {
  e.forEach(e => {
    attachGUID(e);
  });
}