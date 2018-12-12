import { Delta, ActionTypes, IEntityIndex, Predicate } from "./types";
import { StoreConfig, STORE_CONFIG_DEFAULT } from "./EStore";
import { AbstractStore } from "./AbstractStore";

const { values, freeze } = Object;

export class Slice<E> extends AbstractStore<E> {
  /* The element entries */
  public entries: IEntityIndex<E> = {};

  /**
   * 
   * perform initial notification to all observers,
   * such that function like {@link combineLatest}{}
   * will execute at least once.
   * 
   * @param entities
   * @param label The slice label
   * @param predicate The slice predicate
   * @param entities Elements to be considered for slicing
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
    entities?: E[]
  ) {
    super();
    this.sc = sc
    ? freeze({ ...STORE_CONFIG_DEFAULT, ...sc })
    : STORE_CONFIG_DEFAULT;

    if (entities) {
      let passed: E[] = this.test(predicate, entities);
      this.addA(passed);
      const delta: Delta<E> = { type: ActionTypes.INTIALIZE, entries: passed };
      this.notifyAll(passed, delta);
    } else {
      const delta: Delta<E> = { type: ActionTypes.INTIALIZE, entries: [] };
      this.notifyAll([], delta);
    }
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
      this.notifyAll([...values(this.entries)], delta);
    }
  }

  /**
   * Add the elements if they satisfy the predicate
   * and notify subscribers that elements were added.
   *
   * @param e The element to be considered for slicing
   */
  addN(...e: E[]) {
    this.addA(e);
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
        d.push(e);
      }
    });
    if (d.length > 0) {
      this.notify.next([...Object.values(this.entries)]);
      const delta: Delta<E> = { type: ActionTypes.POST, entries: d };
      this.notifyAll(d, delta);
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
      const delta: Delta<E> = { type: ActionTypes.DELETE, entries: [e] };
      this.notifyAll(values(this.entries), delta);
    }
  }

  /**
   * @param e The elements to be deleted if it satisfies the predicate
   */
  deleteN(...e: E[]) {
    this.deleteA(e);
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
      const delta: Delta<E> = { type: ActionTypes.DELETE, entries: d };
      this.notifyAll([...values(this.entries)], delta);
    }
  }

  /**
   * Update the slice when an Entity instance mutates.
   *
   * @param e The element to be deleted or added depending on predicate test result
   */
  put(e: E) {
    const id = (<any>e)[this.sc.guidKey];
    if (this.entries[id]) {
      if (!this.predicate(e)) {
        //Note that this is a ActionTypes.DELETE because we are removing the
        //entity from the slice.
        const delta: Delta<E> = { type: ActionTypes.DELETE, entries: [e] };
        delete this.entries[id];
        this.notifyAll([...values(this.entries)], delta);
      }
    } else if (this.predicate(e)) {
      this.entries[id] = e;
      const delta: Delta<E> = { type: ActionTypes.PUT, entries: [e] };
      this.notifyAll([...values(this.entries)], delta);
    }
  }

  /**
   * Update the slice with mutated Entity instances.
   *
   * @param e The elements to be deleted if it satisfies the predicate
   */
  putN(...e: E[]) {
    this.putA(e);
  }

  /**
   * @param e The elements to be deleted if they satisfy the predicate
   */
  putA(e: E[]) {
    const d: E[] = []; //instances to delete
    const u: E[] = []; //instances to update
    e.forEach(e => {
      const id = (<any>e)[this.sc.guidKey];
      if (this.entries[id]) {
        if (!this.predicate(e)) {
          d.push(this.entries[id]);
        }
      } else if (this.predicate(e)) {
        u.push(e);
      }
    });
    if (d.length > 0) {
      //Note that this is a ActionTypes.DELETE because we are removing the
      //entity from the slice.
      const delta: Delta<E> = { type: ActionTypes.DELETE, entries: d };
      d.forEach(e => {
        delete this.entries[(<any>e)[this.sc.guidKey]];
      });
      this.notifyAll([...values(this.entries)], delta);
    }
    if (u.length > 0) {
      const delta: Delta<E> = { type: ActionTypes.PUT, entries: u };
      u.forEach(e => {
        this.entries[(<any>e)[this.sc.guidKey]] = e;
      });
      this.notifyAll([...values(this.entries)], delta);
    }
  }

  /**
   * Resets the slice to empty.
   * 
   */
  reset() {
    let delta: Delta<E> = {
      type: ActionTypes.RESET,
      entries: [...values(this.entries)]
    };
    this.notifyAll([], delta);
    this.entries = {};
  }

  /**
   * Utility method that applies the predicate to an array
   * of entities and return the ones that pass the test.
   *
   * This can be used to create an initial set of values
   * that should be part of the slice, such that the Slices
   * notifier performs a notification with this set of values
   * as soon as the slice is instantiated.
   *
   * @param p
   * @param e
   * @return The the array of entities that pass the predicate test.
   */
  public test(p: Predicate<E>, e: E[]): E[] {
    let v: E[] = [];
    e.forEach((e: E) => {
      if (p(e)) {
        v.push(e);
      }
    });
    return v;
  }
}
