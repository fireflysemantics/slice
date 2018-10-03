import { EStore } from "@fs/EStore";
import { Slice } from "@fs/Slice";
import { TodoSliceEnum, Todo, todosFactory } from "../test/setup";

let store: EStore<Todo> = new EStore<Todo>(todosFactory());
let { values } = Object;

store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);
let s: Slice<Todo> = store.getSlice(TodoSliceEnum.COMPLETE);
console.log("LENGTH OF ENTRIES", values(s.entries).length);

s.count().subscribe(c => {
  console.log(s.selectAll());
  console.log("THE COUNT FROM THE SLICE: ", c);
});
s.isEmpty().subscribe(empty => {
  console.log(s.selectAll());
  console.log("EMPTY: ", empty);
});
