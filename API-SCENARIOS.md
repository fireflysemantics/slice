# Developer Stories

## Reset

Scenario: The client needs reset the store to empty

Given that the client has an `EStore` or `OStore` instance
Then the client can call `reset` on the instance to completely
empty the store 
And notify all observers.

## Throwaway / Dynamic Entity Stores 

Scenario: The client needs to throwaway the store and instantiate a new one

Given that the client has a new set of entities that are mutually exclusive
froma previous set, the client wishes to throwaway the current entity store
and place the new set in a new `EStore` while also updating the application observers with the new entity set.

## Loading

Scenario: The client needs marker state indicating that it is waiting for entities that are inflight

Given that the client has initiated a request for data and is waiting for it to arrive
Then the client can set `loading` to true on the `EStore` 

## Active

Scenario: The client needs to indicate which entity is active.

Given that user has selected an entity in the ui 
Then the client can set `active` on the `EStore` instance.

## Presentation 

Scenario: The client has a presentation component that interfaces with an entity store

Given that the presentation component injects the service containing the store
Then the presentation component can retrieve `Observable` instances that trigger updates to the components presentation.


## Search

Scenario: The client needs to search the store for entities that a `Predicate<E>` match.

Given that the container component injects the service containing the store
Then the client can pass in a `Predicate<E>` that is used to filter entities 
And return them.

Example:

```
  search = new FormControl();
  this.entities$ = this.search.valueChanges.pipe(
    startWith(''),
    switchMap(value => this.entityService.store.select(entity => entity.title.toLowerCase().includes(value));
    }))
  );
}
```

