import { Predicate } from "@fs/utilities";
import { IEntityIndex } from "@fs/types";
import { Delta } from "@fs/types";
import { ReplaySubject, Observable } from "rxjs";
import { map } from "rxjs/operators";

const { values } = Object;

export abstract class AbstractStore<E> {
  
  /* The slice element entries */
  public entries: IEntityIndex<E> = {};

  /**
   * Create notifications that broacast
   * the entire set of entries.
   */
  protected notify = new ReplaySubject<E[]>(1);

  /**
   * Notifies observers when the store is empty.
   */
  protected notifyEmptyState = new ReplaySubject<E[]>(1);

 /**
   * Notifies observers of changes to the number of entries in the store.
   */
  protected notifyEntryCount = new ReplaySubject<E[]>(1);

  /**
   * Create notifications that broacast
   * delta increments to the slice.
   */
  protected notifyDelta = new ReplaySubject<Delta<E>>(1);

  /**
   * Observe entry updates.
   * @param sort Optional sorting function yielding a sorted observable.
   * @example
     <pre>
    let todos$ = source.observe();
    </pre>
  */
  public observe(sort?: (a:any, b:any)=>number): Observable<E[]> {
    if (sort) {
      return this.notify.pipe(map((e:E[])=>e.sort(sort)));
    } 
    return this.notify.asObservable();
  }

  /**
   * Observe delta updates.
   * @example
     <pre>
     let todos$ = source.subscribeDelta();
     </pre>
   */
  public observeDelta(): Observable<Delta<E>> {
    return this.notifyDelta.asObservable();
  }

  /**
   * Select the entries that match the predicate.
   *
   * @param p The predicate used to query for the selection.
   * @return An array containing the elements that match the predicate.
   * 
   * @example 
   * @example 
     <pre>
     let todos:Observable<Todo[]>=slice.select(todo=>todo.title.length>100);
     </pre>
   */
  select(p: Predicate<E>): E[] {
    const selected: E[] = [];
    values(this.entries).forEach(e => {
      if (p(e)) {
        selected.push(e);
      }
    });
    return selected;
  }

  /**
   * Select all entries
   * 
   * @return Observable of all the slice entries.
   * 
   * @example
     <pre>
     let selectedTodos:Todo[] = source.selectAll();
     </pre>
   */
  selectAll(): E[] {
    return values(this.entries);
  }

  /**
   * Returns true if the entries contain the identified instance.
   * 
   * @param guid 
   * @returns true if the instance identified by the guid exists, false otherwise.
   * 
   * @example
     <pre>
     let contains:boolean = source.contains(guid);
     </pre>
   */
  contains(guid:string) {
    return this.entries[guid] ? true : false; 
  }

  /**
   * Find an instance by the attached uuid.
   *
   * @param guid
   * @return The model instance if it is sliced, null otherwise.
   * 
   * @example 
     <pre>
     const id = todo[GUID];
     const sametodo:Todo = selectGUID(id);
     expect(sametodo).equal(todo);
     </pre>
   */
  selectGUID(guid: string): E {
    return this.entries[guid];
  }

  /**
   * Check whether the store is empty.
   * 
   * @return A hot {@link Observable<boolean>} that indicates whether the store is empty.
   * 
   * @example
     <pre>
    source.isEmpty();
    </pre>
  */
  isEmpty():Observable<boolean> {
  return this.notifyEmptyState.pipe(
    map((entries:E[]) => entries.length == 0));
}  

  /**
   * Returns the number of entries contained.
   */
  count():Observable<number> {
    return this.notifyEntryCount.pipe(map((entries:E[]) => entries.length));
  }
}
