import { attachGUIDs, attachGUID } from "./utilities";

import { expect } from "chai";
import "mocha";

import { Slice } from "@fs/Slice";
import { TodoSlices } from "../test/setup";
import { Todo, todos } from "../test/setup";
import { GUID } from "./constants";

attachGUIDs(todos);

let completeSlice = new Slice<Todo>(
  TodoSlices.COMPLETE,
  todo => todo.complete,
  todos
);

let incompleteSlice = new Slice<Todo>(
  TodoSlices.INCOMPLETE,
  todo => !todo.complete,
  todos
);

describe("Creating a slice", () => {
  it("should have 1 incomplete todo element", () => {
    expect(Object.keys(incompleteSlice.entries).length).to.equal(1);
  });
  it("should have complete todo element", () => {
    expect(Object.keys(incompleteSlice.entries).length).to.equal(1);
  });
});

describe("Subscribing to a slice", () => {
  it("should have 1 incomplete todo element", () => {
    let incomplete$ = incompleteSlice.observe();
    incomplete$.subscribe((todos:Todo[]) => {
      expect(todos.length).to.equal(1);
      expect(todos[0].complete).to.be.false;
    });
  });
  it("should have 1 complete todo element", () => {
    let complete$ = completeSlice.observe();
    complete$.subscribe((todos:Todo[]) => {
      expect(todos.length).to.equal(1);
      expect(todos[0].complete).to.be.true;
    });
  });
});

describe("Subscribing for slice delta updates", () => {
  it("should have 1 incomplete todo element", () => {
    let incomplete$ = incompleteSlice.observeDelta();
    incomplete$.subscribe(delta => {
      expect(delta.entries.length).to.equal(1);
      expect(delta.entries[0].complete).to.be.false;
    });
  });
  it("should have 1 complete todo element", () => {
    let complete$ = completeSlice.observeDelta();
    complete$.subscribe(delta => {
      expect(delta.entries.length).to.equal(1);
      expect(delta.entries[0].complete).to.be.true;
    });
  });
});

describe("Checking whether the slice is empty", () => {
  it("should be empty", () => {
    const slice = new Slice<Todo>(TodoSlices.COMPLETE, todo => todo.complete);
    slice.isEmpty().subscribe(empty=>{
      expect(empty).to.be.true;
    });    
  });
  it("should not be empty", () => {
    const slice = new Slice<Todo>(TodoSlices.COMPLETE, todo => todo.complete);
    slice.add(new Todo(true, "You completed me!"));
    slice.isEmpty().subscribe(empty=>{
      expect(empty).to.be.false;
    });    
  });
});

describe("Select slice elements", () => {
  it("should select the the right instance by GUID", () => {
    let todo = new Todo(false, "You complete me!");
    attachGUID(todo);

    let id: string = (<any>todo)[GUID];

    const slice = new Slice<Todo>(
      TodoSlices.INCOMPLETE,
      todo => !todo.complete,
      [todo]
    );
    let selectedTodo: Todo = slice.selectGUID(id);
    expect(selectedTodo).to.equal(todo);
  });
  it("should select slice element by predicate", () => {
    let todo1 = new Todo(false, "You complete me!");
    let todo2 = new Todo(false, "You had me at hello!");
    let todos = [todo1, todo2];
    attachGUIDs(todos);

    const slice = new Slice<Todo>(
      TodoSlices.INCOMPLETE,
      todo => !todo.complete,
      todos
    );
    let selectedTodos: Todo[] = slice.select(todo =>
      todo.title.includes("hello")
    );
    expect(selectedTodos[0]).to.equal(todo2);
  });
  it("should select all slice elements", () => {
    let todo1 = new Todo(false, "You complete me!");
    let todo2 = new Todo(false, "You had me at hello!");
    let todos = [todo1, todo2];
    attachGUIDs(todos);

    const slice = new Slice<Todo>(
      TodoSlices.INCOMPLETE,
      todo => !todo.complete,
      todos
    );
    let selectedTodos: Todo[] = slice.selectAll();
    expect(selectedTodos.length).to.equal(2);
  });
});
