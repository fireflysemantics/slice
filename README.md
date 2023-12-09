![Slice](slicelogo.png)

# @fireflysemantics/slice

Lightweight Javascript Reactive State Management for Angular Applications.

If you like the [@fireflysemantics/slice API](https://fireflysemantics.github.io/slice/doc/) please star our [Github Repository](https://github.com/fireflysemantics/slice).

# Install


Install Slice with the `nanoid` peer dependency:

- `v17.0.x` for Angular 17
- `v16.2.x` for Angular 16
- `v15.2.x` for Angular 15

So for example for an Angular 15 project run.

```
npm i @fireflysemantics/slice@15.2.x nanoid
```
For Angular 17 run.

```
npm i @fireflysemantics/slice@lastest nanoid
```

# Usage

## Object Store Core Use Cases

[Here is a link to the Stackblitz Demo](https://stackblitz.com/edit/typescript-9snt67?file=index.ts)
containing all of the below examples. 

In this demo we are using simple `string` values, but we could have used objects or essentially anything that can be referenced by Javascript.

```
import {
  KeyObsValueReset,
  ObsValueReset,
  OStore,
  OStoreStart,
} from '@fireflysemantics/slice';
const START: OStoreStart = {
  K1: { value: 'V1', reset: 'ResetValue' },
};
interface ISTART extends KeyObsValueReset {
  K1: ObsValueReset;
}
let OS: OStore<ISTART> = new OStore(START);

//============================================
// Log a snapshot the initial store value.
// This will log
// V1
//============================================
const v1Snapshot: string = OS.snapshot(OS.S.K1);
console.log(`The value for the K1 key is ${v1Snapshot}`);

//============================================
// Observe the initial store value.
// The subsription will log
// V1
//============================================
OS.S.K1.obs.subscribe((v) => console.log(`The subscribed to value is ${v}`));

//============================================
// Update the initial store value
// The subsription will log
// New Value
//============================================
OS.put(OS.S.K1, 'New Value');

//============================================
// Log a count of the number of entries in the
// object store.
// This will log
// 1
//============================================
const count: number = OS.count();
console.log(
  `The count of the number of entries in the Object Store is  ${count}`
);

//============================================
// Reset the store
// The subsription will log
// ResetValue
//
// However if we had not specified a reset
// value it would have logged in value
// V1
//============================================
OS.reset();

//============================================
// Delete the K1 entry
// The subsription will log and the snapshot
// will also be
// undefined
//============================================
OS.delete(OS.S.K1);
const snapshot: string = OS.snapshot(OS.S.K1);
console.log(`The deleted value snapshot for the K1 key is ${snapshot}`);

//============================================
// Clear the store.  First we will put a new
// value back in the store to demonstrate it
// being cleared.
//============================================
//============================================
// Update the initial store value
// The subsription will log
// New Value
//============================================
OS.put(OS.S.K1, 'V2');

OS.clear();
//============================================
// Count the number of values in the store
// It will be zero.
// The OS.clear() call will remove all the
// entries and so the snapshot will be undefined
// and the subscribed to value also undefined.
// The count will be zero.
//============================================
console.log(`The count is ${OS.count()}`);
console.log(`The snapshot is ${OS.snapshot(OS.S.K1)}`);
```



# Firefly Semantics Slice Development Center Media and Documentation

## Concepts

- [What is Reactive State Management](https://developer.fireflysemantics.com/concepts/concepts--slice--what-is-reactive-state-management)

## Guides

- [An Introduction to the Firefly Semantics Slice Reactive Object Store](https://developer.fireflysemantics.com/guides/guides--introduction-to-the-firefly-semantics-slice-reactive-object-store)
- [Introduction to the Firefly Semantics Slice Reactive Entity Store ](https://developer.fireflysemantics.com/guides/guides--introduction-to-the-firefly-semantics-slice-reactive-entity-store)
- [Creating a Reactive Todo Application With the Firefly Semantics Slice State Manager](https://developer.fireflysemantics.com/guides/guides--slice--creating-a-reactive-todo-application-with-the-firefly-semantics-slice-state-manager)
- [Recreating the Ngrx Demo with Slice](https://developer.fireflysemantics.com/guides/guides--recreating-the-ngrx-demo-app-with-firefly-semantics-slice-state-manager)
- [Firefly Semantics Slice Entity Store Active API Guide](https://developer.fireflysemantics.com/guides/guides--slice--managing-active-entities-with-firefly-semantics-slice)


## Tasks

- [Creating a Minimal Slice Object Store](https://developer.fireflysemantics.com/examples/examples--slice--minimal-slice-object-store)
- [Creating a Minimal Angular Slice Object Store Angular State Service ](https://developer.fireflysemantics.com/examples/examples--slice--minial-angular-slice-object-store-state-service)
- [Changing the Firefly Semantics Slice EStore Default Configuration](https://developer.fireflysemantics.com/tasks/tasks--slice--changing-the-fireflysemantics-slice-estore-default-configuration)
- [Observing the Currently Active Entities with Slice](https://developer.fireflysemantics.com/tasks/tasks--slice--observing-currently-active-entities-with-slice) 
- [Derived Reactive Observable State with Slice](https://developer.fireflysemantics.com/tasks/tasks--slice--derived-reactive-observable-state-with-slice)
- [Reactive Event Driven Actions with Firefly Semantics Slice](https://developer.fireflysemantics.com/tasks/tasks--slice--reactive-event-driven-actions-with-firefly-semantics-slice)
- [Unsubscribing From Firefly Semantics Slice Object Store Observables in Angular](https://developer.fireflysemantics.com/tasks/tasks--slice--unsubscribing-from-firefly-semantics-slice-object-store-observables-in-angular)
- [Creating Proxies to Slice Object Store Observables](https://developer.fireflysemantics.com/tasks/tasks--slice--creating-proxies-to-slice-object-store-observables)
- [Getting a Snapshot of a Slice Object Store Value](https://developer.fireflysemantics.com/tasks/tasks--slice--getting-a-snapshot-of-a-slice-object-store-value)
- [Accessing Slice Object Store Observables In Angular Templates](https://developer.fireflysemantics.com/tasks/tasks--slice--accessing-slice-object-store-observables-in-angular-templates)
- [Observing the Count of Items in a Firefly Semantics Slice Entity Store](https://developer.fireflysemantics.com/tasks/tasks--slice--observing-the-count-of-items-in-a-firefly-semantics-slice-entity-store)
- [Setting and Observing Firefly Semantics Slice Entity Store Queries](https://developer.fireflysemantics.com/tasks/tasks--slice--setting-and-observing-firefly-semantics-slice-entity-store-queries)
- [Taking a Count Snapshot of a Firefly Semantics Slice Entity Store](https://developer.fireflysemantics.com/tasks/tasks--slice--taking-a-count-snapshot-of-a-firefly-semantics-slice-entity-store)
- [Taking a Query Snapshot of a Firefly Semantics Slice Entity Store](https://developer.fireflysemantics.com/tasks/tasks--slice--taking-a-query-snapshot-of-a-firefly-semantics-slice-entity-store)
- [Adding Slices to an Firefly Semantics Slice Entity Store](https://developer.fireflysemantics.com/tasks/tasks--slice--adding-slices-to-the-firefly-semantics-entity-store)
- [Adding Search To the Firefly Semantics Slice Angular Todo Application](https://developer.fireflysemantics.com/tasks/tasks--slice--adding-search-to-the-firefly-semantics-slice-angular-todo-application)
- [Comparing Firefly Semantics Slice Entities](https://developer.fireflysemantics.com/tasks/tasks--slice--comparing-firefly-semantics-slice-entities)
- [Filtering Firefly Semantics Slice Object Store Observables by Property Value](https://developer.fireflysemantics.com/tasks/tasks--slice--filtering-firefly-semantics-slice-object-store-observables-by-property-value)


## Youtube

- [What is Reactive State Management](https://youtu.be/kEta1LBVw0c)
- [An Introduction to the Firefly Semantics Slice Reactive Object Store](https://youtu.be/_3_mEKw3bM0)
- [Introduction to the Firefly Semantics Slice Reactive Entity Store ](https://youtu.be/Boj3-va-TKk)
- [Creating a Reactive Todo Application With the Firefly Semantics Slice State Manager](https://youtu.be/Y3AxSIiBdWg)
- [Recreating the Ngrx Demo with Slice](https://youtu.be/4t95RvJSY_8)
- [Setting and Observing the Firefly Semantics Slice Entity Store Query](https://youtu.be/_L5ya1CWaYU)
- [Observing the Count of Items in a Firefly Semantics Slice Entity Store](https://youtu.be/5kqr_XW2QuI)
- [Taking a Count Snapshot of a Firefly Semantics Slice Entity Store](https://youtu.be/n37sz4LPV08)
- [Taking a Query Snapshot of a Firefly Semantics Slice Entity Store](https://youtu.be/AFk5p0pNxSk)
- [Adding Slices to an Firefly Semantics Slice Entity Store](https://youtu.be/z2U6OTAsc4I)
- [Adding Search To the Firefly Semantics Slice Angular Todo Application](https://youtu.be/OkiBnU3Q6RU)
- [Converting the Angular Todo Application From Materialize to Angular Material](https://youtu.be/GPfF31hwxQk)
- [Firefly Semantics Slice Entity Store Active API Guide](https://youtu.be/fInpMcZ9Ry8)
- [Comparing Firefly Semantics Slice Entities](https://youtu.be/AYc3Pf9fSKg) 
- [Derived Reactive Observable State with Slice](https://youtu.be/eDJkSgYhFIM)

## Examples

- [Minimal Slice Object Store](https://developer.fireflysemantics.com/examples/examples--slice--minimal-slice-object-store)
- [Minimal Angular Slice Object Store State Service](https://developer.fireflysemantics.com/examples/examples--slice--minial-angular-slice-object-store-state-service)

# API Documentation

See [Typedoc API Documentation](https://fireflysemantics.github.io/slice/doc/)

The documentation for the API includes simple examples of how to apply the API to a use case.

# Overview

Lightweight Reactive Server, Mobile, and Web Application State Management Built with `RxJS` and `Typescript`.  

The API is designed to be as minimal as possible and should deliver the same features as other comparable frameworks with about 1/3 the lines of code.

It offers two types of reactive data stores:
- Entity stores (EStore<E>) for structured entity like data (Customer, Product, User, ...)
- Entity stores can be "Live filtered" by adding slices.  For example separating Todo entities into complete and incomplete compartments.  Slices are also obserable.
- Object store (Key value store) for unstructured data

Even though Angular is used for prototype applications, it should work well for:
- Single page applications
- Progressive web applications
- React applications
- Node applications / Pure Javascript Applications
- Mobile Applications

## Build

Run `npm run c` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Jest](https://jestjs.io/).


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

## Tests

See the [test cases](https://github.com/fireflysemantics/slice/).