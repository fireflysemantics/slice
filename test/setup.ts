export const enum TodoSlices {
  COMPLETE = "Complete",
  INCOMPLETE = "Incomplete"
}

export class Todo {
  constructor(public complete: boolean, public title: string) {}
}

export let todos = [new Todo(false, "You complete me!"), new Todo(true, "You completed me!")];
