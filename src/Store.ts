import { Slice } from "@fs/Slice";
import { attachGUID, attachGUIDs, Predicate } from "@fs/utilities";
import { ISliceIndex } from "@fs/types";
import { GUID } from "@fs/constants";
import { AbstractStore } from "@fs/AbstractStore";
import { Delta } from "./types";
import { ActionTypes } from "./types";

const { values } = Object;

export class Store<E> extends AbstractStore<E> {
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
     source.addSlice(p, 'TODO_COMPLETE');
     </pre>
   * 
   */
  addSlice(p: Predicate<E>, label: string) {
    const slice: Slice<E> = new Slice(label, p);
    this.slices[slice.label] = slice;
    values(this.entries).forEach(e=>slice.add(e));
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
  getSlice(label: string):Slice<E> {
    return this.slices[label];
  }


  /**
   * Store constructor (Initialization with element is optional)
   * 
   * @param elements 
   */
  constructor(private elements?: E[]) {
    super();
    elements && this.postA(elements);
  }

  /**
   * Post (Add a new) element to the store.
   * @param e
   */
  post(e: E) {
    const id: string = attachGUID(e);
    this.entries[id] = e;
    values(this.slices).forEach(s => {
      s.add(e);
    });
    let v: E[] = [...Object.values(this.entries)];
    this.notify.next(v);
    const delta: Delta<E> = { type: ActionTypes.POST, entries: [e] };
    this.notifyDelta.next(delta);
  }

  /**
   * Post elements to the store.
   * @param e
   */
  postN(...e: E[]) {
    e.forEach(e => {
      const id: string = attachGUID(e);
      this.entries[id] = e;
    });
    values(this.slices).forEach(s => {
      s.addA(e);
    });
    let v: E[] = [...Object.values(this.entries)];
    this.notify.next(v);
    const delta: Delta<E> = { type: ActionTypes.POST, entries: e };
    this.notifyDelta.next(delta);
  }

  /**
   * Post (Add) an array of elements to the store.
   * @param e
   */
  postA(e: E[]) {
    e.forEach(e => {
      const id: string = attachGUID(e);
      this.entries[id] = e;
    });
    values(this.slices).forEach(s => {
      s.addA(e);
    });
    let v: E[] = [...Object.values(this.entries)];
    this.notify.next(v);
    const delta: Delta<E> = { type: ActionTypes.POST, entries: e };
    this.notifyDelta.next(delta);
  }

  /**
   * Put (Update) an element.
   * @param e
   */
  put(e: E) {
    let id: string = (<any>e)[GUID];
    this.entries[id] = e;
    let v: E[] = [...Object.values(this.entries)];
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
      let id: string = (<any>e)[GUID];
      this.entries[id] = e;
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
      let id: string = (<any>e)[GUID];
      this.entries[id] = e;
    });
    let v: E[] = [...Object.values(this.entries)];
    this.notify.next(v);
    const delta: Delta<E> = { type: ActionTypes.PUT, entries: e };
    this.notifyDelta.next(delta);
  }

  delete(e: E) {
    const id = (<any>e)[GUID];
    delete this.entries[id];

    values(this.slices).forEach(s => {
      delete s.entries[id];
    });
    let v: E[] = [...Object.values(this.entries)];
    this.notify.next(v);
    const delta: Delta<E> = { type: ActionTypes.DELETE, entries: [e] };
    this.notifyDelta.next(delta);
  }

  deleteN(...e: E[]) {
    e.forEach(e => {
      const id = (<any>e)[GUID];
      delete this.entries[id];

      values(this.slices).forEach(s => {
        delete s.entries[id];
      });
    });
    let v: E[] = [...Object.values(this.entries)];
    this.notify.next(v);
    const delta: Delta<E> = { type: ActionTypes.DELETE, entries: e };
    this.notifyDelta.next(delta);
  }

  deleteA(e: E[]) {
    e.forEach(e => {
      const id = (<any>e)[GUID];
      delete this.entries[id];

      values(this.slices).forEach(s => {
        delete s.entries[id];
      });
    });
    let v: E[] = [...Object.values(this.entries)];
    this.notify.next(v);
    const delta: Delta<E> = { type: ActionTypes.DELETE, entries: e };
    this.notifyDelta.next(delta);
  }

  deleteP(p: Predicate<E>) {
    const d: E[] = [];
    Object.values(this.entries).forEach(e => {
      if (p(e)) {
        d.push(e);
        const id = (<any>e)[GUID];
        delete this.entries[id];

        values(this.slices).forEach(s => {
          delete s.entries[id];
        });
      }
    });
    let v: E[] = [...Object.values(this.entries)];
    this.notify.next(v);
    const delta: Delta<E> = { type: ActionTypes.DELETE, entries: d };
    this.notifyDelta.next(delta);
  }
}