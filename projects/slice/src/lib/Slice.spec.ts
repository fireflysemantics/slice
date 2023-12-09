import { Slice } from "./Slice"
import { EStore } from "./EStore"
import { ESTORE_CONFIG_DEFAULT } from "./AbstractStore"
import { TodoSliceEnum } from "./test-setup"
import { Todo, todosFactory } from "./test-setup"
import { attachGUIDs, attachGUID } from './utilities'
import { Observable } from 'rxjs'

let store = new EStore<Todo>(todosFactory())

let completeSlice = new Slice<Todo>(
  TodoSliceEnum.COMPLETE,
  todo => todo.complete,
  store
);

let incompleteSlice = new Slice<Todo>(
  TodoSliceEnum.INCOMPLETE,
  todo => !todo.complete,
  store
);

describe("Creating a slice", () => {
  it("should have 1 incomplete todo element", () => {
    expect(incompleteSlice.entries.size).toEqual(1);
  });
  it("should have complete todo element", () => {
    expect(incompleteSlice.entries.size).toEqual(1);
  });
});

describe("Subscribing to a slice", () => {
  it("should have 1 incomplete todo element", () => {
    let incomplete$ = incompleteSlice.observe();
    incomplete$.subscribe((todos: Todo[]) => {
      expect(todos.length).toEqual(1);
      expect(todos[0].complete).toBeFalsy();
    });
  });
  it("should have 1 complete todo element", () => {
    let complete$ = completeSlice.observe();
    complete$.subscribe((todos: Todo[]) => {
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
    let store = new EStore<Todo>([])

    const slice = new Slice<Todo>(TodoSliceEnum.COMPLETE, todo => todo.complete, store);
    slice.isEmpty().subscribe(empty => {
      expect(empty).toBeTruthy();
    });
  });

  it("should not be empty", () => {
    let store = new EStore<Todo>([])
    const slice = new Slice<Todo>(TodoSliceEnum.COMPLETE, todo => todo.complete, store);
    slice.post(new Todo(true, "You completed me!", "1"));
    slice.isEmpty().subscribe(empty => {
      expect(empty).toBeFalsy();
    });
  });
});

describe("Select slice elements", () => {
  it("should select the the right instance by GUID", () => {
    let todo = [new Todo(false, "You complete me!")];
    let store = new EStore<Todo>(todo)

    let id: string = (<any>todo[0])[ESTORE_CONFIG_DEFAULT.guidKey];

    const slice = new Slice<Todo>(
      TodoSliceEnum.INCOMPLETE,
      todo => !todo.complete,
      store
    );

    let selectedTodo: Todo = slice.findOne(id)!;
    expect(selectedTodo).toEqual(todo[0]);
  });

  it("should select slice element by predicate", () => {
    let todo1 = new Todo(false, "You complete me!");
    let todo2 = new Todo(false, "You had me at hello!");
    let todos = [todo1, todo2];
    let store = new EStore<Todo>(todos)
 
    const slice = new Slice<Todo>(
      TodoSliceEnum.INCOMPLETE,
      todo => !todo.complete,
      store
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
    let store = new EStore<Todo>(todos)

    const slice = new Slice<Todo>(
      TodoSliceEnum.INCOMPLETE,
      todo => !todo.complete,
      store
    );
    let selectedTodos: Todo[] = slice.allSnapshot();
    expect(selectedTodos.length).toEqual(2);
  });

  it("should only notify once when adding a todo to a slice observable", () => {
    class Todo {
      gid!: string;
      constructor(public title: string, public completed: boolean) { }
    };

    /**
     * The Slice Keys
     */
    const enum TodoSliceEnum {
      COMPLETE = "Complete",
      INCOMPLETE = "Incomplete"
    }

    const todoStore: EStore<Todo> = new EStore<Todo>();

    todoStore.addSlice(todo => todo.completed, TodoSliceEnum.COMPLETE);
    todoStore.addSlice(todo => !todo.completed, TodoSliceEnum.INCOMPLETE);

    const completeTodos$: Observable<Todo[]> = todoStore.getSlice(TodoSliceEnum.COMPLETE)!.observe()
    const incompleteTodos$: Observable<Todo[]> = todoStore.getSlice(TodoSliceEnum.COMPLETE)!.observe()

    const completeSubscription = completeTodos$.subscribe(todo => console.log(`Completed Todo ${JSON.stringify(todo)})`))
    const incompleteSubscription = incompleteTodos$.subscribe(todo => console.log(`Complete Todo ${JSON.stringify(todo)})}`))

    const incompleteTodo = new Todo('complete this', false)
    const completeTodo = new Todo('You completed me', true)

    todoStore.post(incompleteTodo);
    todoStore.post(completeTodo);

    completeSubscription.unsubscribe()
    incompleteSubscription.unsubscribe()
  });
});