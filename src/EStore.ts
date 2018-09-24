import v1 from "uuid/v1";
import { AbstractStore } from "@fs/AbstractStore";
import { Delta } from "@fs/types";
import { ActionTypes, IEntityIndex, Predicate, ISliceIndex } from "@fs/types";
import { Slice } from "@fs/Slice";

const { values } = Object;

export const STORE_CONFIG_DEFAULT: StoreConfig = {
  idKey: "id",
  guidKey: "gid"
};

export class StoreConfig {
  public idKey: string;
  public guidKey: string;
  constructor(c?: Partial<StoreConfig>) {
    let config = Object.assign({ ...STORE_CONFIG_DEFAULT }, c);
    this.idKey = config.idKey;
    this.guidKey = config.guidKey;
  }
}

export class EStore<E> extends AbstractStore<E> {
  /**
   * Store constructor (Initialization with element is optional)
   *
   * @param elements
   */
  constructor(private elements?: E[], public config?: StoreConfig) {
    super();
    this.config = config ? config : new StoreConfig();
    elements && this.postA(elements);
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
    const slice: Slice<E> = new Slice(label, p, this.config);
    this.slices[slice.label] = slice;
    values(this.entries).forEach(e => slice.add(e));
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

  /* The element entries that are keyed by an id generated on the server */
  public idEntries: IEntityIndex<E> = {};

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
  }

  /**
   * Put (Update) an element.
   * @param e
   */
  putN(...e: E[]) {
    e.forEach(e => {
      let id: string = (<any>e)[this.config.guidKey];
      this.entries[id] = e;
      this.updateIDEntry(e);
    });
    let v: E[] = [...Object.values(this.entries)];
    this.notify.next(v);
    const delta: Delta<E> = { type: ActionTypes.PUT, entries: e };
    this.notifyDelta.next(delta);
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
  }

  deleteN(...e: E[]) {
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
  }

  deleteP(p: Predicate<E>) {
    const d: E[] = [];
    values(this.entries).forEach(e => {
      if (p(e)) {
        d.push(e);
        const id = (<any>e)[this.config.guidKey];
        delete this.entries[id];
        this.deleteIDEntry(e);

        values(this.slices).forEach(s => {
          delete s.entries[id];
        });
      }
    });
    let v: E[] = [...values(this.entries)];
    const delta: Delta<E> = { type: ActionTypes.DELETE, entries: d };
    this.notifyAll(v, delta);
  }

  private updateIDEntry(e: E) {
    if ((<any>e)[this.config.idKey]) {
      this.idEntries[(<any>e)[this.config.idKey]] = e;
    }
  }
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
    const delta: Delta<E> = { type: ActionTypes.RESET, entries: values(this.entries) };
    this.notifyAll([], delta);
    this.entries = {};
    values(this.slices).forEach(s => {
      s.reset();
    });
  }      
}
