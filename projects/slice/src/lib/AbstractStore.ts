import { ReplaySubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Delta, Predicate } from './models';
import { StoreConfig } from './models/StoreConfig';

const { freeze } = Object;

const ESTORE_DEFAULT_ID_KEY = 'id';
const ESTORE_DEFAULT_GID_KEY = 'gid';

export const ESTORE_CONFIG_DEFAULT: StoreConfig = freeze({
  idKey: ESTORE_DEFAULT_ID_KEY,
  guidKey: ESTORE_DEFAULT_GID_KEY,
});

export abstract class AbstractStore<E> {
  /**
   * The configuration for the store.
   */
  public config: StoreConfig;

  constructor(config?: StoreConfig) {
    this.config = config
      ? freeze({ ...ESTORE_CONFIG_DEFAULT, ...config })
      : ESTORE_CONFIG_DEFAULT;
  }

  /**
   * Notifies observers of the store query.
   */
  protected notifyQuery = new ReplaySubject<string>(1);

  /**
   * The current query state.
   */
  protected _query: string = '';

  /**
   * Sets the current query state and notifies observers.
   */
  set query(query: string) {
    this._query = query;
    this.notifyQuery.next(this._query);
  }

  /**
   * @return A snapshot of the query state.
   */
  get query() {
    return this._query;
  }

  /**
   * Observe the query.
   * @example
     <pre>
    let query$ = source.observeQuery();
    </pre>
  */
  public observeQuery() {
    return this.notifyQuery.asObservable();
  }

  /**
   * The current id key for the EStore instance.
   * @return this.config.idKey;
   */
  get ID_KEY(): string {
    return this.config.idKey;
  }
  /**
   * The current guid key for the EStore instance.
   * @return this.config.guidKey;
   */
  get GUID_KEY(): string {
    return this.config.guidKey;
  }

  /**
   * Primary index for the stores elements.
   */
  public entries: Map<string, E> = new Map();

  /**
   * The element entries that are keyed by
   * an id generated on the server.
   */
  public idEntries: Map<string, E> = new Map();

  /**
   * Create notifications that broacast
   * the entire set of entries.
   */
  protected notify = new ReplaySubject<E[]>(1);

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
  protected notifyAll(v: E[], delta: Delta<E>) {
    this.notify.next(v);
    this.notifyDelta.next(delta);
  }

  /**
   * Observe store state changes.
   *
   * @param sort Optional sorting function yielding a sorted observable.
   * @example
   * ```
   * let todos$ = source.observe();
   * //or with a sort by title function
   * let todos$ = source.observe((a, b)=>(a.title > b.title ? -1 : 1));
   * ```
   */
  public observe(sort?: (a: any, b: any) => number): Observable<E[]> {
    if (sort) {
      return this.notify.pipe(map((e: E[]) => e.sort(sort)));
    }
    return this.notify.asObservable();
  }

  /**
   * An Observable<E[]> reference
   * to the entities in the store or
   * Slice instance.
   */
  public obs: Observable<E[]> = this.observe();

  /**
   * Observe delta updates.
   *
   * @example
   * ```
   * let todos$ = source.observeDelta();
   * ```
   */
  public observeDelta(): Observable<Delta<E>> {
    return this.notifyDelta.asObservable();
  }

  /**
   * Check whether the store is empty.
   *
   * @return A hot {@link Observable} that indicates whether the store is empty.
   *
   * @example
   * ```
   * const empty$:Observable<boolean> = source.isEmpty();
   * ```
   */
  isEmpty(): Observable<boolean> {
    return this.notify.pipe(map((entries: E[]) => entries.length == 0));
  }

  /**
   * Check whether the store is empty.
   *
   * @return A snapshot that indicates whether the store is empty.
   *
   * @example
   * ```
   * const empty:boolean = source.isEmptySnapshot();
   * ```
   */
  isEmptySnapshot(): boolean {
    return Array.from(this.entries.values()).length == 0;
  }

  /**
   * Returns the number of entries contained.
   * @param p The predicate to apply in order to filter the count
   */
  count(p?: Predicate<E>): Observable<number> {
    if (p) {
      return this.notify.pipe(
        map((e: E[]) => e.reduce((total, e) => total + (p(e) ? 1 : 0), 0))
      );
    }
    return this.notify.pipe(map((entries: E[]) => entries.length));
  }

  /**
   * Returns a snapshot of the number of entries contained in the store.
   * @param p The predicate to apply in order to filter the count
   * 
   * @example
   * ```
   * 
   * ```
   */
  countSnapshot(p?: Predicate<E>): number {
    if (p) {
      return Array.from(this.entries.values()).filter(p).length;
    }
    return Array.from(this.entries.values()).length;
  }

  /**
   * Snapshot of all entries.
   * 
   * @return Snapshot array of all the elements the entities the store contains.
   * 
   * @example Observe a snapshot of all the entities in the store.
```
let selectedTodos:Todo[] = source.allSnapshot();
```
   */
  allSnapshot(): E[] {
    return Array.from(this.entries.values());
  }

  /**
   * Returns true if the entries contain the identified instance.
   * 
   * @param target Either an instance of type `E` or a `guid` identifying the instance. 
   * @param byId Whether the lookup should be performed with the `id` key rather than the `guid`.
   * @returns true if the instance identified by the guid exists, false otherwise.
   * 
   * @example
     <pre>
     let contains:boolean = source.contains(guid);
     </pre>
   */
  contains(target: E | string): boolean {
    if (typeof target === 'string') {
      return this.entries.get(target) ? true : false;
    }
    const guid: string = (<any>target)[this.config.guidKey];
    return this.entries.get(guid) ? true : false;
  }

  /**
   * Returns true if the entries contain the identified instance.
   * 
   * @param target Either an instance of type `E` or a `id` identifying the instance. 
   * @returns true if the instance identified by the `id` exists, false otherwise.
   * 
   * @example
     <pre>
     let contains:boolean = source.contains(guid);
     </pre>
   */
  containsById(target: E | string): boolean {
    if (typeof target === 'string') {
      return this.idEntries.get(target) ? true : false;
    }
    const id: string = (<any>target)[this.config.idKey];
    return this.idEntries.get(id) ? true : false;
  }

  /**
   * Find and return the entity identified by the GUID parameter
   * if it exists and return it.
   *
   * @param guid
   * @return The entity instance if it exists, null otherwise
   */
  findOne(guid: string): E | undefined {
    return this.entries.get(guid);
  }

  /**
   * Find and return the entity identified by the ID parameter
   * if it exists and return it.
   *
   * @param id
   * @return The entity instance if it exists, null otherwise
   */
  findOneByID(id: string): E | undefined {
    return this.idEntries.get(id);
  }

  /**
   * Snapshot of the entries that match the predicate.
   *
   * @param p The predicate used to query for the selection.
   * @return A snapshot array containing the entities that match the predicate.
   *
   * @example Select all the Todo instances where the title length is greater than 100.
   * ```
   * let todos:Todo[]=store.select(todo=>todo.title.length>100);
   * ```
   */
  select(p: Predicate<E>): E[] {
    const selected: E[] = [];
    Array.from(this.entries.values()).forEach((e) => {
      if (p(e)) {
        selected.push(e);
      }
    });
    return selected;
  }

  /**
   * Compare entities by GUID
   * @param e1 The first entity
   * @param e2 The second entity
   * @return true if the two entities have equal GUID ids
   *
   * @example Compare todo1 with todo2 by gid.
   * ```
   * if (equalsByGUID(todo1, todo2)){...};
   * ```
   */
  equalsByGUID(e1: any, e2: any) {
    return e1[this.GUID_KEY] == e2[this.GUID_KEY];
  }

  /**
   * Compare entities by ID
   * @param e1 The first entity
   * @param e2 The second entity
   * @return true if the two entities have equal ID ids
   *
   * @example Compare todo1 with todo2 by id.
   *
   * ```
   * if (equalsByID(todo1, todo2)){...};
   * ```
   */
  equalsByID(e1: any, e2: any) {
    return e1[this.ID_KEY] == e2[this.ID_KEY];
  }
  /**
   * Calls complete on all {@link ReplaySubject} instances.
   *
   * Call destroy when disposing of the store.
   */
  destroy() {
    this.notify.complete();
    this.notifyDelta.complete();
    this.notifyQuery.complete();
  }
}
