import { Todo, TodoSliceEnum, todosFactory } from "@test/setup";
import { GUID } from './utilities';
import { EStore } from "@fs/EStore";
import { Slice } from "@fs/Slice";
import { Observable } from "rxjs";

const { values } = Object;


it("should be created with 2 todo elements", () => {
  let store: EStore<Todo> = new EStore<Todo>(todosFactory());
  expect(values(store.entries).length).toEqual(2);
});
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

it("should have no active state", () => {
  let store: EStore<Todo> = new EStore<Todo>();
  expect(store.active.size).toEqual(0);
});

it("should add and delete active state", () => {
  let store: EStore<Todo> = new EStore<Todo>();
  let todo1:Todo = new Todo(false, "The first Todo!", GUID());
  let todo2:Todo = new Todo(false, "The first Todo!", GUID());
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

it("should create a store with 2 todo elements", () => {
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

it("should return correct results for contain operations", () => {
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

it("should return correct results when containById is evaluated", () => {
  let todoByID= new Todo(false, "This is not in the store", null, '1');
  let todoByIDAlso= new Todo(false, "This is not in the store", null, '2');
  let store: EStore<Todo> = new EStore<Todo>();
  store.post(todoByID);
    expect(store.containsById(todoByID)).toBeTruthy();    
  expect(store.containsById(todoByIDAlso)).toBeFalsy();    
});


it("should be able to find todoOrNotTodo by its id property using findOneById", () => {
  let todoOrNotTodo = new Todo(false, "This is not in the store", '1');
  todoOrNotTodo.id = '1';
  let store: EStore<Todo> = new EStore<Todo>();
  store.post(todoOrNotTodo);
  expect(store.findOneByID('1').complete).toBeFalsy();
  expect(store.findOneByID('1').id).toEqual('1');
});

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

it("should add a slice to the storebe created with 1 complete todo element", () => {
  let store: EStore<Todo> = new EStore<Todo>(todosFactory());
  store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);
    expect(
    values(store.getSlice(TodoSliceEnum.COMPLETE).entries).length
  ).toEqual(1);
});

it("should remove a slice from the store ", () => {
  let store: EStore<Todo> = new EStore<Todo>(todosFactory());
  store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);
  store.removeSlice(TodoSliceEnum.COMPLETE);
    expect(store.getSlice(TodoSliceEnum.COMPLETE)).toBeUndefined();
});

it("should have 2 completed slice elements", () => {
  let store: EStore<Todo> = new EStore<Todo>(todosFactory());

  store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);
  store.post(new Todo(true, "You had me at hello!"));

  let todos$ = store.observe();
    expect(values(store.entries).length).toEqual(3);
  expect(
    values(store.getSlice(TodoSliceEnum.COMPLETE).entries).length
  ).toEqual(2);
});

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

 it("should delete the element", () => {
   let todos = todosFactory();
   let store: EStore<Todo> = new EStore<Todo>(todos);
   store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);
 
   let todo = todos[1];
   store.delete(todo);
     expect(store.contains(todo.gid)).toBeFalsy();
   expect(values(store.selectAll()).length).toEqual(1);
   let slice: Slice<Todo> = store.getSlice(TodoSliceEnum.COMPLETE);
   expect(slice.findOne(todo.gid)).toBeUndefined();
   expect(slice.contains(todo.gid)).toBeFalsy();
 });

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

it("should return an observable count", () => {
  let store: EStore<Todo> = new EStore<Todo>(todosFactory());
  store.count().subscribe(c => {
    expect(c).toEqual(2);
  });
});