import { expect } from "chai";
import "mocha";

import { TodoSlices } from "../test/setup";
import { Todo, todos } from "../test/setup";
import { GUID } from "./constants";
import { Store } from "./Store";

const { values } = Object;

describe("Creating a store", () => {
  let store: Store<Todo> = new Store<Todo>(todos);

  it("should be created with 2 todo elements", () => {
    expect(values(store.entries).length).to.equal(2);
  });
});

describe("Adding a slice to the store", () => {
  let store: Store<Todo> = new Store<Todo>(todos);
  store.addSlice(todo => todo.complete, TodoSlices.COMPLETE);

  it("should be created with 1 complete todo element", () => {
    expect(values(store.getSlice(TodoSlices.COMPLETE).entries).length).to.equal(
      1
    );
  });
});

describe("Removing a slice from the store", () => {
  let store: Store<Todo> = new Store<Todo>(todos);
  store.addSlice(todo => todo.complete, TodoSlices.COMPLETE);
  store.removeSlice(TodoSlices.COMPLETE);

  it("should have deleted TodoSlices.COMPLETE", () => {
    expect(store.getSlice(TodoSlices.COMPLETE)).to.be.undefined;
  });
});

describe("Posting elements to the store", () => {
  let store: Store<Todo> = new Store<Todo>(todos);

  store.addSlice(todo => todo.complete, TodoSlices.COMPLETE);
  store.post(new Todo(true, "You had me at hello!"));

  let todos$ = store.subscribe();

  it("should have 3 entries in the store after post", () => {
    expect(values(store.entries).length).to.equal(3);
  });
  it("should have 2 COMPLETED slice elements", () => {
    expect(values(store.getSlice(TodoSlices.COMPLETE).entries).length).to.equal(
      2
    );
  });
});

describe("Subscribing to the store", () => {
  let store: Store<Todo> = new Store<Todo>(todos);
  store.addSlice(todo => todo.complete, TodoSlices.COMPLETE);

  let todos1$ = store.subscribe();
  let todos2$ = store.subscribe();

  it("should multicast the elements stored", () => {
    todos1$.subscribe(todos => {
      expect(todos.length).to.equal(2);
    });
    todos2$.subscribe(todos => {
      expect(todos.length).to.equal(2);
    });
  });
});

describe("Subscribing to the store slice", () => {
  let store: Store<Todo> = new Store<Todo>(todos);
  store.addSlice(todo => todo.complete, TodoSlices.COMPLETE);

  let todos1$ = store.getSlice(TodoSlices.COMPLETE).subscribe();
  let todos2$ = store.getSlice(TodoSlices.COMPLETE).subscribe();

  it("should multicast the elements stored", () => {
    todos1$.subscribe(todos => {
      expect(todos.length).to.equal(1);
    });
    todos2$.subscribe(todos => {
      expect(todos.length).to.equal(1);
    });
  });
});
