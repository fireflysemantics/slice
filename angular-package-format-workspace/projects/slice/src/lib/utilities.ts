import * as v1 from "uuid/v1";
import { ESTORE_CONFIG_DEFAULT } from "@fs/AbstractStore";

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
export function unique<E>(entities:E[], property:keyof E) {
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
  return v1();
}

/**
 * Set the global identfication property on the instance.
 * 
 * @param e Entity we want to set the global identifier on.
 * @param gid The name of the `gid` property.  If not specified it defaults to `gid`.
 */
export function attachGUID<E>(e: E, gid?:string): string {
  const guid = gid ? gid : ESTORE_CONFIG_DEFAULT.guidKey;
  let id: string = v1();
  (<any>e)[guid] = id;
  return id;
}

/**
 * Set the global identfication property on the instance.
 * 
 * @param e[] Entity array we want to set the global identifiers on.
 * @param gid The name of the `gid` property.  If not specified it defaults to `gid`.
 */
export function attachGUIDs<E>(e: E[], gid?:string) {
  e.forEach(e => {
    attachGUID(e);
  });
}

/**
 * Create a shallow copy of the argument.
 * @param o The object to copy
 */
export function shallowCopy<E>(o:E) {
  return {...o};
}

/**
 * Create a deep copy of the argument.
 * @param o The object to copy
 */
export function deepCopy<E>(o:E) {
  return JSON.parse(JSON.stringify(o));
}

/**
 * Gets the current active value from the `active`
 * Map.  
 * 
 * This is used for the scenario where we are manging
 * a single active instance.  For example 
 * when selecting a book from a collection of books.  
 * 
 * The selected `Book` instance becomes the active value.
 * 
 * @example
 * const book:Book = getActiveValue(bookStore.active);
 * @param m 
 */
export function getActiveValue<E>(m:Map<any, E>) {
  if (m.size) {
    return m.entries().next().value[1];
  }
  return null;
}