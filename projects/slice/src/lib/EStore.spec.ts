import { Todo, TodoSliceEnum, todosFactory } from "./test-setup"
import { GUID, search } from './utilities'
import { EStore } from "./EStore"
import { Slice } from "./Slice"
import { Observable } from "rxjs"

const { values } = Object;

/**
 * CONCERN: Store Initialization
 * METHODs: `constructor`
 */
it("should constructor initialize the store", () => {
  let store: EStore<Todo> = new EStore<Todo>(todosFactory());
  expect(store.entries.size).toEqual(2);
});

it('should show that the observable reference works', done => {
  let store: EStore<Todo> = new EStore<Todo>(todosFactory());
  expect(store.entries.size).toEqual(2);
  store.obs.subscribe(todos => {
    expect(todos.length).toEqual(2);
    done();
  })
})

/**
 * CONCERN: Utility API
 * METHODS: `findOne`. 
 */
 it("should findOne", () => {
  let todoOrNotTodo = new Todo(false, "This is not in the store", '1');
  let store: EStore<Todo> = new EStore<Todo>();
  store.post(todoOrNotTodo);
  expect(store.findOne('1')!.complete).toBeFalsy();
  expect(store.findOne('1')!.gid).toEqual('1');
});

/**
 * CONCERN: Utility API
 * METHODS: `findOneByID`. 
 */
it("should findByID", () => {
  let todoOrNotTodo = new Todo(false, "This is not in the store", '1');
  let todoOrNot = new Todo(false, "This is not in the store", '2');
  todoOrNotTodo.id = '1';
  todoOrNot.id = '2';
  let store: EStore<Todo> = new EStore<Todo>();
  store.post(todoOrNotTodo);
  expect(store.findOneByID('1')!.complete).toBeFalsy();
  expect(store.findOneByID('1')!.id).toEqual('1');
  store = new EStore<Todo>();
  store.postA([todoOrNotTodo, todoOrNot]);
  expect(store.findOneByID('1')!.complete).toBeFalsy();
  expect(store.findOneByID('1')!.id).toEqual('1');
  expect(store.findOneByID('2')!.id).toEqual('2');
  store = new EStore<Todo>();
  store.postN(todoOrNotTodo, todoOrNot);
  expect(store.findOneByID('1')!.complete).toBeFalsy();
  expect(store.findOneByID('1')!.id).toEqual('1');
  expect(store.findOneByID('2')!.id).toEqual('2');
});


/**
 * CONCERN: Utility API
 * PROPERTY: `loading`
 */
it("should toggle the loading indicator and make it observable", (done) => {
  let store: EStore<Todo> = new EStore<Todo>();
  store.loading = true;
  expect(store.loading).toBeTruthy();
  store.loading = false;
  expect(store.loading).toBeFalsy();
  store.loading = true;
  let l: Observable<boolean> = store.observeLoading();
  l.subscribe(loading => {
    expect(loading).toEqual(true);
    done()
  });
});


/**
 * CONCERN: Utility API
 * PROPERTY: `searching`
 */
it("should toggle the searching indicator and make it observable", (done) => {
  let store: EStore<Todo> = new EStore<Todo>();
  store.searching = true;
  expect(store.searching).toBeTruthy();
  store.searching = false;
  expect(store.searching).toBeFalsy();
  store.searching = true;
  let l: Observable<boolean> = store.observeSearching();
  l.subscribe(searching => {
    expect(searching).toEqual(true);
    done()
  });
});

/**
 * CONCERN: Active State
 * METHODS: `addActive` and `deleteActive`. 
 */
it("should add and delete active state", () => {
  let store: EStore<Todo> = new EStore<Todo>();
  expect(store.active.size).toEqual(0);
  let todo1: Todo = new Todo(false, "The first Todo!", GUID());
  let todo2: Todo = new Todo(false, "The first Todo!", GUID());
  //Will add the entity if it's not contained in the store.
  store.addActive(todo1);
  expect(store.active.size).toEqual(1);
  expect(store.activeSnapshot().length).toEqual(1)
  store.post(todo1);
  store.post(todo2);
  store.addActive(todo1);
  expect(store.active.size).toEqual(1);
  store.addActive(todo2);
  let a: Observable<Map<string, Todo>> = store.observeActive();
  let s = a.subscribe(active => {
    expect(active.get(todo1.gid!)).toEqual(todo1);
    expect(active.get(todo2.gid!)).toEqual(todo2);
  });
  s.unsubscribe();
  store.deleteActive(todo1);
  expect(store.active.size).toEqual(1);
  store.deleteActive(todo2);
  expect(store.active.size).toEqual(0);
  expect(store.entries.size).toEqual(2);
});


/**
 * CONCERN: Utility API
 * METHODS: `toggle`. 
 */
it("should toggle elements", () => {
  let store: EStore<Todo> = new EStore<Todo>(todosFactory());
  let todoOrNotTodo = new Todo(false, "This is not in the store", '1');
  store.toggle(todoOrNotTodo);
  expect(store.entries.size).toEqual(3);
  expect(store.contains(todoOrNotTodo)).toBeTruthy();
  store.toggle(todoOrNotTodo);
  expect(store.entries.size).toEqual(2);
  expect(store.contains(todoOrNotTodo)).toBeFalsy();
  store.toggle(todoOrNotTodo);
  expect(store.entries.size).toEqual(3);
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
  expect(store.contains(todo0.gid!)).toBeTruthy();
  expect(store.contains(todo1.gid!)).toBeTruthy();
  expect(store.contains(todoOrNotTodo)).toBeFalsy();
  expect(store.contains(todoOrNotTodo.gid!)).toBeFalsy();
});

/**
 * CONCERN: Utility API
 * METHODS: `containsByID`. 
 */
it("should return true when the store contains the entity and false otherwise", () => {
  let todoByID = new Todo(false, "This is not in the store", undefined, '1');
  let todoByIDAlso = new Todo(false, "This is not in the store", undefined, '2');
  let store: EStore<Todo> = new EStore<Todo>();
  store.post(todoByID);
  expect(store.containsById(todoByID)).toBeTruthy();
  expect(store.containsById(todoByIDAlso)).toBeFalsy();
});


/**
 * CONCERN: Live Count
 * METHODS: `count`. 
 */
it("should return an observable count", (done) => {
  let store: EStore<Todo> = new EStore<Todo>(todosFactory());
  store.count().subscribe(c => {
    expect(c).toEqual(2);
    done()
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
  expect(store.getSlice(TodoSliceEnum.COMPLETE)!.contains(todo)).toBeTruthy();
  expect(store.idEntries.size).toEqual(2);
  store.delete(todo);
  //The slice no longer contains todo
  expect(store.contains(todo.gid!)).toBeFalsy();
  expect(values(store.allSnapshot()).length).toEqual(1);
  let slice: Slice<Todo> = store.getSlice(TodoSliceEnum.COMPLETE)!;
  expect(slice.findOne(todo.gid!)).toBeUndefined();
  expect(slice.contains(todo.gid!)).toBeFalsy();
  //The todo is not in active state
  expect(store.active.get(todo.gid!)).toBeUndefined();
  //The todo should be deleted from the `idEntries` array
  expect(store.idEntries.size).toEqual(1);
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
  expect(store.idEntries.size).toEqual(2);
  store.deleteN(...todos);
  expect(store.isEmptySnapshot()).toBeTruthy();
  expect(store.idEntries.size).toEqual(0);
  //deleteP
  store.reset();
  expect(store.isEmptySnapshot()).toBeTruthy();
  store.postA(todos);
  expect(store.idEntries.size).toEqual(2);
  store.deleteP((e: Todo) => !e.complete);
  expect(store.idEntries.size).toEqual(1);
  expect(store.isEmptySnapshot()).toBeFalsy();
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
 * METHODS: `findOneByID`. 
 */
it("should add a slice to the store be created with 1 complete todo element", () => {
  let store: EStore<Todo> = new EStore<Todo>(todosFactory());
  store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);
  expect(
    store.getSlice(TodoSliceEnum.COMPLETE)!.entries.size
  ).toEqual(1);
});

/**
 * CONCERN: Live filtering
 * METHODS: `getSlice` and `removeSlice`
 * DESIGN CONSIDERATIONS:
 * Removing a Slice does not remove entities from the cenral store.
 */

it("should have the right slice count", (done) => {
  let store: EStore<Todo> = new EStore<Todo>();
  store.postA(todosFactory());
  expect(store.isEmptySnapshot()).toBeFalsy();
  store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);
  let slice = store.getSlice(TodoSliceEnum.COMPLETE)!;
  expect(slice.isEmptySnapshot()).toBeFalsy();
  slice.count()
    .subscribe(c => {
      expect(c).toEqual(1);
      done()
    });
  //Remove the slice
  store.removeSlice(TodoSliceEnum.COMPLETE);
  expect(store.getSlice(TodoSliceEnum.COMPLETE)).toBeUndefined();
  //No entries were deleted from the store.
  expect(store.entries.size).toEqual(2);

  //should have 2 completed slice elements
  store.reset();
  store.postA(todosFactory());

  store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);
  store.post(new Todo(true, "You had me at hello!"));

  expect(store.entries.size).toEqual(3);
  expect(
    store.getSlice(TodoSliceEnum.COMPLETE)!.
      entries.size).toEqual(2)
}, 1500);



/**
 * METHODS: isEmpty()
 * DESIGN CONSIDERATIONS
 * `isEmpty` and `count` should both 
 * work on slices as well.  
 */
 it("should reflect the stores is empty", (done) => {
  let store: EStore<Todo> = new EStore<Todo>();
  store.isEmpty().subscribe(empty => {
    expect(empty).toBeTruthy();
    done()
  });
});

it("should reflect the count is zero", (done) => {
  let store: EStore<Todo> = new EStore<Todo>();
  store.count().subscribe(c => {
    expect(c).toEqual(0);
    done()
  });
});


it("should have an empty slice", (done) => {
  let store: EStore<Todo> = new EStore<Todo>();
  store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);
  const empty:Observable<boolean> = store.getSlice(TodoSliceEnum.COMPLETE)!.isEmpty();
  empty.subscribe(e=>{
        expect(e).toBeTruthy()
        done()
      })
  });

  it("should have a zero slice count", (done) => {
    let store: EStore<Todo> = new EStore<Todo>();  
    store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);
    store
    .getSlice(TodoSliceEnum.COMPLETE)!
    .count()
    .subscribe(c => {
      expect(c).toEqual(0);
      done()
    });
  });

  it("should not have an empty store", (done) => {
    let store: EStore<Todo> = new EStore<Todo>();
    store.postA(todosFactory());

    store.isEmpty().subscribe(empty => {
      expect(empty).toBeFalsy();
      done()
    });
  });

  it("should not have an updated store count", (done) => {
    let store: EStore<Todo> = new EStore<Todo>();
    store.postA(todosFactory());

    store.count().subscribe(c => {
      expect(c).toEqual(2);
      done()
    });
  });

  it("should not have an updated store predicate count", (done) => {
    let store: EStore<Todo> = new EStore<Todo>();
    store.postA(todosFactory());

    store.count(todo => todo.complete).subscribe(c => {
      expect(c).toEqual(1);
      done()
    });
  });
    
  it("should not have an empty slice", (done) => {
    let store: EStore<Todo> = new EStore<Todo>();
    store.postA(todosFactory());
    
    store.addSlice(todo => todo.complete, TodoSliceEnum.COMPLETE);
    let s: Slice<Todo> = store.getSlice(TodoSliceEnum.COMPLETE)!;
    s.isEmpty().subscribe(empty => {
      expect(empty).toBeFalsy();
      done()
    });
});