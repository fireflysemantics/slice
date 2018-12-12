
Data Service Example
```
@Injectable({
  providedIn: 'root'
})
export class ProductsDataService {

  get(): Observable<Product[]> {
    return timer(500).pipe(mapTo(mockProducts));
  }
}


import { noop } from '@datorama/akita';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private productsStore: ProductsStore, 
              private productsQuery: ProductsQuery, 
              private productsDataService: ProductsDataService) {}


  get(): Observable<Product[]> {
    const request = this.productsDataService.get().pipe(
       tap(response => this.productsStore.set(response)
    ));

    return this.productsQuery.isPristine ? request : noop();
  }

}

```