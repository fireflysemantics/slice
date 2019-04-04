import { Todo, TodoSliceEnum, todosFactory } from "@test/setup";
import { GUID } from './utilities';
import { EStore } from "@fs/EStore";
import { Slice } from "@fs/Slice";
import { Observable } from "rxjs";

const { values } = Object;

/**
 * CONCERN: Store Initialization
 * METHODs: `constructor`
 */
it("should constructor initialize the store", () => {
  let store: EStore<Todo> = new EStore<Todo>(todosFactory());
  expect(values(store.entries).length).toEqual(2);
});

/**
 * CONCERN: Utility API
 * PROPERTY: `loading`
 */
it("should toggle the loading indicator and make it observable", () => {
  let store: EStore<Todo> = new EStore<Todo>();
  store.loading = true;
  expect(store.loading).toBeTruthy();
  store.loading = false;
  expect(store.loading).toBeFalsy();
  store.loading = true;
  let l:Observable<boolean> = store.observeLoading(); 
  l.subscribe(loading=> {
    expect(loading).toEqual(true);
  });
});

/**
 * CONCERN: Active State
 * METHODS: `addActive` and `deleteActive`. 
 */
it("should add and delete active state", () => {
  let store: EStore<Todo> = new EStore<Todo>();
  expect(store.active.size).toEqual(0);
  let todo1:Todo = new Todo(false, "The first Todo!", GUID());
  let todo2:Todo = new Todo(false, "The first Todo!", GUID());
  //Will not add the entity if it's not contained in the store.
  store.addActive(todo1);
  expect(store.active.size).toEqual(0);
  store.post(todo1);
  store.post(todo2);
  store.addActive(todo1);
  expect(store.active.size).toEqual(1);
  store.addActive(todo2);
  let a:Observable<Map<string, Todo>> = store.observeActive(); 
  let s = a.subscribe(active=> {
    expect(active.get(todo1.gid)).toEqual(todo1);
    expect(active.get(todo2.gid)).toEqual(todo2);
  });
  s.unsubscribe();
  store.deleteActive(todo1);
  expect(store.active.size).toEqual(1);
  store.deleteActive(todo2);
  expect(store.active.size).toEqual(0);
  expect(values(store.entries).length).toEqual(2);
});

/**
 * CONCERN: Utility API
 * METHODS: `toggle`. 
 */
it("should toggle elements", () => {
  let store: EStore<Todo> = new EStore<Todo>(todosFactory());
  let todoOrNotTodo = new Todo(false, "This is not in the store", '1');
    store.toggle(todoOrNotTodo);
  expect(values(store.entries).length).toEqual(3);
  expect(store.contains(todoOrNotTodo)).toBeTruthy();
  store.toggle(todoOrNotTodo);
  expect(values(store.entries).length).toEqual(2);
  expect(store.contains(todoOrNotTodo)).toBeFalsy();
  store.toggle(todoOrNotTodo);
  expect(values(store.entries).length).toEqual(3);
  expect(store.contains(todoOrNotTodo)).toBeTruthy();
});

/**
 * CONCERN: Utility API
 * METHODS: `contains`. 
 */
it("should return true when the store contains the entity and false otherwise", () => {
  let todos = todosFactory();
  let todo0 = todos[0];
  let todo1 = todos[1];
  let todoOrNotTodo = new Todo(false, "This is not in the store", '1');

  let store: EStore<Todo> = new EStore<Todo>(todos);
  expect(store.contains(todo0)).toBeTruthy();
  expect(store.contains(todo1)).toBeTruthy();
  expect(store.contains(todo0.gid)).toBeTruthy();
  expect(store.contains(todo1.gid)).toBeTruthy();
  expect(store.contains(todoOrNotTodo)).toBeFalsy();
  expect(store.contains(todoOrNotTodo.gid)).toBeFalsy();    
});

/**
 * CONCERN: Utility API
 * METHODS: `containsByID`. 
 */
it("should return true when the store contains the entity and false otherwise", () => {
  let todoByID= new Todo(false, "This is not in the store", null, '1');
  let todoByIDAlso= new Todo(false, "This is not in the store", null, '2');
  let store: EStore<Todo> = new EStore<Todo>();
  store.post(todoByID);
  expect(store.containsById(todoByID)).toBeTruthy();    
  expect(store.containsById(todoByIDAlso)).toBeFalsy();    
});


/**
 * CONCERN: Live Count
 * METHODS: `count`. 
 */
it("should return an observable count", () => {
  let store: EStore<Todo> = new EStore<Todo>(todosFactory());
  store.count().subscribe(c => {
    expect(c).toEqual(2);
  });
});

/**
 * CONCERN: Deleting Entities
 * METHODS: `delete`, `deleteN`, `deleteA, deleteP`. 
 * DESIGN CONSIDERATIONS: 
 * Deletion should occur across slices, 
 * id entries (We track entities by gid and id),
 * and active state as well.
 */
it("should delete the element", () => {
  let todo1 = new Todo(false, "This is not in the store", GUID(), '1');
  let todo2 = new Todo(true, "This is not in the store", GUID(), '2');
  let todos = [todo1, todo2];
  let store: EStore<Todo> = new EStore<Todo>(todos);
  store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);
  let todo = todos[1];
  store.addActive(todo);
  expect(todo.complete).toBeTruthy();
  expect(store.getSlice(TodoSliceEnum.COMPLETE).contains(todo)).toBeTruthy();
  expect(values(store.idEntries).length).toEqual(2);
  store.delete(todo);
  //The slice no longer contains todo
  expect(store.contains(todo.gid)).toBeFalsy();
  expect(values(store.selectAll()).length).toEqual(1);
  let slice: Slice<Todo> = store.getSlice(TodoSliceEnum.COMPLETE);
  expect(slice.findOne(todo.gid)).toBeUndefined();
  expect(slice.contains(todo.gid)).toBeFalsy();
  //The todo is not in active state
  expect(store.active.get(todo.gid)).toBeUndefined();
  //The todo should be deleted from the `idEntries` array
  expect(values(store.idEntries).length).toEqual(1);
  //deleteA
  store.reset();
  expect(store.isEmpty()).toBeTruthy();
  store.postA(todos);
  store.deleteA(todos);
  expect(store.isEmpty()).toBeTruthy();
  expect(values(store.idEntries).length).toEqual(0);
  //deleteN
  store.reset();
  expect(store.isEmpty()).toBeTruthy();
  store.postA(todos);
  expect(values(store.idEntries).length).toEqual(2);
  store.deleteN(...todos);
  expect(store.isEmptySnapshot()).toBeTruthy();
  expect(values(store.idEntries).length).toEqual(0);
  //deleteP
  store.reset();
  expect(store.isEmptySnapshot()).toBeTruthy();
  store.postA(todos);
  expect(values(store.idEntries).length).toEqual(2);
  store.deleteP((e:Todo)=>!e.complete);
  expect(store.isEmptySnapshot()).toBeFalsy();
  expect(values(store.idEntries).length).toEqual(1);
});

/**
 * CONCERN: Entity Equality
 * METHODS: `equalityByGUID` and `equalityByID`. 
 */
it("should show that two entities are using both equalsByGUID and equalsByID", () => {
  const guid = GUID();
  let todoOrNotTodo1 = new Todo(false, "This is not in the store", guid, '1');
  let todoOrNotTodo2 = new Todo(false, "This is not in the store", guid, '1');

  let store: EStore<Todo> = new EStore<Todo>();
  store.post(todoOrNotTodo1);
  store.post(todoOrNotTodo2);
  expect(todoOrNotTodo1.gid).toEqual(guid);
  expect(store.equalsByGUID(todoOrNotTodo1, todoOrNotTodo2)).toBeTruthy();
  expect(store.equalsByID(todoOrNotTodo1, todoOrNotTodo2)).toBeTruthy();
});

/**
 * CONCERN: Utility API
 * METHODS: `findOne`. 
 */
it("should findOne", () => {
  let todoOrNotTodo = new Todo(false, "This is not in the store", '1');
  let store: EStore<Todo> = new EStore<Todo>();
  store.post(todoOrNotTodo);
  expect(store.findOne('1').complete).toBeFalsy();
  expect(store.findOne('1').gid).toEqual('1');
});

/**
 * CONCERN: Utility API
 * METHODS: `findOneByID`. 
 */
it("should findByID", () => {
  let todoOrNotTodo = new Todo(false, "This is not in the store", '1');
  todoOrNotTodo.id = '1';
  let store: EStore<Todo> = new EStore<Todo>();
  store.post(todoOrNotTodo);
  expect(store.findOneByID('1').complete).toBeFalsy();
  expect(store.findOneByID('1').id).toEqual('1');
});


/**
 * CONCERN: Utility API
 * METHODS: `findOneByID`. 
 */
it("should add a slice to the storebe created with 1 complete todo element", () => {
  let store: EStore<Todo> = new EStore<Todo>(todosFactory());
  store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);
    expect(
    values(store.getSlice(TodoSliceEnum.COMPLETE).entries).length
  ).toEqual(1);
});


/**
 * CONCERN: Live filtering
 * METHODS: `getSlice` and `removeSlice`
 * DESIGN CONSIDERATIONS:
 * Removing a Slice does not remove entities from the cenral store.
 */
it("should return the right slice", () => {
  let store: EStore<Todo> = new EStore<Todo>();
  store.postA(todosFactory());
  expect(store.isEmptySnapshot()).toBeFalsy();
  store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);
  let slice = store.getSlice(TodoSliceEnum.COMPLETE);
  expect(slice.isEmptySnapshot()).toBeFalsy();
  slice.count()
    .subscribe(c => {
      expect(c).toEqual(1);
  });
  //Remove the slice
  store.removeSlice(TodoSliceEnum.COMPLETE);
  expect(store.getSlice(TodoSliceEnum.COMPLETE)).toBeUndefined();
  //No entries were deleted from the store.
  expect(values(store.entries).length).toEqual(2);

  //should have 2 completed slice elements
  store.reset();
  store.postA(todosFactory());

  store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);
  store.post(new Todo(true, "You had me at hello!"));

  let todos$ = store.observe();
    expect(values(store.entries).length).toEqual(3);
  expect(
    values(store.getSlice(TodoSliceEnum.COMPLETE).entries).length
  ).toEqual(2);
});


/**
 * CONCERN: Utility API
 * METHODS: `isEmpty`
 * DESIGN CONSIDERATIONS:
 * Removing a Slice does not remove entities from the cenral store.
 */
it("should multicast the elements stored as observables", () => {
  let store: EStore<Todo> = new EStore<Todo>(todosFactory());
  store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);

  let todos1$ = store.observe();
  let todos2$ = store.observe();
    todos1$.subscribe(todos => {
    expect(todos.length).toEqual(2);
  });
  todos2$.subscribe(todos => {
    expect(todos.length).toEqual(2);
  });
});

it("should sort observed", () => {
  let store: EStore<Todo> = new EStore<Todo>(todosFactory());
  let sort1: (a: Todo, b: Todo) => number = (a, b) =>
    a.title > b.title ? -1 : 1;
  let sort2: (a: Todo, b: Todo) => number = (a, b) =>
    a.title < b.title ? -1 : 1;
  let todos3$ = store.observe(sort1);
  todos3$.subscribe(todos => {
    expect(todos[0].complete).toBeTruthy();
  });
  let todos4$ = store.observe(sort2);
  todos4$.subscribe(todos => {
    expect(todos[0].complete).toBeFalsy();
  });
});

it("should multicast the slices", () => {
  let todos = todosFactory();
  let store: EStore<Todo> = new EStore<Todo>(todos);
  store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);

  let todos1Slice$ = store.getSlice(TodoSliceEnum.COMPLETE).observe();
  let todos2Slice$ = store.getSlice(TodoSliceEnum.COMPLETE).observe();
  todos1Slice$.subscribe(todos => {
  expect(todos.length).toEqual(1);
  });
  todos2Slice$.subscribe(todos => {
    expect(todos.length).toEqual(1);
  });
});

it("should cascade put opertions to the slice", () => {
  let todos = todosFactory();
  let store: EStore<Todo> = new EStore<Todo>(todos);
  store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);
  todos.forEach(e => (e.complete = false));
  store.putA(todos);
  store
    .getSlice(TodoSliceEnum.COMPLETE)
    .observe()
    .subscribe(todos => {
      expect(todos.length).toEqual(0);
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
      expect(todos.length).toEqual(2);
    });
});

it("should return an update instance post patching", () => {
  let todos = todosFactory();
  let store: EStore<Todo> = new EStore<Todo>(todos);
  store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);

  let todo = todos[1];
  todo.title = "I just called to say I love you!";
  store.put(todo);
    expect(store.findOne(todo["gid"]).title).toContain("I love you!");
  expect(store.contains(todo.gid)).toBeTruthy();
  expect(values(store.selectAll()).length).toEqual(2);
  let slice: Slice<Todo> = store.getSlice(TodoSliceEnum.COMPLETE);
  expect(slice.findOne(todo.gid).title).toContain("I love you!");
});

/**
 * METHODS: isEmpty()
 */
 it("should be an empty store", () => {
   let store: EStore<Todo> = new EStore<Todo>();
   store.isEmpty().subscribe(empty => {
     expect(empty).toBeTruthy();
   });
   store.count().subscribe(c => {
     expect(c).toEqual(0);
   });
   store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);
   store
     .getSlice(TodoSliceEnum.COMPLETE)
     .isEmpty()
     .subscribe(empty => {
       expect(empty).toBeTruthy();
     });
   store
     .getSlice(TodoSliceEnum.COMPLETE)
     .count()
     .subscribe(c => {
       expect(c).toEqual(0);
     });
 });

/**
 * METHODS: isEmptySnapshot()
 */
it("should be an empty store", () => {
  let store: EStore<Todo> = new EStore<Todo>();
  expect(store.isEmptySnapshot()).toBeTruthy();
  let s = store.count().subscribe(c => {
    expect(c).toEqual(0);
  });
  s.unsubscribe();
  store.postA(todosFactory());
  expect(store.isEmptySnapshot()).toBeFalsy();

  store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);
  let slice = store.getSlice(TodoSliceEnum.COMPLETE);
  expect(slice.isEmptySnapshot()).toBeFalsy();
  store
    .getSlice(TodoSliceEnum.COMPLETE)
    .count()
    .subscribe(c => {
      expect(c).toEqual(1);
    });
});


 it("should not be an empty store", () => {
  let store: EStore<Todo> = new EStore<Todo>(todosFactory());
  store.isEmpty().subscribe(empty => {
    expect(empty).toBeFalsy();
  });
  store.count().subscribe(c => {
    expect(c).toEqual(2);
  });
  store.count(todo => todo.complete).subscribe(c => {
    expect(c).toEqual(1);
  });
});

it("should not be an empty slice", () => {
  let store: EStore<Todo> = new EStore<Todo>(todosFactory());
  store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);
  let s: Slice<Todo> = store.getSlice(TodoSliceEnum.COMPLETE);
  s.isEmpty().subscribe(empty => {
    expect(empty).toBeFalsy();
  });
  s.count().subscribe(c => {
    expect(c).toEqual(1);
  });
});