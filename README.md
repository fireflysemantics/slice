[![Build Status](https://travis-ci.org/fireflysemantics/slice.svg?branch=master)](https://travis-ci.org/fireflysemantics/slice)

![Slice](logo/slicelogo.png)

# Firefly Semantics Slice Development Center Documentation

- [A Guide to the Firefly Semantics Slice Reactive Object Store](https://developer.fireflysemantics.com/guides/guides--a-guide-to-the-firefly-semantics-slice-object-store)
- [Introduction to the Firefly Semantics Slice Reactive Entity Store ](https://developer.fireflysemantics.com/guides/guides--introduction-to-the-firefly-semantics-slice-reactive-entity-store)
- [Recreating the Ngrx Demo with Slice](https://developer.fireflysemantics.com/guides/guides--recreating-the-ngrx-demo-app-with-firefly-semantics-slice-state-manager)
- [Changing the Firefly Semantics Slice EStore Default Configuration](https://developer.fireflysemantics.com/tasks/tasks--slice--changing-the-fireflysemantics-slice-estore-default-configuration)

# API Documentation

See [Typedoc API Documentation](https://fireflysemantics.github.io/slice/doc/)

The documentation for the API includes simple examples of how to apply the API to a use case.

# Install

Install Slice with peer dependencies:

```
npm i @fireflysemantics/slice tslib rxjs nanoid
```

# Features

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

# Stackblitz Todo Entity Store Demo

https://stackblitz.com/edit/slice-todo-1329

## Tests

See the [test cases](https://github.com/fireflysemantics/slice/).