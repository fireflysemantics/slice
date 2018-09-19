[![Build Status](https://travis-ci.org/fireflysemantics/slice.svg?branch=master)](https://travis-ci.org/fireflysemantics/slice)

# @fireflysemantics/slice

Lightweight Angular state management

## Introduction

This is a lightweight minimal API built on top of `RxJS` for creating central updates / `Observable` notifcations for Javascript applications.  It's targeted at Angular, but should work well for other frameworks, single page applications, and progressive web applications as well.  CRUD operations are performing using a REST like API (POST, PUT, DELETE).  We use `observe()` in order to observe stores, instead of the REST method `GET`, as `observe()` captures the intent of getting real time notification updates better.  

### Entity Stores

For `Entity` data (Structured class based types such as `Product` or `Customer`) Slice provides a `EStore<E>` type.  Add all the Entity instances that you wish to track to the store and retrieve `Observable<E[]>` instances by calling `EStore.observe()` or `EStore.observe(sortFn)`.  The `EStore<E>` implementation returns `Observable` references which can be used to update the visual state of your application. 

### Object Stores

The `OStore` class is for data that is not structured.  It stores `key values` pairs, and is great for tracking things like the user session or the value of a `select` user interface component.

## Usage

Lets assume we want to track two `Todo` instances.  One `Todo` that is complete and one that is incomplete.  We can do that with the following setup:

```
// Create an enum to key slices
export const enum TodoSlices {
  COMPLETE = "Complete",
  INCOMPLETE = "Incomplete"
}

//The Todo model
export class Todo {
  constructor(public complete: boolean, public title: string) {}
}

//Sample data
let todoIncmplete:Todo = new Todo(false, "You complete me!")
let todoComplete = new Todo(true, "You completed me!");
export let todos = [todoIncmplete, todoCmplete];
```

### Store Creation

```
let todoStore:EStore<Todo> = new EStore<Todo>();
```

### Store Initialization

```
let todoStore:EStore<Todo> = new EStore<Todo>(todos);
```
or 

```
todoStore.postA(todos);
```

or

```
todoStore.postN(todoComplete, todoIncomplete);
```

or

```
todoStore.post(todoComplete);
todoStore.post(todoIncomplete);
```

### Add More Todos

```
todoStore.post(new Todo(false, "Massive Todo!");
```

### Observe the Store

For an `Observable<E[]>` instance that tracks updates to the store as a whole:

```
  let todos$:Observable<Todo[]> = store.observe();
```

For a sorted `Observable<E[]>` instance that tracks the store as a whole:
```
   let sort: (a:Todo, b:Todo)=>number =  (a, b)=>(a.title > b.title ? -1 : 1);
   let todos3$:Observable<Todo[]> = store.observe(sort);
```

Observe a slice:
```
  let todosComplete$ = store.getSlice(TodoSlices.COMPLETE).observe();

```

### Store Slicing

Slice the store by calling `addSlice()`.  For example suppose we wish to 
create a live filter selecting all 
`Todo` instances that are complete.

```
todoStore.addSlice(todo => todo.complete, TodoSlices.COMPLETE);

```

## Create an `@Injectable` Service for Store Access in Angular

```
@Injectable({
  providedIn: 'root'
})
export class TodoService {

  public todoStore:EStore<Todo> = new EStore<Todo>();
}
```

Now the Application has both direct store access and it can use the API that the service provides to wrap the store with additional operations like querying, counting, etc.

For more examples (Additional CRUD API examples, receiving delta updates, etc.) see the [test cases](https://github.com/fireflysemantics/slice/) and [Typedoc API Documentation](https://fireflysemantics.github.io/slice/doc/).

## Entity Identification

The Slice implementations uses a Javascript `Symbol` to identify all entities and track them via a [GUID](https://betterexplained.com/articles/the-quick-guide-to-guids/).  That means your domain model theoretically does not need an `id` property to track entities, and you can choose to add one if you wish.  

It also means that the domain model is not tied in any way to the [`@fireflysemantics/slice`](https://www.npmjs.com/package/@fireflysemantics/slice) package.  As this is the case, 
the domain model can more easily be used in multiple contexts and shared by different parties more fluidly.

Using a [GUID](https://betterexplained.com/articles/the-quick-guide-to-guids/) also makes entity comparison very simple.  Just compare the `GUID`s and if they are equal the entities are equal.  The `GUID` is your entities social security number.  It stays with the entity over it's application lifetime, and we recommend persisting it by attaching it a model property when persisting the model.  You may map the `GUID` to an `id` field on the entity, or if you wish to use that field for another identifier, put the `GUID` in a `guid` field.  This way the entity has an identifier that never changes.

## Tests

See the [test cases](https://github.com/fireflysemantics/slice/).

## API Documentation

See [Typedoc API Documentation](https://fireflysemantics.github.io/slice/doc/)