import { Delta, ActionTypes, Predicate } from "./models"
import { AbstractStore } from "./AbstractStore"
import { EStore } from "./EStore";
import { combineLatest } from 'rxjs';

const { isArray } = Array

export class Slice<E> extends AbstractStore<E> {


    /* The slice element entries */
    public override entries: Map<string, E> = new Map();

    /**
     * perform initial notification to all observers,
     * such that operations like {@link combineLatest}{}
     * will execute at least once.
     * 
     * @param label The slice label
     * @param predicate The slice predicate
     * @param eStore The EStore instance containing the elements considered for slicing
     * 
     * @example 
     * ```
     *  //Empty slice
     *  new Slice<Todo>(Todo.COMPLETE, todo=>!todo.complete);
     *
     *  //Initialized slice
     *  let todos = [new Todo(false, "You complete me!"), 
     *               new Todo(true, "You completed me!")];
     *  new Slice<Todo>(Todo.COMPLETE, todo=>!todo.complete, todos);
     *  ```
     */
    constructor(
        public label: string,
        public predicate: Predicate<E>,
        public eStore: EStore<E>) {
        super();
        const entities: E[] = eStore.allSnapshot()
        this.config = eStore.config
        let passed: E[] = this.test(predicate, entities);
        const delta: Delta<E> = { type: ActionTypes.INTIALIZE, entries: passed };
        this.post(passed);
        this.notifyDelta.next(delta)
    }

    /**
     * Add the element if it satisfies the predicate
     * and notify subscribers that an element was added.
     *
     * @param e The element to be considered for slicing
     */
    post(e: E | E[]) {
        if (isArray(e)) {
            this.postA(e)
        }
        else {
            if (this.predicate(e)) {
                const id = (<any>e)[this.config.guidKey];
                this.entries.set(id, e);
                const delta: Delta<E> = { type: ActionTypes.POST, entries: [e] };
                this.notifyAll([...Array.from(this.entries.values())], delta);
            }
        }
    }

    /**
     * Add the elements if they satisfy the predicate
     * and notify subscribers that elements were added.
     *
     * @param e The element to be considered for slicing
     */
    postN(...e: E[]) {
        this.postA(e);
    }

    /**
     * Add the elements if they satisfy the predicate
     * and notify subscribers that elements were added.
     *
     * @param e The element to be considered for slicing
     */
    postA(e: E[]) {
        const d: E[] = [];
        e.forEach(e => {
            if (this.predicate(e)) {
                const id = (<any>e)[this.config.guidKey];
                this.entries.set(id, e);
                d.push(e);
            }
        });
        const delta: Delta<E> = { type: ActionTypes.POST, entries: d };
        this.notifyAll([...Array.from(this.entries.values())], delta);
    }

    /**
     * Delete an element from the slice.
     *
     * @param e The element to be deleted if it satisfies the predicate
     */
    delete(e: E | E[]) {
        if (isArray(e)) {
            this.deleteA(e)
        }
        else {
            if (this.predicate(e)) {
                const id = (<any>e)[this.config.guidKey]
                this.entries.delete(id)
                const delta: Delta<E> = { type: ActionTypes.DELETE, entries: [e] }
                this.notifyAll(Array.from(this.entries.values()), delta)
            }
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
        const d: E[] = []
        e.forEach(e => {
            if (this.predicate(e)) {
                const id = (<any>e)[this.config.guidKey]
                d.push(this.entries.get(id)!)
                this.entries.delete(id)
            }
        });
        const delta: Delta<E> = { type: ActionTypes.DELETE, entries: d };
        this.notifyAll([...Array.from(this.entries.values())], delta);
    }

    /**
     * Update the slice when an Entity instance mutates.
     *
     * @param e The element to be added or deleted depending on predicate reevaluation
     */
    put(e: E | E[]) {
        if (isArray(e)) {
            this.putA(e)
        }
        else {
            const id = (<any>e)[this.config.guidKey];
            if (this.entries.get(id)) {
                if (!this.predicate(e)) {
                    //Note that this is a ActionTypes.DELETE because we are removing the
                    //entity from the slice.
                    const delta: Delta<E> = { type: ActionTypes.DELETE, entries: [e] };
                    this.entries.delete(id);
                    this.notifyAll([...Array.from(this.entries.values())], delta);
                }
            } else if (this.predicate(e)) {
                this.entries.set(id, e);
                const delta: Delta<E> = { type: ActionTypes.PUT, entries: [e] };
                this.notifyAll([...Array.from(this.entries.values())], delta);
            }    
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
     * @param e The elements to be put
     */
    putA(e: E[]) {
        const d: E[] = []; //instances to delete
        const u: E[] = []; //instances to update
        e.forEach(e => {
            const id = (<any>e)[this.config.guidKey];
            if (this.entries.get(id)) {
                if (!this.predicate(e)) {
                    d.push(this.entries.get(id)!);
                }
            } else if (this.predicate(e)) {
                u.push(e);
            }
        });
        if (d.length > 0) {
            d.forEach(e => {
                this.entries.delete((<any>e)[this.config.guidKey])
            });
            const delta: Delta<E> = { type: ActionTypes.DELETE, entries: d };
            this.notifyAll([...Array.from(this.entries.values())], delta);
        }
        if (u.length > 0) {
            u.forEach(e => {
                this.entries.set((<any>e)[this.config.guidKey], e);
            });
            const delta: Delta<E> = { type: ActionTypes.PUT, entries: u };
            this.notifyAll([...Array.from(this.entries.values())], delta);
        }
    }

    /**
     * Resets the slice to empty.
     */
    reset() {
        let delta: Delta<E> = {
            type: ActionTypes.RESET,
            entries: [...Array.from(this.entries.values())]
        };
        this.notifyAll([], delta);
        this.entries = new Map();
    }

    /**
     * Utility method that applies the predicate to an array
     * of entities and return the ones that pass the test.
     *
     * Used to create an initial set of values
     * that should be part of the `Slice`.
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
