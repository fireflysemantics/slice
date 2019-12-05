# Testing Scenarios

### Scenario: The tester needs a mock service that simulates the retrieval of an array of entities
Given that the developer creates a root injectable services that mocks
the retrieval of entity instances
Then the test specification can perform assertions on the mock data prototype instances.

### Example
```
@Injectable({
  providedIn: 'root'
})
export class EntityDataService {

  get(): Observable<Entity[]> {
    return timer(500).pipe(mapTo(mockEntities));
  }
}
```

### Scenario: The tester needs to inject an array of entity instances into an `EStore` instance
Given that the developer injects the `EntityDataService` and calls the `get()` method on it to rerieve mock `Observable<Entity>` instances
Then the mock array of instances can be posted to the `EStore` instance using the RxJS `tap` operator.

### Example
```
@Injectable({
  providedIn: 'root'
})
export class ProductsService {
    public entitiesStore;
    constructor(private entityDataService: EntityDataService) {
        this.entitiesStore = new EStore<Entity>();
        this.productsDataService.get().pipe(
            tap(entities => this.entitiesStore.post(entities);
  }
}
```