import { ESTORE_CONFIG_DEFAULT } from "./AbstractStore";
import { Observable, fromEvent, of } from 'rxjs'
import { switchMap, pairwise, debounceTime, distinctUntilChanged, map, filter } from 'rxjs/operators'
import { nanoid} from "nanoid"
import { scrollPosition } from "./models/scrollPosition";

/**
 * Returns all the entities are distinct by the 
 * `property` value argument.  
 * 
 * Note that the implementation uses a `Map<string, E>` to
 * index the entities by key.  Therefore the more recent occurences 
 * matching a key instance will overwrite the previous ones.
 * 
 * @param property The name of the property to check for distinct values by.
 * @param entities The entities in the array.
 * 
 * @example
 ```
  let todos: Todo[] = [
    { id: 1, title: "Lets do it!" },
    { id: 1, title: "Lets do it again!" },
    { id: 2, title: "All done!" }
  ];

  let todos2: Todo[] = [
    { id: 1, title: "Lets do it!" },
    { id: 2, title: "All done!" }
  ];

  expect(distinct(todos, "id").length).toEqual(2);
  expect(distinct(todos2, "id").length).toEqual(2);

 ```
 */
export function distinct<E, K extends keyof E>(entities: E[], property: K): E[] {
  const entitiesByProperty = new Map(entities.map(e => [e[property], e] as [E[K], E]));
  return Array.from(entitiesByProperty.values());
}

/**
 * Returns true if all the entities are distinct by the 
 * `property` value argument.
 * 
 * @param property The name of the property to check for distinct values by.
 * @param entities The entities in the array.
 * 
 * @example
 * 
 ```
  let todos: Todo[] = [
    { id: 1, title: "Lets do it!" },
    { id: 1, title: "Lets do it again!" },
    { id: 2, title: "All done!" }
  ];

  let todos2: Todo[] = [
    { id: 1, title: "Lets do it!" },
    { id: 2, title: "All done!" }
  ];

  expect(unique(todos, "id")).toBeFalsy();
  expect(unique(todos2, "id")).toBeTruthy();
 ```
 */
export function unique<E>(entities: E[], property: keyof E):boolean {
  return entities.length == distinct(entities, property).length ? true : false;
}

/**
 * Create a global ID
 * @return The global id.
 * 
 * @example
 * let e.guid = GUID();
 */
export function GUID() {
  return nanoid();
}

/**
 * Set the global identfication property on the instance.
 * 
 * @param e Entity we want to set the global identifier on.
 * @param gid The name of the `gid` property.  If not specified it defaults to `ESTORE_CONFIG_DEFAULT.guidKey`.
 */
export function attachGUID<E>(e: E, gid?: string): string {
  const guidKey = gid ? gid : ESTORE_CONFIG_DEFAULT.guidKey
  let id: string = nanoid();
  (<any>e)[guidKey] = id
  return id
}

/**
 * Set the global identfication property on the instance.
 * 
 * @param e[] Entity array we want to set the global identifiers on.
 * @param gid The name of the `gid` property.  If not specified it defaults to `gid`.
 */
export function attachGUIDs<E>(e: E[], gid?: string) {
  e.forEach(e => {
    attachGUID(e, gid);
  });
}

/**
 * Create a shallow copy of the argument.
 * @param o The object to copy
 */
export function shallowCopy<E>(o: E) {
  return { ...o };
}

/**
 * Create a deep copy of the argument.
 * @param o The object to copy
 */
export function deepCopy<E>(o: E) {
  return JSON.parse(JSON.stringify(o));
}

/**
 * Gets the current active value from the `active`
 * Map.  
 * 
 * This is used for the scenario where we are managing
 * a single active instance.  For example 
 * when selecting a book from a collection of books.  
 * 
 * The selected `Book` instance becomes the active value.
 * 
 * @example
 * const book:Book = getActiveValue(bookStore.active);
 * @param m 
 */
export function getActiveValue<E>(m: Map<any, E>) {
  if (m.size) {
    return m.entries().next().value[1];
  }
  return null;
}

/**
 * The method can be used to exclude keys from an instance
 * of type `E`.  
 * 
 * We can use this to exclude values when searching an object.
 * 
 * @param entity An instance of type E
 * @param exclude The keys to exclude
 * 
 * @example
 * todo = { id: '1', description: 'Do it!' }
 * let keys = excludeKeys<Todo>(todo, ['id]);
 * // keys = ['description']
 */
export function excludeKeys<E>(entity: any, exclude: string[]) {
  const keys: string[] = Object.keys(entity);
  return keys.filter((key) => {
    return exclude.indexOf(key) < 0;
  });
}

/**
 * 
 * @param entities The entity to search
 * @param exclude Keys to exclude from each entity
 * 
 * @return E[] Array of entities with properties containing the search term.
 */
export function search<E>(query: string = '', entities: E[], exclude: string[] = []): E[] {
  const { isArray } = Array

  query = query.toLowerCase();


  return entities.filter(function (e: E) {
    //Do the keys calculation on each instance e:E
    //because an instance can have optional parameters,
    //and thus we have to check each instance, not just
    //the first one in the array.
    const keys = excludeKeys(e, exclude)
    return keys.some( (key) => {
      const value = (e as any)[key];
      if (!value) {
        return false;
      }
      if (isArray(value)) {
        return value.some(v => {
          return String(v).toLowerCase().includes(query);
        });
      }
      else {
        return String(value).toLowerCase().includes(query);
      }
    })
  });
}

/**
 * @param scrollable The element being scrolled
 * @param debounceMS The number of milliseconds to debounce scroll events
 * @param sp The function returning the scroll position coordinates.
 * @return A boolean valued observable indicating whether the element is scrolling up or down
 */
export function scrollingUp(
  scrollable: any, 
  debounceMS: number, 
  sp: scrollPosition): Observable<boolean> {
  return fromEvent(scrollable, 'scroll').pipe(
    debounceTime(debounceMS), 
    distinctUntilChanged(), 
    map(v => sp()), 
    pairwise(), 
    switchMap(p => {
    const y1 = p[0][1]
    const y2 = p[1][1]
    return y1 - y2 > 0 ? of(false) : of(true)
  }))
}

/**
 * Filters the entities properties to the set contained in the 
 * `keys` array.
 *  
 * @param keys The array of keys that the entity be limited to
 * @param entity The entity to map
 * @return An entity instance that has only the keys provided in the keys array 
 */
export function mapEntity(keys:string[], entity:any) {
  const result:any = {}
  keys.forEach(k=>{
    result[k] = entity[k]
  })
  return result
}

/**
 * Returns an `Observable<E>` instance that 
 * filters for arguments where the property 
 * value matches the provided value.
 * 
 * @param value The value targeted
 * @param propertyName The name of the property to contain the value
 * @param obs The Slice Object Store Observable
 * @returns Observable<E>
 */
 export function onFilteredEvent<E>(
  value: any,
  propertyName: string,
  obs: Observable<E>
): Observable<E> {
  return obs.pipe(filter((e:any) => !!(e && e[propertyName] === value)));
}