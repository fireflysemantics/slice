import { AbstractStore } from "./AbstractStore";
import { StoreConfig } from './StoreConfig';
import { GUID } from './utilities';

import {
  ActionTypes,
  Predicate,
  ISliceIndex,
  Delta
} from "./types";
import { Slice } from "./Slice";
import { ReplaySubject } from "rxjs";

const { values } = Object;

/**
 * This `todoFactory` code will be used to illustrate the API examples.  The following
 * utilities are used in the tests and the API Typedoc examples contained here.
 * @example Utilities for API Examples
```
export const enum TodoSliceEnum {
  COMPLETE = "Complete",
  INCOMPLETE = "Incomplete"
}

export class Todo {
  constructor(public complete: boolean, public title: string,public gid?:string, public id?:string) {}
}

export let todos = [new Todo(false, "You complete me!"), new Todo(true, "You completed me!")];

export function todosFactory():Todo[] {
  return [new Todo(false, "You complete me!"), new Todo(true, "You completed me!")];
}
 ``` 
 */

export class EStore<E> extends AbstractStore<E> {
  /**
   * Store constructor (Initialization with element is optional)
   *
   * perform initial notification to all observers,
   * such that function like {@link combineLatest}{}
   * will execute at least once.
   * @param entities
   * @example Dynamic `EStore<Todo>` Creation 
```
// Initialize the Store
let store: EStore<Todo> = new EStore<Todo>(todosFactory());
```
   */
  constructor(private entities?: E[], config?: StoreConfig) {
    super(config);
    if (entities) {
      this.postA(entities);
      const delta: Delta<E> = {
        type: ActionTypes.INTIALIZE,
        entries: entities
      };
      this.notifyAll(entities, delta);
    } else {
      const delta: Delta<E> = { type: ActionTypes.INTIALIZE, entries: [] };
      this.notifyAll([], delta);
    }
  }

  /**
   * Toggles the entity:
   * 
   * If the store contains the entity
   * it will be deleted.  If the store 
   * does not contains the entity,
   * it is added.
   * @param e 
   * @example Toggle the `Todo` instance
```
estore.post(todo);
// Remove todo
estore.toggle(todo);
// Add it back
estore.toggle(todo);

```
   */
  public toggle(e:E) {
    if (this.contains(e)) {
      this.delete(e);
    }
    else {
      this.post(e);
    }
  }
  
  /**
   * Notifies observers when the store is empty.
   */
  private notifyActive = new ReplaySubject<Map<string,E>>(1);

  /** 
   * `Map` of active entties. The instance is public and can be used
   * directly to add and remove active entities, however we recommend
   * using the {@link addActive} and {@link deleteActive} methods. 
  */
  public active: Map<string,E> = new Map();

  /**
   * Add multiple entity entities.  The entity is only added
   * if it is contained in the store.  If it is not contained
   * in the store the operation fails silently.
   * 
   * Also we clone the map prior to broadcasting it with
   * `notifyActive` to make sure we will trigger Angular 
   * change detection in the event that it maintains 
   * a reference to the `active` state `Map` instance.
   * 
   * @example Add a `todo1` and `todo2` as active
```
addActive(todo1);
addActive(todo2);
```
   */
  addActive(e: E) {
    if (this.contains(e)) {
      this.active.set((<any>e).gid, e);
      this.notifyActive.next(new Map(this.active));
    }
  }

  /**
   * Delete an entity as active.
   * 
   * Also we clone the map prior to broadcasting it with
   * `notifyActive` to make sure we will trigger Angular 
   * change detection in the event that it maintains 
   * a reference to the `active` state `Map` instance.
   * 
   * @example Mark a `todo` instance as active
  ```
deleteActive(todo1);
deleteActive(todo2);
  ```
   */
  deleteActive(e: E) {
    this.active.delete((<any>e).gid);
    this.notifyActive.next(new Map(this.active));
  }


  /**
   * Observe the active entity.
   * @example
     <pre>
    let active$ = source.observeActive();
    </pre>
  */
  public observeActive() {
    return this.notifyActive.asObservable();
  }

  /**
   * Notifies observers when the store is loading.
   */
  private notifyLoading = new ReplaySubject<boolean>(1);

  /** 
   * The current loading state.  Use loading when fetching new 
   * data for the store.  The default loading state is `false`.
   * 
   * Loading could be based on a composite response.  For example
   * when the stock and mutual funds have loaded, set loading to `false`.
   */
  private _loading: boolean = false;

  /**
   * Sets the current loading state and notifies observers.
   */
  set loading(loading: boolean) {
    this._loading = loading;
    this.notifyLoading.next(this._loading);
  }

  /**
   * @return A snapshot of the loading state.
   */
  get loading() {
    return this._loading;
  }

  /**
   * Observe the active entity.
   * @example
     <pre>
    let active$ = source.observeActive();
    </pre>
  */
  public observeLoading() {
    return this.notifyLoading.asObservable();
  }

  /**
   * Store slices
   */
  private slices: ISliceIndex<E> = {};

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
    const slice: Slice<E> = new Slice(
      label,
      p,
      this.config,
      values(this.entries)
    );
    this.slices[slice.label] = slice;
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
    delete this.slices[label];
  }

  /**
   * Get a slice
   * @param label The label identifying the slice
   * 
   * @example Get the TodoSlices.COMPLETE slice
```
source.getSlice(TodoSlices.COMPLETE);
```
   */
  getSlice(label: string): Slice<E> {
    return this.slices[label];
  }

  /**
   * Post (Add a new) element to the store.
   * @param e
   * @example Post a `todo`.
```
store.post(todo);
```
   */
  post(e: E) {
    const guid:string = (<any>e)[this.GUID_KEY]  ? (<any>e)[this.GUID_KEY] : GUID();
    (<any>e)[this.GUID_KEY] = guid;
    this.entries[guid] = e;
    this.updateIDEntry(e);
    values(this.slices).forEach(s => {
      s.add(e);
    });
    //Create a new array reference to trigger Angular change detection.
    let v: E[] = [...values(this.entries)];
    const delta: Delta<E> = { type: ActionTypes.POST, entries: [e] };
    this.notifyAll(v, delta);
  }

  /**
   * Post elements to the store.
   * @param ...e
   * @example Post two `Todo` instances.
```
store.post(todo1, todo2);
```
   */
  postN(...e: E[]) {
    e.forEach(e => {
      const guid:string = (<any>e)[this.GUID_KEY]  ? (<any>e)[this.GUID_KEY] : GUID();
      (<any>e)[this.GUID_KEY] = guid;
      this.entries[guid] = e;
      this.updateIDEntry(e);
    });
    values(this.slices).forEach(s => {
      s.addA(e);
    });
    //Create a new array reference to trigger Angular change detection.
    let v: E[] = [...values(this.entries)];
    const delta: Delta<E> = { type: ActionTypes.POST, entries: e };
    this.notifyAll(v, delta);
  }

  /**
   * Post (Add) an array of elements to the store.
   * @param e
   * @example Post a `Todo` array.
```
store.post([todo1, todo2]);
```
   */
  postA(e: E[]) {
    this.postN(...e);
  }

  /**
   * Put (Update) an element.
   * @param e
   * @example Put a Todo instance.
```
store.put(todo1);
```
   */
  put(e: E) {
    let id: string = (<any>e)[this.GUID_KEY];
    this.entries[id] = e;
    this.updateIDEntry(e);
    let v: E[] = [...values(this.entries)];
    this.notify.next(v);
    const delta: Delta<E> = { type: ActionTypes.PUT, entries: [e] };
    this.notifyDelta.next(delta);
    values(this.slices).forEach(s => {
      s.put(e);
    });
  }

  /**
   * Put (Update) an element or add an element that was read from a persistence source
   * and thus already has an assigned global id`.
   * @param e
   * @example Put Todo instances.
```
store.put(todo1, todo2);
```
   */
  putN(...e: E[]) {
    this.putA(e);
  }

  /**
   * Put (Update) the array of elements.
   * @param e
   * @example Put Todo instances.
```
store.put([todo1, todo2]);
```
   */
  putA(e: E[]) {
    e.forEach(e => {
      let guid: string = (<any>e)[this.GUID_KEY];
      this.entries[guid] = e;
      this.updateIDEntry(e);
    });
    //Create a new array reference to trigger Angular change detection.
    let v: E[] = [...values(this.entries)];
    this.notify.next(v);
    const delta: Delta<E> = { type: ActionTypes.PUT, entries: e };
    this.notifyDelta.next(delta);
    values(this.slices).forEach(s => {
      s.putA(e);
    });
  }

  /**
   * Delete (Update) the array of elements.
   * @param e
   * @example Delete todo1.
```
store.delete(todo1]);
```
   */
  delete(e: E) {
    this.deleteActive(e);
    const guid = (<any>e)[this.GUID_KEY];
    delete this.entries[guid];
    this.deleteIDEntry(e);
    values(this.slices).forEach(s => {
      delete s.entries[guid];
    });
    //Create a new array reference to trigger Angular change detection.
    let v: E[] = [...values(this.entries)];
    const delta: Delta<E> = { type: ActionTypes.DELETE, entries: [e] };
    this.notifyAll(v, delta);
    values(this.slices).forEach(s => {
      s.delete(e);
    });
  }

  /**
   * Delete N elements.
   * @param ...e
   * @example Put Todo instances.
```
store.delete(todo1, todo2);
```
   */
  deleteN(...e: E[]) {
    this.deleteA(e);
  }

  /**
   * Delete N elements.
   * @param ...e
   * @example Put Todo instances.
```
store.delete(todo1, todo2);
```
   */
  deleteA(e: E[]) {
    e.forEach(e => {
      this.deleteActive(e);
      const guid = (<any>e)[this.GUID_KEY];
      delete this.entries[guid];
      this.deleteIDEntry(e);
      values(this.slices).forEach(s => {
        delete s.entries[guid];
      });
    });
    //Create a new array reference to trigger Angular change detection.
    let v: E[] = [...values(this.entries)];
    const delta: Delta<E> = { type: ActionTypes.DELETE, entries: e };
    this.notifyAll(v, delta);
    values(this.slices).forEach(s => {
      s.deleteA(e);
    });
  }

  /**
   * Delete elements by {@link Predicate}.
   * @param p The predicate.
   * @example Put Todo instances.
```
store.delete(todo1, todo2);
```
   */
  deleteP(p: Predicate<E>) {
    const d: E[] = [];
    values(this.entries).forEach(e => {
      if (p(e)) {
        d.push(e);
        const id = (<any>e)[this.GUID_KEY];
        delete this.entries[id];
        this.deleteActive(e);
        this.deleteIDEntry(e);
      }
    });
    //Create a new array reference to trigger Angular change detection.
    let v: E[] = [...values(this.entries)];
    const delta: Delta<E> = { type: ActionTypes.DELETE, entries: d };
    this.notifyAll(v, delta);
    values(this.slices).forEach(s => {
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
      this.idEntries[(<any>e)[this.ID_KEY]] = e;
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
      delete this.idEntries[(<any>e)[this.ID_KEY]];
    }
  }

  /**
   * Resets the store and all contained slice instances to empty.
   * Also perform delta notification that sends all current store entries.
   * The ActionType.RESET code is sent with the delta notification.  Slices
   * send their own delta notification.
   * 
   * @example Reset the store.
```
store.reset();
```
   */
  reset() {
    const delta: Delta<E> = {
      type: ActionTypes.RESET,
      entries: values(this.entries)
    };
    this.notifyAll([], delta);
    this.entries = {};
    values(this.slices).forEach(s => {
      s.reset();
    });
  }
}
