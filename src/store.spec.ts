import { expect } from "chai";
import "mocha";

import { TodoSlices } from "../test/setup";
import { Todo, todos } from "../test/setup";
import { GUID } from "./constants";
import { EStore } from "@fs/EStore";
import { Slice } from "./Slice";

const { values } = Object;

describe("Creating a store", () => {
  let store: EStore<Todo> = new EStore<Todo>(todos);

  it("should be created with 2 todo elements", () => {
    expect(values(store.entries).length).to.equal(2);
  });
});

describe("Adding a slice to the store", () => {
  let store: EStore<Todo> = new EStore<Todo>(todos);
  store.addSlice(todo => todo.complete, TodoSlices.COMPLETE);

  it("should be created with 1 complete todo element", () => {
    expect(values(store.getSlice(TodoSlices.COMPLETE).entries).length).to.equal(
      1
    );
  });
});

describe("Removing a slice from the store", () => {
  let store: EStore<Todo> = new EStore<Todo>(todos);
  store.addSlice(todo => todo.complete, TodoSlices.COMPLETE);
  store.removeSlice(TodoSlices.COMPLETE);

  it("should have deleted TodoSlices.COMPLETE", () => {
    expect(store.getSlice(TodoSlices.COMPLETE)).to.be.undefined;
  });
});

describe("Posting elements to the store", () => {
  let store: EStore<Todo> = new EStore<Todo>(todos);

  store.addSlice(todo => todo.complete, TodoSlices.COMPLETE);
  store.post(new Todo(true, "You had me at hello!"));

  let todos$ = store.observe();

  it("should have 3 entries in the store after post", () => {
    expect(values(store.entries).length).to.equal(3);
  });
  it("should have 2 COMPLETED slice elements", () => {
    expect(values(store.getSlice(TodoSlices.COMPLETE).entries).length).to.equal(
      2
    );
  });
});

describe("Observing to the store", () => {
  let store: EStore<Todo> = new EStore<Todo>(todos);
  store.addSlice(todo => todo.complete, TodoSlices.COMPLETE);

  let todos1$ = store.observe();
  let todos2$ = store.observe();

  it("should multicast the elements stored", () => {
    todos1$.subscribe(todos => {
      expect(todos.length).to.equal(2);
    });
    todos2$.subscribe(todos => {
      expect(todos.length).to.equal(2);
    });
  });

  it("should sort observed", () => {
    let sort1: (a:Todo, b:Todo)=>number =  (a, b)=>(a.title > b.title ? -1 : 1);
    let sort2: (a:Todo, b:Todo)=>number =  (a, b)=>(a.title < b.title ? -1 : 1);
    let todos3$ = store.observe(sort1);
    todos3$.subscribe(todos => {
      expect(todos[0].complete).to.be.false;
    });
    let todos4$ = store.observe(sort2);
    todos4$.subscribe(todos => {
      expect(todos[0].complete).to.be.true;
    });
  });
});

describe("Observing a store slice", () => {
  let store: EStore<Todo> = new EStore<Todo>(todos);
  store.addSlice(todo => todo.complete, TodoSlices.COMPLETE);

  let todos1$ = store.getSlice(TodoSlices.COMPLETE).observe();
  let todos2$ = store.getSlice(TodoSlices.COMPLETE).observe();

  it("should multicast the elements stored", () => {
    todos1$.subscribe(todos => {
      expect(todos.length).to.equal(1);
    });
    todos2$.subscribe(todos => {
      expect(todos.length).to.equal(1);
    });
  });
});

describe("Patching store elements", () => {
  let store: EStore<Todo> = new EStore<Todo>(todos);
  store.addSlice(todo => todo.complete, TodoSlices.COMPLETE);

  let todo = todos[1];
  todo.title = "I just called to say I love you!";
  store.put(todo);

  let id = (<any>todo)[GUID];

  it("should return an update instance post patching", () => {
    expect(store.selectGUID(id).title).to.contain("I love you!");
    expect(store.contains(id)).to.be.true;
    expect(values(store.selectAll()).length).to.equal(2);
  });

  let slice:Slice<Todo> = store.getSlice(TodoSlices.COMPLETE);  

  it("should also patch the slice", () => {
    expect(slice.selectGUID(id).title).to.contain("I love you!");
  });
});

describe("Deleteting store elements", () => {
  let store: EStore<Todo> = new EStore<Todo>(todos);
  store.addSlice(todo => todo.complete, TodoSlices.COMPLETE);

  let todo = todos[1];
  let id = (<any>todo)[GUID];
  store.delete(todo);

  it("should delete the element", () => {
    expect(store.contains(id)).to.be.false;
    expect(values(store.selectAll()).length).to.equal(1);
  });

  let slice:Slice<Todo> = store.getSlice(TodoSlices.COMPLETE);  

  it("should also delete it from the the slice", () => {
    expect(slice.selectGUID(id)).to.be.undefined;
    expect(slice.contains(id)).to.be.false;
  });
});

describe("Reading empty store metadata", () => {
  let store: EStore<Todo> = new EStore<Todo>();
  it("should be an empty store", () => {
    store.isEmpty().subscribe(empty=>{
      expect(empty).to.be.true;
    });
    store.count().subscribe(c=>{
      expect(c).to.equal(0);
    });
  });
  store.addSlice(todo => todo.complete, TodoSlices.COMPLETE);
  it("should be an empty slice", () => {
    store.getSlice(TodoSlices.COMPLETE).isEmpty().subscribe(empty=>{
      expect(empty).to.be.true;
    });
    store.getSlice(TodoSlices.COMPLETE).count().subscribe(c=>{
      expect(c).to.equal(0);
    });    
  });
});

describe("Reading non empty store metadata", () => {
  let store: EStore<Todo> = new EStore<Todo>();

  store.putA(todos);

  it("should not be an empty store", () => {
    store.isEmpty().subscribe(empty=>{
      expect(store.isEmpty()).to.be.false;
    });
    store.count().subscribe(c=>{
      expect(c).to.equal(2);
    });
  });
  store.addSlice(todo => todo.complete, TodoSlices.COMPLETE);

  it("should not be an empty slice", () => {
    store.getSlice(TodoSlices.COMPLETE).isEmpty().subscribe(empty=>{
      expect(empty).to.be.false;
    });
    store.getSlice(TodoSlices.COMPLETE).count().subscribe(c=>{
      expect(c).to.equal(1);
    });
  });
});