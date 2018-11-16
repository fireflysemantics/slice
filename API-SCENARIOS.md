# Developer Stories

## Store Initialization 

Scenario: The client needs a reactive store for entities.

Given an client that will reactively manage a set of entities
When the developer uses the `EStore` constructor to create a new store
And an array of entities are passed to the store
Then the store initialized with the entities
And is ready to emit the entities when subscribers subscribe to the store

Scenario: The client needs a reactive store for objects.

Given a client that will reactively manage objects
When the developer uses the `OStore` constructor to create a new store
Then the store initialized
And is ready to manage objects via the `OStore` API.


Scenario: The client needs to check if a store is empty

Given that the client has an `EStore` or `OStore` instance
Then the client can call `isEmpty` on the instance to check
whether the store is empty.

Scenario: The client needs reset the store to empty

Given that the client has an `EStore` or `OStore` instance
Then the client can call `reset` on the instance to completely
empty the store 
And notify all observers.

Scenario: The client has a presentation component that interfaces with an entity store

Given that the presentation component injects the service containing the store
Then the presentation component can retrieve `Observable` instances that trigger updates
to the components presentation.


Scenario: The client has a container component providing behavior and data to presentation components as well as other container components.  The container component needs to make
it's content display dependent on whether the store is empty.

Given that the container component injects the service containing the store
Then the container component can retrieve the `Observable<boolean>` instance
using `EStore.isEmpty()` 
And evaluate it using a template `*ngIf="!(isEmpty$ | async)`
And display alternate template content if the store is empty.

Example: 

EntitiesComponent.html

```
<ng-container *ngIf="!(isEmpty$ | async); else empty">

  <input placeholder="Search Entities.." [formControl]="search">

  <app-entity *ngFor="let e of (entities$ | async)" [entity]="e"></app-entity>

</ng-container>

<ng-template #empty>...Program will resume shortly</ng-template>
```

EntitiesComponent.ts
```
@Component({
  ...
})
export class EntitiesComponent implements OnInit {
  entities$: Observable<Entity[]>;
  empty$: Observable<boolean>;
  search = new FormControl();

  constructor(private entityService: EntityService) {}

  ngOnInit() {
    this.entitiesService.init();
    
    this.empty$ = this.entityService.isEmpty();
    
    this.entities$ = this.search.valueChanges.pipe(
      startWith(''),
      switchMap(value => this.entityService.store.select(entity => entity.title.toLowerCase().includes(value));
      }))
    );
  }
}
```

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

