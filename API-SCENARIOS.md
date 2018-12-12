# Developer Stories

## Reset

Scenario: The client needs reset the store to empty

Given that the client has an `EStore` or `OStore` instance
Then the client can call `reset` on the instance to completely
empty the store 
And notify all observers.

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

