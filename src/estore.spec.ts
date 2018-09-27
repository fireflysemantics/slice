import { expect } from "chai";
import "mocha";

import { Todo, TodoSliceEnum, todosFactory } from "@test/setup";
import { EStore } from "@fs/EStore";
import { Slice } from "@fs/Slice";

const { values } = Object;

describe("Creating a store", () => {
  let store: EStore<Todo> = new EStore<Todo>(todosFactory());

  it("should be created with 2 todo elements", () => {
    expect(values(store.entries).length).to.equal(2);
  });
});

describe("Adding a slice to the store", () => {
  let store: EStore<Todo> = new EStore<Todo>(todosFactory());
  store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);

  it("should be created with 1 complete todo element", () => {
    expect(
      values(store.getSlice(TodoSliceEnum.COMPLETE).entries).length
    ).to.equal(1);
  });
});

describe("Removing a slice from the store", () => {
  let store: EStore<Todo> = new EStore<Todo>(todosFactory());
  store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);
  store.removeSlice(TodoSliceEnum.COMPLETE);

  it("should have deleted todosFactory()lices.COMPLETE", () => {
    expect(store.getSlice(TodoSliceEnum.COMPLETE)).to.be.undefined;
  });
});

describe("Posting elements to the store", () => {
  let store: EStore<Todo> = new EStore<Todo>(todosFactory());

  store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);
  store.post(new Todo(true, "You had me at hello!"));

  let todos$ = store.observe();

  it("should have 3 entries in the store after post", () => {
    expect(values(store.entries).length).to.equal(3);
  });
  it("should have 2 completed slice elements", () => {
    expect(
      values(store.getSlice(TodoSliceEnum.COMPLETE).entries).length
    ).to.equal(2);
  });
});

describe("Observing to the store", () => {
  let store: EStore<Todo> = new EStore<Todo>(todosFactory());
  store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);

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
    let sort1: (a: Todo, b: Todo) => number = (a, b) =>
      a.title > b.title ? -1 : 1;
    let sort2: (a: Todo, b: Todo) => number = (a, b) =>
      a.title < b.title ? -1 : 1;
    let todos3$ = store.observe(sort1);
    todos3$.subscribe(todos => {
      expect(todos[0].complete).to.be.true;
    });
    let todos4$ = store.observe(sort2);
    todos4$.subscribe(todos => {
      expect(todos[0].complete).to.be.false;
    });
  });
});

describe("Observing a store slice", () => {
  let todos = todosFactory();
  let store: EStore<Todo> = new EStore<Todo>(todos);
  store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);

  let todos1$ = store.getSlice(TodoSliceEnum.COMPLETE).observe();
  let todos2$ = store.getSlice(TodoSliceEnum.COMPLETE).observe();

  it("should multicast the elements stored", () => {
    todos1$.subscribe(todos => {
      expect(todos.length).to.equal(1);
    });
    todos2$.subscribe(todos => {
      expect(todos.length).to.equal(1);
    });
  });
});

describe("Put operations on the store cascade to slice", () => {
  it("should remove all elements from the slice", () => {
    let todos = todosFactory();
    let store: EStore<Todo> = new EStore<Todo>(todos);
    store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);
    todos.forEach(e => (e.complete = false));
    store.putA(todos);
    store
      .getSlice(TodoSliceEnum.COMPLETE)
      .observe()
      .subscribe(todos => {
        expect(todos.length).to.equal(0);
      });
  });
  it("should put all store elements in the slice", () => {
    let todos = todosFactory();
    let store: EStore<Todo> = new EStore<Todo>(todos);
    store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);
    todos.forEach(e => (e.complete = true));
    store.putA(todos);
    store
      .getSlice(TodoSliceEnum.COMPLETE)
      .observe()
      .subscribe(todos => {
        expect(todos.length).to.equal(2);
      });
  });  
});

describe("Patching store elements", () => {
  let todos = todosFactory();
  let store: EStore<Todo> = new EStore<Todo>(todos);
  store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);

  let todo = todos[1];
  todo.title = "I just called to say I love you!";
  store.put(todo);

  it("should return an update instance post patching", () => {
    expect(store.findOne(todo["gid"]).title).to.contain("I love you!");
    expect(store.contains(todo.gid)).to.be.true;
    expect(values(store.selectAll()).length).to.equal(2);
  });

  let slice: Slice<Todo> = store.getSlice(TodoSliceEnum.COMPLETE);

  it("should also patch the slice", () => {
    expect(slice.findOne(todo.gid).title).to.contain("I love you!");
  });
});

describe("Deleteting store elements", () => {
  let todos = todosFactory();
  let store: EStore<Todo> = new EStore<Todo>(todos);
  store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);

  let todo = todos[1];
  store.delete(todo);

  it("should delete the element", () => {
    expect(store.contains(todo.gid)).to.be.false;
    expect(values(store.selectAll()).length).to.equal(1);
  });

  let slice: Slice<Todo> = store.getSlice(TodoSliceEnum.COMPLETE);

  it("should also delete it from the the slice", () => {
    expect(slice.findOne(todo.gid)).to.be.undefined;
    expect(slice.contains(todo.gid)).to.be.false;
  });
});

describe("Reading empty store metadata", () => {
  let store: EStore<Todo> = new EStore<Todo>();
  it("should be an empty store", () => {
    store.isEmpty().subscribe(empty => {
      expect(empty).to.be.true;
    });
    store.count().subscribe(c => {
      expect(c).to.equal(0);
    });
  });
  store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);
  it("should be an empty slice", () => {
    store
      .getSlice(TodoSliceEnum.COMPLETE)
      .isEmpty()
      .subscribe(empty => {
        expect(empty).to.be.true;
      });
    store
      .getSlice(TodoSliceEnum.COMPLETE)
      .count()
      .subscribe(c => {
        expect(c).to.equal(0);
      });
  });
});

describe("Reading non empty store metadata", () => {
  let store: EStore<Todo> = new EStore<Todo>();

  it("should be an empty store", () => {
    store.isEmpty().subscribe(empty => {
      expect(store.isEmpty()).to.be.true;
    });
  });

  store.putA(todosFactory());

  it("should not be an empty store", () => {
    store.isEmpty().subscribe(empty => {
      expect(store.isEmpty()).to.be.false;
    });
    store.count().subscribe(c => {
      expect(c).to.equal(2);
    });
    store.count(todo => todo.complete).subscribe(c => {
      expect(c).to.equal(1);
    });
  });
  store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);

  it("should not be an empty slice", () => {
    store
      .getSlice(TodoSliceEnum.COMPLETE)
      .isEmpty()
      .subscribe(empty => {
        expect(empty).to.be.false;
      });
    store
      .getSlice(TodoSliceEnum.COMPLETE)
      .count()
      .subscribe(c => {
        expect(c).to.equal(1);
      });
  });

  it("should return an observable count", () => {
    store.count().subscribe(c => {
      expect(c).to.equal(2);
    });
  });
});
