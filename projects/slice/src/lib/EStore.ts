import { AbstractStore } from './AbstractStore';
import { StoreConfig } from './models/StoreConfig';
import { GUID } from './utilities';

import { ActionTypes, Predicate, Delta } from './models/';
import { ReplaySubject, of, Observable, combineLatest } from 'rxjs';
import { takeWhile, filter, switchMap } from 'rxjs/operators';
import { Slice } from './Slice';

/**
 * This `todoFactory` code will be used to illustrate the API examples.  The following
 * utilities are used in the tests and the API Typedoc examples contained here.
 * @example Utilities for API Examples
 * ```
 * export const enum TodoSliceEnum {
 *    COMPLETE = "Complete",
 *    INCOMPLETE = "Incomplete"
 * }
 * export class Todo {
 *    constructor(
 *         public complete: boolean,
 *         public title: string,
 *         public gid?:string,
 *         public id?:string) {}
 * }
 *
 * export let todos = [new Todo(false, "You complete me!"), new Todo(true, "You completed me!")];
 *
 * export function todosFactory():Todo[] {
 *   return [new Todo(false, "You complete me!"), new Todo(true, "You completed me!")];
 * }
 * ```
 */
export class EStore<E> extends AbstractStore<E> {
  /**
   * Store constructor (Initialization with element is optional)
   *
   * perform initial notification to all observers,
   * such that functions like {@link combineLatest}{}
   * will execute at least once.
   * 
   * @param entities The entities to initialize the store with.
   * @param config The optional configuration instance.
   * 
   * @example EStore<Todo> Creation
   * ```
   * // Initialize the Store
   * let store: EStore<Todo> = new EStore<Todo>(todosFactory());
   * ```
   */
  constructor(entities: E[] = [], config?: StoreConfig) {
    super(config);
    const delta: Delta<E> = { type: ActionTypes.INTIALIZE, entries: entities };
    this.post(entities);
    this.notifyDelta.next(delta);
  }

  /**
   * Calls complete on all EStore {@link ReplaySubject} instances.
   *
   * Call destroy when disposing of the store.
   */
  override destroy() {
    super.destroy();
    this.notifyLoading.complete();
    this.notifyActive.complete();
    this.slices.forEach((slice) => slice.destroy());
  }

  /**
   * Toggles the entity:
   *
   * If the store contains the entity
   * it will be deleted.  If the store
   * does not contains the entity,
   * it is added.
   * @param e The entity to toggle
   * @example Toggle the Todo instance
   * ```
   * estore.post(todo);
   * // Remove todo
   * estore.toggle(todo);
   * // Add it back
   * estore.toggle(todo);
   * ```
   */
  public toggle(e: E) {
    if (this.contains(e)) {
      this.delete(e);
    } else {
      this.post(e);
    }
  }

  /**
   * Notifies observers when the store is empty.
   */
  private notifyActive = new ReplaySubject<Map<string, E>>(1);

  /**
   * `Map` of active entties. The instance is public and can be used
   * directly to add and remove active entities, however we recommend
   * using the {@link addActive} and {@link deleteActive} methods.
   */
  public active: Map<string, E> = new Map();

  /**
   * Add multiple entity entities to active.
   *
   * If the entity is not contained in the store it is added
   * to the store before it is added to `active`.
   *
   * Also we clone the map prior to broadcasting it with
   * `notifyActive` to make sure we will trigger Angular
   * change detection in the event that it maintains
   * a reference to the `active` state `Map` instance.
   *
   * @example Add todo1 and todo2 as active
   * ```
   * addActive(todo1);
   * addActive(todo2);
   * ```
   */
  public addActive(e: E) {
    if (this.contains(e)) {
      this.active.set((<any>e).gid, e);
      this.notifyActive.next(new Map(this.active));
    } else {
      this.post(e);
      this.active.set((<any>e).gid, e);
      this.notifyActive.next(new Map(this.active));
    }
  }

  /**
   * Delete an active entity.
   *
   * Also we clone the map prior to broadcasting it with
   * `notifyActive` to make sure we will trigger Angular
   * change detection in the event that it maintains
   * a reference to the `active` state `Map` instance.
   *
   * @example Remove todo1 and todo2 as active entities
   * ```
   * deleteActive(todo1);
   * deleteActive(todo2);
   * ```
   */
  public deleteActive(e: E) {
    this.active.delete((<any>e).gid);
    this.notifyActive.next(new Map(this.active));
  }

  /**
   * Clear / reset the active entity map.
   *
   * Also we clone the map prior to broadcasting it with
   * `notifyActive` to make sure we will trigger Angular
   * change detection in the event that it maintains
   * a reference to the `active` state `Map` instance.
   *
   * @example Clear active todo instances
   * ```
   * store.clearActive();
   * ```
   */
  clearActive() {
    this.active.clear();
    this.notifyActive.next(new Map(this.active));
  }

  /**
   * Observe the active entities.
   *
   * @example
   * ```
   * let active$ = store.observeActive();
   * ```
   */
  public observeActive() {
    return this.notifyActive.asObservable();
  }

  /**
   * Observe the active entity.
   * @example
     <pre>
    let active$ = source.activeSnapshot();
    </pre>
  */
  public activeSnapshot() {
    return Array.from(this.active.values());
  }

  //================================================
  // LOADING
  //================================================

  /**
   * Observable of errors occurred during a load request.
   *
   * The error Observable should be created by the
   * client.
   */
  public loadingError!: Observable<any>;

  /**
   * Notifies observers when the store is loading.
   *
   * This is a common pattern found when implementing
   * `Observable` data sources.
   */
  private notifyLoading = new ReplaySubject<boolean>(1);

  /**
   * The current loading state.  Use loading when fetching new
   * data for the store.  The default loading state is `true`.
   *
   * This is such that if data is fetched asynchronously
   * in a service, components can wait on loading notification
   * before attempting to retrieve data from the service.
   *
   * Loading could be based on a composite response.  For example
   * when the stock and mutual funds have loaded, set loading to `false`.
   */
  private _loading: boolean = true;

  /**
   * Sets the current loading state and notifies observers.
   */
  set loading(loading: boolean) {
    this._loading = loading;
    this.notifyLoading.next(this._loading);
  }

  /**
   * @return A snapshot of the loading state.
   * @example Create a reference to the loading state
   * ```
   * const loading:boolean = todoStore.loading;
   * ```
   */
  get loading() {
    return this._loading;
  }

  /**
   * Observe loading.
   *
   * Note that this obverable piped through
   * `takeWhile(v->v, true), such that it will
   * complete after each emission.
   *
   * See:
   * https://fireflysemantics.medium.com/waiting-on-estore-to-load-8dcbe161613c
   *
   * For more details.
   * Also note that v=>v is the same as v=>v!=false
   * 
   * @example
   * ```
   * const observeLoadingHandler: Observer<boolean> = {
   *   complete: () => {
   *     console.log(`Data Loaded and Observable Marked as Complete`);
   *   }, // completeHandler
   *   error: () => {
   *     console.log(`Any Errors?`);
   *   }, // errorHandler
   *   next: (l) => {
   *     console.log(`Data loaded and loading is ${l}`);
   *   },
   * };
   *
   * const observeLoadingResubscribeHandler: Observer<boolean> = {
   *   complete: () => {
   *     console.log(`Data Loaded and Resubscribe Observable Marked as Complete`);
   *   }, // completeHandler
   *   error: () => {
   *     console.log(`Any Resubscribe Errors?`);
   *   }, // errorHandler
   *   next: (l) => {
   *     console.log(`Data loaded and resusbscribe loading  value is ${l}`);
   *   },
   * };
   *
   * const todoStore: EStore<Todo> = new EStore();
   * //============================================
   * // Loading is true by default
   * //============================================
   * console.log(`The initial value of loading is ${todoStore.loading}`);
   * //============================================
   * // Observe Loading
   * //============================================
   * let loading$: Observable<boolean> = todoStore.observeLoading();
   * loading$.subscribe((l) => console.log(`The value of loading is ${l}`));
   *
   * todoStore.loading = false;
   * loading$.subscribe(observeLoadingHandler);
   * //============================================
   * // The subscription no longer fires
   * //============================================
   * todoStore.loading = true;
   * todoStore.loading = false;
   *
   * //============================================
   * // The subscription no longer fires,
   * // so if we want to observe loading again
   * // resusbscribe.
   * //============================================
   * todoStore.loading = true;
   * loading$ = todoStore.observeLoading();
   * loading$.subscribe(observeLoadingResubscribeHandler);
   * todoStore.loading = false;
   * ```
   */
  public observeLoading() {
    return this.notifyLoading.asObservable().pipe(takeWhile((v) => v, true));
  }

  /**
   * Notfiies when loading has completed.
   */
  public observeLoadingComplete() {
    return this.observeLoading().pipe(
      filter((loading) => loading == false),
      switchMap(() => of(true))
    );
  }

  //================================================
  // SEARCHING
  //================================================
  /**
   * Observable of errors occurred during a search request.
   *
   * The error Observable should be created by the
   * client.
   */
  public searchError!: Observable<any>;

  /**
   * Notifies observers that a search is in progress.
   *
   * This is a common pattern found when implementing
   * `Observable` data sources.
   */
  private notifySearching = new ReplaySubject<boolean>(1);

  /**
   * The current `searching` state.  Use `searching`
   * for example to display a spinnner
   * when performing a search.
   * The default `searching` state is `false`.
   */
  private _searching: boolean = false;

  /**
   * Sets the current searching state and notifies observers.
   */
  set searching(searching: boolean) {
    this._searching = searching;
    this.notifySearching.next(this._searching);
  }

  /**
   * @return A snapshot of the searching state.
   */
  get searching() {
    return this._searching;
  }

  /**
   * Observe searching.
   * @example
     <pre>
    let searching$ = source.observeSearching();
    </pre>
  
    Note that this obverable piped through
    `takeWhile(v->v, true), such that it will 
    complete after each emission.
  
    See:
    https://medium.com/@ole.ersoy/waiting-on-estore-to-load-8dcbe161613c
  
    For more details.
  */
  public observeSearching(): Observable<boolean> {
    return this.notifySearching.asObservable().pipe(takeWhile((v) => v, true));
  }

  /**
   * Notfiies when searching has completed.
   */
  public observeSearchingComplete(): Observable<boolean> {
    return this.observeSearching().pipe(
      filter((searching) => searching == false),
      switchMap(() => of(true))
    );
  }

  /**
   * Store slices
   */
  private slices: Map<string, Slice<E>> = new Map();

  /**
   * Adds a slice to the store and keys it by the slices label.
   *
   * @param p
   * @param label
   * 
   * @example Setup a Todo Slice for COMPLETE Todos
```
source.addSlice(todo => todo.complete, TodoSlices.COMPLETE);
```
   */
  addSlice(p: Predicate<E>, label: string) {
    const slice: Slice<E> = new Slice(label, p, this);
    this.slices.set(slice.label, slice);
  }

  /**
   * Remove a slice
   * @param label The label identifying the slice
   * 
   * @example Remove the TodoSlices.COMPLETE Slice
```
source.removeSlice(TodoSlices.COMPLETE);
```
   */
  removeSlice(label: string) {
    this.slices.delete(label);
  }

  /**
   * Get a slice
   * @param label The label identifying the slice
   * @return The Slice instance or undefined 
   * 
   * @example Get the TodoSlices.COMPLETE slice
```
source.getSlice(TodoSlices.COMPLETE);
```
   */
  getSlice(label: string): Slice<E> | undefined {
    return this.slices.get(label);
  }

  /**
   * Post (Add a new) element(s) to the store.
   * @param e An indiidual entity or an array of entities
   * @example Post a Todo instance.
   *
   *```
   * store.post(todo);
   *```
   */
  post(e: E | E[]) {
    if (!Array.isArray(e)) {
      const guid: string = (<any>e)[this.GUID_KEY]
        ? (<any>e)[this.GUID_KEY]
        : GUID();
      (<any>e)[this.GUID_KEY] = guid;
      this.entries.set(guid, e);
      this.updateIDEntry(e);
      Array.from(this.slices.values()).forEach((s) => {
        s.post(e);
      });
      //Create a new array reference to trigger Angular change detection.
      let v: E[] = [...Array.from(this.entries.values())];
      const delta: Delta<E> = { type: ActionTypes.POST, entries: [e] };
      this.notifyAll(v, delta);
    } else {
      this.postA(e);
    }
  }

  /**
   * Post N entities to the store.
   * @param ...e
   * @example Post two Todo instances.
   * ```
   * store.post(todo1, todo2);
   * ```
   */
  postN(...e: E[]) {
    e.forEach((e) => {
      const guid: string = (<any>e)[this.GUID_KEY]
        ? (<any>e)[this.GUID_KEY]
        : GUID();
      (<any>e)[this.GUID_KEY] = guid;
      this.entries.set(guid, e);
      this.updateIDEntry(e);
    });
    Array.from(this.slices.values()).forEach((s) => {
      s.postA(e);
    });
    //Create a new array reference to trigger Angular change detection.
    let v: E[] = [...Array.from(this.entries.values())];
    const delta: Delta<E> = { type: ActionTypes.POST, entries: e };
    this.notifyAll(v, delta);
  }

  /**
   * Post (Add) an array of elements to the store.
   * @param e
   * @example Post a Todo array.
   *
   * ```
   * store.post([todo1, todo2]);
   * ```
   */
  postA(e: E[]) {
    this.postN(...e);
  }

  /**
   * Put (Update) an entity.
   * @param e
   * @example Put a Todo instance.
   * ```
   * store.put(todo1);
   * ```
   */
  put(e: E | E[]) {
    if (!Array.isArray(e)) {
      let id: string = (<any>e)[this.GUID_KEY];
      this.entries.set(id, e);
      this.updateIDEntry(e);
      let v: E[] = [...Array.from(this.entries.values())];
      this.notify.next(v);
      const delta: Delta<E> = { type: ActionTypes.PUT, entries: [e] };
      this.notifyDelta.next(delta);
      Array.from(this.slices.values()).forEach((s) => {
        s.put(e);
      });
    } else {
      this.putA(e);
    }
  }

  /**
   * Put (Update) an element or add an element that was read from a persistence source
   * and thus already has an assigned global id`.
   * @param e The enetity instances to update.
   * @example Put N Todo instances.
   *
   * ```
   * store.put(todo1, todo2);
   * ```
   */
  putN(...e: E[]) {
    this.putA(e);
  }

  /**
   * Put (Update) the array of enntities.
   * @param e The array of enntities to update
   * @example Put an array of Todo instances.
   * ```
   * store.put([todo1, todo2]);
   * ```
   */
  putA(e: E[]) {
    e.forEach((e) => {
      let guid: string = (<any>e)[this.GUID_KEY];
      this.entries.set(guid, e);
      this.updateIDEntry(e);
    });
    //Create a new array reference to trigger Angular change detection.
    let v: E[] = [...Array.from(this.entries.values())];
    this.notify.next(v);
    const delta: Delta<E> = { type: ActionTypes.PUT, entries: e };
    this.notifyDelta.next(delta);
    Array.from(this.slices.values()).forEach((s) => {
      s.putA(e);
    });
  }

  /**
   * Delete (Update) the array of elements.
   * @param e
   * @example Delete todo1.
   * ```
   * store.delete(todo1]);
   * ```
   */
  delete(e: E | E[]) {
    if (!Array.isArray(e)) {
      this.deleteActive(e);
      const guid = (<any>e)[this.GUID_KEY];
      this.entries.delete(guid);
      this.deleteIDEntry(e);
      Array.from(this.slices.values()).forEach((s) => {
        s.entries.delete(guid);
      });
      //Create a new array reference to trigger Angular change detection.
      let v: E[] = [...Array.from(this.entries.values())];
      const delta: Delta<E> = { type: ActionTypes.DELETE, entries: [e] };
      this.notifyAll(v, delta);
      Array.from(this.slices.values()).forEach((s) => {
        s.delete(e);
      });
    } else {
      this.deleteA(e);
    }
  }

  /**
   * Delete N elements.
   * @param ...e
   * @example Delete N Todo instance argument.
   * ```
   * store.deleteN(todo1, todo2);
   * ```
   */
  deleteN(...e: E[]) {
    this.deleteA(e);
  }

  /**
   * Delete an array of elements.
   * @param e The array of instances to be deleted
   * @example Delete the array of Todo instances.
   * ```
   * store.deleteA([todo1, todo2]);
   * ```
   */
  deleteA(e: E[]) {
    e.forEach((e) => {
      this.deleteActive(e);
      const guid = (<any>e)[this.GUID_KEY];
      this.entries.delete(guid);
      this.deleteIDEntry(e);
      Array.from(this.slices.values()).forEach((s) => {
        s.entries.delete(guid);
      });
    });
    //Create a new array reference to trigger Angular change detection.
    let v: E[] = [...Array.from(this.entries.values())];
    const delta: Delta<E> = { type: ActionTypes.DELETE, entries: e };
    this.notifyAll(v, delta);
    Array.from(this.slices.values()).forEach((s) => {
      s.deleteA(e);
    });
  }

  /**
   * Delete elements by {@link Predicate}.
   * @param p The predicate.
   * @example Delete the Todo instances.
   * ```
   * store.delete(todo1, todo2);
   * ```
   */
  deleteP(p: Predicate<E>) {
    const d: E[] = [];
    Array.from(this.entries.values()).forEach((e) => {
      if (p(e)) {
        d.push(e);
        const id = (<any>e)[this.GUID_KEY];
        this.entries.delete(id);
        this.deleteActive(e);
        this.deleteIDEntry(e);
      }
    });
    //Create a new array reference to trigger Angular change detection.
    let v: E[] = [...Array.from(this.entries.values())];
    const delta: Delta<E> = { type: ActionTypes.DELETE, entries: d };
    this.notifyAll(v, delta);
    Array.from(this.slices.values()).forEach((s) => {
      s.deleteA(d);
    });
  }

  /**
   * If the entity has the `id` key initialized with a value,
   * then also add the entity to the `idEntries`.
   *
   * @param e The element to be added to the `idEntries`.
   */
  private updateIDEntry(e: E) {
    if ((<any>e)[this.ID_KEY]) {
      this.idEntries.set((<any>e)[this.ID_KEY], e);
    }
  }

  /**
   * If the entity has the `id` key initialized with a value,
   * then also delete the entity to the `idEntries`.
   *
   * @param e The element to be added to the `idEntries`.
   */
  private deleteIDEntry(e: E) {
    if ((<any>e)[this.ID_KEY]) {
      this.idEntries.delete((<any>e)[this.ID_KEY]);
    }
  }

  /**
   * Resets the store and all contained slice instances to empty.
   * Also perform delta notification that sends all current store entries.
   * The ActionType.RESET code is sent with the delta notification.  Slices
   * send their own delta notification.
   *
   * @example Reset the store.
   * ```
   * store.reset();
   * ```
   */
  reset() {
    const delta: Delta<E> = {
      type: ActionTypes.RESET,
      entries: Array.from(this.entries.values()),
    };
    this.notifyAll([], delta);
    this.entries = new Map();
    Array.from(this.slices.values()).forEach((s) => {
      s.reset();
    });
  }

  /**
   * Call all the notifiers at once.
   *
   * @param v
   * @param delta
   */
  protected override notifyAll(v: E[], delta: Delta<E>) {
    super.notifyAll(v, delta);
    this.notifyLoading.next(this.loading);
  }
}
