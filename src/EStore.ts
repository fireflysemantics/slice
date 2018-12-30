import v1 from "uuid/v1";
import { AbstractStore } from "./AbstractStore";
import { StoreConfig } from './StoreConfig';

import {
  ActionTypes,
  IEntityIndex,
  Predicate,
  ISliceIndex,
  Delta
} from "./types";
import { Slice } from "./Slice";
import { ReplaySubject } from "rxjs";

const { values } = Object;

export class EStore<E> extends AbstractStore<E> {
  /**
   * Store constructor (Initialization with element is optional)
   *
   * perform initial notification to all observers,
   * such that function like {@link combineLatest}{}
   * will execute at least once.
   * @param entities
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
  private notifyActive = new ReplaySubject<E>(1);

  /** The currently active entity. */
  private _active: E = null;

  /**
   * Set the currently active entity and notify observers.
   */
  set active(active: E) {
    this._active = active;
    this.notifyActive.next(this._active);
  }

  /**
   * @return A snapshot of the currently active entity.
   */
  get active() {
    return this._active;
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

  /** The current loading state. */
  private _loading: boolean = false;

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
   * @example
     <pre>
     source.addSlice(todo => todo.complete, TodoSlices.COMPLETE);
     </pre>
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
   * @example
     <pre>
     source.removeSlice(p, 'TODO_COMPLETE');
     </pre>
   * 
   */
  removeSlice(label: string) {
    delete this.slices[label];
  }

  /**
   * Get a slice
   * @param label The label identifying the slice
   * 
   * @example
     <pre>
     source.getSlice('TODO_COMPLETE');
     </pre>
   * 
   */
  getSlice(label: string): Slice<E> {
    return this.slices[label];
  }

  /**
   * Post (Add a new) element to the store.
   * @param e
   */
  post(e: E) {
    const guid: string = v1();
    (<any>e)[this.config.guidKey] = guid;
    this.entries[guid] = e;
    this.updateIDEntry(e);
    values(this.slices).forEach(s => {
      s.add(e);
    });
    let v: E[] = [...values(this.entries)];
    const delta: Delta<E> = { type: ActionTypes.POST, entries: [e] };
    this.notifyAll(v, delta);
  }

  /**
   * Post elements to the store.
   * @param e
   */
  postN(...e: E[]) {
    e.forEach(e => {
      const guid: string = v1();
      (<any>e)[this.config.guidKey] = guid;
      this.entries[guid] = e;
      this.updateIDEntry(e);
    });
    values(this.slices).forEach(s => {
      s.addA(e);
    });
    let v: E[] = [...values(this.entries)];
    const delta: Delta<E> = { type: ActionTypes.POST, entries: e };
    this.notifyAll(v, delta);
  }

  /**
   * Post (Add) an array of elements to the store.
   * @param e
   */
  postA(e: E[]) {
    this.postN(...e);
  }

  /**
   * Put (Update) an element.
   * @param e
   */
  put(e: E) {
    let id: string = (<any>e)[this.config.guidKey];
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
   */
  putN(...e: E[]) {
    this.putA(e);
  }

  /**
   * Put (Update) the array of elements.
   * @param e
   */
  putA(e: E[]) {
    e.forEach(e => {
      let id: string = (<any>e)[this.config.guidKey];
      this.entries[id] = e;
      this.updateIDEntry(e);
    });
    let v: E[] = [...values(this.entries)];
    this.notify.next(v);
    const delta: Delta<E> = { type: ActionTypes.PUT, entries: e };
    this.notifyDelta.next(delta);
    values(this.slices).forEach(s => {
      s.putA(e);
    });
  }

  delete(e: E) {
    const id = (<any>e)[this.config.guidKey];
    delete this.entries[id];
    this.deleteIDEntry(e);
    values(this.slices).forEach(s => {
      delete s.entries[id];
    });
    let v: E[] = [...values(this.entries)];
    const delta: Delta<E> = { type: ActionTypes.DELETE, entries: [e] };
    this.notifyAll(v, delta);
    values(this.slices).forEach(s => {
      s.delete(e);
    });
  }

  deleteN(...e: E[]) {
    this.deleteA(e);
  }

  deleteA(e: E[]) {
    e.forEach(e => {
      const id = (<any>e)[this.config.guidKey];
      delete this.entries[id];
      this.deleteIDEntry(e);
      values(this.slices).forEach(s => {
        delete s.entries[id];
      });
    });
    let v: E[] = [...values(this.entries)];
    const delta: Delta<E> = { type: ActionTypes.DELETE, entries: e };
    this.notifyAll(v, delta);
    values(this.slices).forEach(s => {
      s.deleteA(e);
    });
  }

  deleteP(p: Predicate<E>) {
    const d: E[] = [];
    values(this.entries).forEach(e => {
      if (p(e)) {
        d.push(e);
        const id = (<any>e)[this.config.guidKey];
        delete this.entries[id];
        this.deleteIDEntry(e);
      }
    });
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
    if ((<any>e)[this.config.idKey]) {
      this.idEntries[(<any>e)[this.config.idKey]] = e;
    }
  }

  /**
   * If the entity has the `id` key initialized with a value,
   * then also delete the entity to the `idEntries`.
   *
   * @param e The element to be added to the `idEntries`.
   */
  private deleteIDEntry(e: E) {
    if ((<any>e)[this.config.idKey]) {
      delete this.idEntries[(<any>e)[this.config.idKey]];
    }
  }

  /**
   * Resets the store and all contained slice instances to empty.
   * Also perform delta notification that sends all current store entries.
   * The ActionType.RESET code is sent with the delta notification.  Slices
   * send their own delta notification.
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
