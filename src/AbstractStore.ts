import { Predicate } from "@fs/utilities";
import { IEntityIndex, ISliceIndex } from "@fs/types";
import { Delta } from "@fs/types";
import { ReplaySubject, Observable, of } from "rxjs";

const { values } = Object;

export abstract class AbstractStore<E> {
  
  /* The slice element entries */
  public entries: IEntityIndex<E> = {};

  /**
   * Create notifications that broacast
   * the entire set of entries.
   */
  protected notify = new ReplaySubject<E[]>(1);

  /**
   * Create notifications that broacast
   * delta increments to the slice.
   */
  protected notifyDelta = new ReplaySubject<Delta<E>>(1);

  /**
   * Subscribe to receive entry updates.
   * @example
     <pre>
     let todos$ = source.subscribe();
     </pre>
   */
  public subscribe(): Observable<E[]> {
    return this.notify.asObservable();
  }

  /**
   * Subscribe to receive delta slice updates.
   * @example
     <pre>
     let todos$ = source.subscribeDelta();
     </pre>
   */
  public subscribeDelta(): Observable<Delta<E>> {
    return this.notifyDelta.asObservable();
  }

  /**
   * Select the entries that match the predicate.
   *
   * @param p The predicate used to query for the selection.
   * @return An array containing the elements that match the predicate.
   * 
   * @example 
   * @example 
     <pre>
     let todos:Observable<Todo[]>=slice.select(todo=>todo.title.length>100);
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
   * Select all entries
   * 
   * @return Observable of all the slice entries.
   * 
   * @example
     <pre>
     let selectedTodos:Todo[] = source.selectAll();
     </pre>
   */
  selectAll(): E[] {
    return values(this.entries);
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
   * Find an instance by the attached uuid.
   *
   * @param uuid
   * @return The model instance if it is sliced, null otherwise.
   * 
   * @example 
     <pre>
     const id = todo[GUID];
     const sametodo:Todo = selectGUID(id);
     expect(sametodo).equal(todo);
     </pre>
   */
  selectGUID(uuid: string): E {
    return this.entries[uuid];
  }

  /**
   * Check whether the number of entries is zero.
   * 
   * @example
     <pre>
     source.isEmpty();
     </pre>
   */
  isEmpty() {
    return values(this.entries).length == 0;
  }

  /**
   * Returns the number of entries contained.
   */
  count() {
    return values(this.entries).length;
  }
}
