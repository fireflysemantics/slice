import { Slice } from "./Slice";
import { StoreConfig, STORE_CONFIG_DEFAULT } from "./EStore";
import { TodoSliceEnum } from "@test/setup";
import { Todo, todosFactory, attachGUIDs, attachGUID } from "@test/setup";

let todos = todosFactory();
attachGUIDs(todos);
let c = STORE_CONFIG_DEFAULT;

let completeSlice = new Slice<Todo>(
  TodoSliceEnum.COMPLETE,
  todo => todo.complete,
  null,
  todos
);

let incompleteSlice = new Slice<Todo>(
  TodoSliceEnum.INCOMPLETE,
  todo => !todo.complete,
  null,
  todos
);

describe("Creating a slice", () => {
  it("should have 1 incomplete todo element", () => {
    expect(Object.keys(incompleteSlice.entries).length).toEqual(1);
  });
  it("should have complete todo element", () => {
    expect(Object.keys(incompleteSlice.entries).length).toEqual(1);
  });
});

describe("Subscribing to a slice", () => {
  it("should have 1 incomplete todo element", () => {
    let incomplete$ = incompleteSlice.observe();
    incomplete$.subscribe((todos:Todo[]) => {
      expect(todos.length).toEqual(1);
      expect(todos[0].complete).toBeFalsy();
    });
  });
  it("should have 1 complete todo element", () => {
    let complete$ = completeSlice.observe();
    complete$.subscribe((todos:Todo[]) => {
      expect(todos.length).toEqual(1);
      expect(todos[0].complete).toBeTruthy();
    });
  });
});

describe("Subscribing for slice delta updates", () => {
  it("should have 1 incomplete todo element", () => {
    let incomplete$ = incompleteSlice.observeDelta();
    incomplete$.subscribe(delta => {
      expect(delta.entries.length).toEqual(1);
      expect(delta.entries[0].complete).toBeFalsy();
    });
  });
  it("should have 1 complete todo element", () => {
    let complete$ = completeSlice.observeDelta();
    complete$.subscribe(delta => {
      expect(delta.entries.length).toEqual(1);
      expect(delta.entries[0].complete).toBeTruthy();
    });
  });
});

describe("Checking whether the slice is empty", () => {
  it("should be empty", () => {
    const slice = new Slice<Todo>(TodoSliceEnum.COMPLETE, todo => todo.complete);
    slice.isEmpty().subscribe(empty=>{
      expect(empty).toBeTruthy();
    });    
  });
  it("should not be empty", () => {
    const slice = new Slice<Todo>(TodoSliceEnum.COMPLETE, todo => todo.complete);
    slice.add(new Todo(true, "You completed me!", "1"));
    slice.isEmpty().subscribe(empty=>{
      expect(empty).toBeFalsy();
    });    
  });
});

describe("Select slice elements", () => {
  it("should select the the right instance by GUID", () => {
    let todo = new Todo(false, "You complete me!");
    attachGUID(todo);

    let id: string = (<any>todo)[c.guidKey];

    const slice = new Slice<Todo>(
      TodoSliceEnum.INCOMPLETE,
      todo => !todo.complete,
      null,
      [todo]
    );

    let selectedTodo: Todo = slice.findOne(id);
    expect(selectedTodo).toEqual(todo);

  });
  it("should select slice element by predicate", () => {
    let todo1 = new Todo(false, "You complete me!");
    let todo2 = new Todo(false, "You had me at hello!");
    let todos = [todo1, todo2];
    attachGUIDs(todos);

    const slice = new Slice<Todo>(
      TodoSliceEnum.INCOMPLETE,
      todo => !todo.complete,
      null,
      todos
    );
    let selectedTodos: Todo[] = slice.select(todo =>
      todo.title.includes("hello")
    );
    expect(selectedTodos[0]).toEqual(todo2);
  });
  it("should select all slice elements", () => {
    let todo1 = new Todo(false, "You complete me!");
    let todo2 = new Todo(false, "You had me at hello!");
    let todos = [todo1, todo2];
    attachGUIDs(todos);

    const slice = new Slice<Todo>(
      TodoSliceEnum.INCOMPLETE,
      todo => !todo.complete,
      null,
      todos
    );
    let selectedTodos: Todo[] = slice.selectAll();
    expect(selectedTodos.length).toEqual(2);
  });
});