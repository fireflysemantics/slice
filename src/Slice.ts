import { Delta, ActionTypes, IEntityIndex } from "./types";
import { StoreConfig } from "./EStore"; 
import { AbstractStore } from "./AbstractStore";

const { values } = Object;

export class Slice<E> extends AbstractStore<E> {
  
  /* The element entries */
  public entries: IEntityIndex<E> = {};

  /**
   * @param label The slice label
   * @param predicate The slice predicate
   * @param elements Elements to be considered for slicing
   * 
   * @example 
     <pre>
     //Empty slice
     new Slice<Todo>(Todo.COMPLETE, todo=>!todo.complete);

     //Initialized slice
     let todos = [new Todo(false, "You complete me!"), 
                  new Todo(true, "You completed me!")];
     new Slice<Todo>(Todo.COMPLETE, todo=>!todo.complete, todos);
     </pre>
   */
  constructor(
    public label: string,
    public predicate: (e: E) => boolean,
    private sc?: StoreConfig,
    elements?: E[]
  ) {
    super();
    this.sc = sc ? sc : new StoreConfig();
    elements &&
      elements.forEach((e: E) => {
        this.add(e);
      });
   }

  /**
   * Add the element if it satisfies the predicate
   * and notify subscribers that an element was added.
   *
   * @param e The element to be considered for slicing
   */
  add(e: E) {
    if (this.predicate(e)) {
      const id = (<any>e)[this.sc.guidKey];
      this.entries[id] = e;
      this.notify.next([...Object.values(this.entries)]);
      const delta: Delta<E> = { type: ActionTypes.POST, entries: [e] };
      this.notifyDelta.next(delta);
    }
  }

  /**
   * Add the elements if they satisfy the predicate
   * and notify subscribers that elements were added.
   *
   * @param e The element to be considered for slicing
   */
  addN(...e: E[]) {
    const d: E[] = [];
    e.forEach(e => {
      if (this.predicate(e)) {
        const id = (<any>e)[this.sc.guidKey];
        this.entries[id] = e;
        d.push(e);
      }
    });
    if (d.length > 0) {
      this.notify.next([...Object.values(this.entries)]);
      const delta: Delta<E> = { type: ActionTypes.POST, entries: d };
      this.notifyDelta.next(delta);
    }
  }

  /**
   * Add the elements if they satisfy the predicate
   * and notify subscribers that elements were added.
   *
   * @param e The element to be considered for slicing
   */
  addA(e: E[]) {
    const d: E[] = [];
    e.forEach(e => {
      if (this.predicate(e)) {
        const id = (<any>e)[this.sc.guidKey];
        this.entries[id] = e;
      }
    });
    if (d.length > 0) {
      this.notify.next([...Object.values(this.entries)]);
      const delta: Delta<E> = { type: ActionTypes.POST, entries: d };
      this.notifyDelta.next(delta);
    }
  }

  /**
   * Delete an element from the slice.
   *
   * @param e The element to be deleted if it satisfies the predicate
   */
  delete(e: E) {
    if (this.predicate(e)) {
      const id = (<any>e)[this.sc.guidKey];
      delete this.entries[id];
      this.notify.next([...Object.values(this.entries)]);
      const delta: Delta<E> = { type: ActionTypes.DELETE, entries: [e] };
      this.notifyDelta.next(delta);
    }
  }

  /**
   * @param e The elements to be deleted if it satisfies the predicate
   */
  deleteN(...e: E[]) {
    const d: E[] = [];
    e.forEach(e => {
      if (this.predicate(e)) {
        const id = (<any>e)[this.sc.guidKey];
        d.push(this.entries[id]);
        delete this.entries[id];
      }
    });
    if (d.length > 0) {
      this.notify.next([...Object.values(this.entries)]);
      const delta: Delta<E> = { type: ActionTypes.DELETE, entries: d };
      this.notifyDelta.next(delta);
    }
  }

  /**
   * @param e The elements to be deleted if they satisfy the predicate
   */
  deleteA(e: E[]) {
    const d: E[] = [];
    e.forEach(e => {
      if (this.predicate(e)) {
        const id = (<any>e)[this.sc.guidKey];
        d.push(this.entries[id]);
        delete this.entries[id];
      }
    });
    if (d.length > 0) {
      this.notify.next([...Object.values(this.entries)]);
      const delta: Delta<E> = { type: ActionTypes.DELETE, entries: d };
      this.notifyDelta.next(delta);
    }
  }

  /**
   * Delete an element from the slice.
   *
   * @param e The element to be deleted if it satisfies the predicate
   */
  put(e: E) {
    const id = (<any>e)[this.sc.guidKey];
    if (this.entries[id]) {
      if (this.predicate(e)) {
        this.notify.next([...Object.values(this.entries)]);
        const delta: Delta<E> = { type: ActionTypes.DELETE, entries: [e] };
        this.notifyDelta.next(delta);
      } else {
        delete this.entries[id];
      }
    }
  }

  /**
   * @param e The elements to be deleted if it satisfies the predicate
   */
  putN(...e: E[]) {
    const p: E[] = [];
    e.forEach(e => {
      const id = (<any>e)[this.sc.guidKey];
      if (this.entries[id]) {
        if (this.predicate(e)) {
          p.push(this.entries[id]);
        } else {
          delete this.entries[id];
        }
      }
    });
    if (p.length > 0) {
      this.notify.next([...Object.values(this.entries)]);
      const delta: Delta<E> = { type: ActionTypes.DELETE, entries: p };
      this.notifyDelta.next(delta);
    }
  }

  /**
   * @param e The elements to be deleted if they satisfy the predicate
   */
  putA(e: E[]) {
    const p: E[] = [];
    e.forEach(e => {
      const id = (<any>e)[this.sc.guidKey];
      if (this.entries[id]) {
        if (this.predicate(e)) {
          p.push(this.entries[id]);
        } else {
          delete this.entries[id];
        }
      }
    });
    if (p.length > 0) {
      this.notify.next([...Object.values(this.entries)]);
      const delta: Delta<E> = { type: ActionTypes.DELETE, entries: p };
      this.notifyDelta.next(delta);
    }
  }
  
  /**
   * Resets the slice to empty.
   * 
   * Also perform delta notification that sends all current store entries.
   * The ActionType.RESET code is sent with the delta notification.
   */
  reset() {
    const delta: Delta<E> = { type: ActionTypes.RESET, entries: values(this.entries) };
    this.notifyAll([], delta);
    this.entries = {};
  }
}
