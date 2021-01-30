[![Build Status](https://travis-ci.org/fireflysemantics/slice.svg?branch=master)](https://travis-ci.org/fireflysemantics/slice)

![Slice](logo/slicelogo.png)

# Development Center

- [Recreating the Ngrx Demo with Slice](https://developer.fireflysemantics.com/guides/guides--recreating-the-ngrx-demo-app-with-firefly-semantics-slice-state-manager)


# Install

Install Slice with peer dependencies:

```
npm i @fireflysemantics/slice tslib rxjs nanoid
```

# Use

## OStore

https://medium.com/@ole.ersoy/slice-ostore-observables-bound-to-ostore-keys-aa3c56a76c8c

New documentation coming soon.


## EStore

Variable free access to the observable via EStore.observable:

```
test('the observable reference works', done => {

  let store: EStore<Todo> = new EStore<Todo>(todosFactory());
  expect(store.entries.size).toEqual(2);
  store.observable.subscribe(todos=>{
    expect(todos.length).toEqual(2);  
  })  
  done();
})

```

# Live Demos

## FS ALPHA

Slice Drives the Authentication, Stepper, and all
other UI state:

https://fsalpha.fireflysemantics.com/welcome

## Documentation Center

Documentation categories (Concepts, Tasks, Guides) 
are stored in slices:

https://help-service-parts.fireflysemantics.com/

## Stackblitz Todo Entity Store Demo

https://stackblitz.com/edit/slice-todo

# @fireflysemantics/slice

Lightweight Web Application State Management Built with `RxJS` and `Typescript` for creating central updates / `Observable` notifcations for Javascript applications.  

The API is designed to be as minimal as possible and should deliver the same features as other comparable frameworks with about 1/3 the lines of code.

It offers two types of reactive data stores:
- Entity stores for structured entity like data (Customer, Product, User, ...)
- Object store (Key value store) for unstructured data

Even though Angular is used for prototype applications, it should work well for:
- Single page applications
- Progressive web applications
- React applications
- Node applications / Pure Javascript Applications
- Mobile Applications

### Entity Stores

[Todo application Demo](https://stackblitz.com/edit/slice-todo).

For `Entity` data (Structured class based types such as `Todo`,  `Product` or `Customer`) Slice provides a `EStore<E>` type.  

Add all the Entity instances that you wish to track to the store and retrieve `Observable<E[]>` instances by calling `EStore.observe()` or `EStore.observe(sortFn)`.  

The `EStore<E>` implementation returns RxJS `Observable` references which can be used to update the visual state of your application.

All entities have a configurable property that is assigned a [GUID](https://en.wikipedia.org/wiki/Universally_unique_identifier)
at the time the entity is posted to the store.  The [GUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) id should be considered immutable
and should be kept over the entities life time until it is permanently deleted from the world.  This is done in order to facilitate:
- Indexing / Lookup by id
- Comparison of entities 
- CRUD operations on individual entities

The `EStore<E>` also supports an additional configurable `id` property that can be assigned by an external persistance store, such as a database, and this `id` could change over the lifetime of the entity.  

For the full API see the [Slice Typedoc API Documentation](https://fireflysemantics.github.io/slice/doc/).

### Object Stores

The `OStore` class is for data that is not structured.  It stores `key values` pairs, and is great for tracking things like the user session or the value of a `select` user interface component.

This is a [minimal object store demo](https://stackblitz.com/edit/slice-filter) that logs the selected value to the console.

For the full API see the [Slice Typedoc API Documentation](https://fireflysemantics.github.io/slice/doc/).

Related blog articles:
- [Storing Reactive Layout State in Slice](https://medium.com/@ole.ersoy/storing-reactive-layout-state-in-slice-dbc7fb09850c)

## Blog

- [Recreating the Ngrx Demo with Slice](https://medium.com/@ole.ersoy/recreating-the-ngrx-demo-app-with-the-firefly-semantics-slice-state-manager-f2e4e4b30ec0)

- [All Slice State Manager Blog Posts](https://medium.com/@ole.ersoy/all-slice-state-manager-blog-posts-2096a412e58d)


Lets assume we want to track two `Todo` instances.  One `Todo` that is complete and one that is incomplete.  We can do that with the following setup:

```
// Create an enum to key slices
export const enum TodoSlices {
  COMPLETE = "Complete",
  INCOMPLETE = "Incomplete"
}

//The Todo model
export class Todo {
  constructor(public complete: boolean, public title: string, public gid?: string) {}
}

//Sample data
let todoIncomplete:Todo = new Todo(false, "You complete me!")
let todoComplete = new Todo(true, "You completed me!");
export let todos = [todoIncomplete, todoComplete];
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
   let todos$:Observable<Todo[]> = store.observe(sort);
```

For a count `Observable<number>` of store instances:
```
   let todosCount$:Observable<number> = store.count();
```

Check if the store is empty `Observable<boolean>`:
```
   let todosCount$:Observable<boolean> = store.empty();
```

Observe a slice:
```
  let todosComplete$ = store.getSlice(TodoSlices.COMPLETE).observe();
```


Reset the store and all slices contained by it (Also triggers notification to all observers):
```
  store.reset();
```


### Store Slicing

Slice the store by calling `addSlice()`.  For example suppose we wish to 
create a live filter selecting all 
`Todo` instances that are complete.

```
todoStore.addSlice(todo => todo.complete, TodoSlices.COMPLETE);

```

### Create an `@Injectable` Service for Store Access in Angular

Having an injectable service is not required to use Slice, but this 
is how it can be done with Angular;

```
@Injectable({
  providedIn: 'root'
})
export class TodoService {

  public todoStore:EStore<Todo> = new EStore<Todo>();
}
```

Now the Application has both direct store access and it can use the API that the service provides to wrap the store with additional operations like querying, counting, etc.

For more examples (Additional CRUD API examples, receiving delta updates, etc.) see the [test cases](https://github.com/fireflysemantics/slice/) and [Slice Typedoc API Documentation](https://fireflysemantics.github.io/slice/doc/).

## Build

Run `npm run c` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Jest](https://jestjs.io/).

## Data Manipulation and Searching

  The core API is tiny and the intention is to delegate DML (Data Manipulation Language) to pure javascript, RxJS, and if more super powers are needed use something like [Sift](https://www.npmjs.com/package/sift).

For example a snapshot of all entities can be retrieved via `store.selectAll()` and this array could then be processed by [Sift](https://www.npmjs.com/package/sift).  [Sift](https://www.npmjs.com/package/sift) or [lodash](https://lodash.com/) could also complement real time capabilities provided by RxJS when used in a live stream context.

For very large data sets, more advanced filtering, and persistance save tables to Indexeddb via Dexie.  We will be producing tutorials on how to do this soon, but here's the first installment:
- [Many to Many Relationships with DexieJS](https://medium.com/@ole.ersoy/many-to-many-relationships-with-dexiejs-753b8e305d4e)
  
As can be seen it is very easy to save and retrieve entities with DexieJS and no directly coupling to the Slice state manager is necessary.  For more Typescript one to many exmaples se the DexieJS Typescript documentation:
- [DexieJS Typescript Documentation](https://dexie.org/docs/Typescript)

## Features

- Live Stackblitz demoes
- [Typedoc with inlined examples](https://fireflysemantics.github.io/slice/doc/)
- [Well documented test cases run with Jest - Each file has a corresponding `.spec` file](https://github.com/fireflysemantics/slice/tree/master/src)
- Stream both Entity and Object Stores for UI Updates via RxJS
- Define entities using Typescript classes, interfaces, or types
- [Active state tracking](https://medium.com/@ole.ersoy/monitoring-the-currently-active-entity-with-slice-ff7c9b7826e8)
- [Supports for Optimistic User Interfaces](https://medium.com/@ole.ersoy/optimistic-user-identity-management-with-slice-a2b66efe780c)
- RESTful API for performing CRUD operations that stream both full and delta updates
- Dynamic creation of both object and entity stores
- Observable delta updates for Entities
- Real time application of Slice `Predicate<E>` filtering that is `Observable`
- `Predicate` based snapshots of entities
- Observable `count` of entities in the entity store.  The `count` feature can also be `Predicate` filtered.
- Configurable global id (Client side id - `gid`) and server id (`id`) id property names for entities. 
- The stream of entities can be sorted via an optional boolean expression passed to `observe`.
- Easily integrates with services such as [AWS Amplify Hub API](https://aws-amplify.github.io/docs/js/hub)


## Tests

See the [test cases](https://github.com/fireflysemantics/slice/).

## API Documentation

See [Typedoc API Documentation](https://fireflysemantics.github.io/slice/doc/)