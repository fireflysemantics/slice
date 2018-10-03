import { Predicate, Delta, IEntityIndex, ActionTypes } from "./types";
import { ReplaySubject, Observable, combineLatest } from "rxjs";
import { map } from "rxjs/operators";

const {values} = Object;

export abstract class AbstractStore<E> {

  /* Primary index for the stores elements.
   */
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
   * store or slice delta state changes.
   */
  protected notifyDelta = new ReplaySubject<Delta<E>>(1);

  /**
   * Call all the notifiers at once.
   * 
   * @param v 
   * @param delta 
   */
  protected notifyAll(v:E[], delta:Delta<E>) {
    this.notify.next(v);
    this.notifyEmptyState.next(v);
    this.notifyEntryCount.next(v);
    this.notifyDelta.next(delta);
  }  

  /**
   * Observe store state changes.
   * @param sort Optional sorting function yielding a sorted observable.
   * @example
     <pre>
    let todos$ = source.observe();
    or with a sort function
    let todos$ = source.observe((a, b)=>(a.title > b.title ? -1 : 1));
    </pre>
  */
  public observe(sort?: (a: any, b: any) => number): Observable<E[]> {
    if (sort) {
      return this.notify.pipe(map((e: E[]) => e.sort(sort)));
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
   * Check whether the store is empty.
   * 
   * @return A hot {@link Observable<boolean>} that indicates whether the store is empty.
   * 
   * @example
     <pre>
    source.isEmpty();
    </pre>
  */
  isEmpty(): Observable<boolean> {
    return this.notifyEmptyState.pipe(
      map((entries: E[]) => entries.length == 0)
    );
  }

  /**
   * Returns the number of entries contained.
   * @param p The predicate to apply in order to filter the count  
   */
  count(p?: Predicate<E>): Observable<number> {
    if (p) {
      return this.notifyEntryCount.pipe(map((e: E[]) => e.reduce(
        (total, e) => total + (p(e) ? 1 : 0),
        0
      )));
    }
    return this.notifyEntryCount.pipe(map((entries: E[]) => entries.length));
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
   * Find and return the entity identified by the GUID parameter
   * if it exists and return it.  
   * 
   * @param guid 
   * @return The entity instance if it exists, null otherwise
   */
  findOne(guid:string):E {
    return this.entries[guid];
  }

  /**
   * Select a snapshot of the entries that match the predicate.
   *
   * @param p The predicate used to query for the selection.
   * @return A snapshot array containing the entities that match the predicate.
   * 
   * @example 
   * @example 
     <pre>
     let todos:Todo[]=slice.select(todo=>todo.title.length>100);
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
   * Select a snapshot of all entries.
   * 
   * @return Snapshot array of all the elements the entities the store contains.
   * 
   * @example
     <pre>
     let selectedTodos:Todo[] = source.selectAll();
     </pre>
   */
  selectAll(): E[] {
    return values(this.entries);
  }
}