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
export function distinct<E>(entities:E[], property:keyof E):E[] {
    let map:Map<any, E> = new Map();
    entities.forEach((e:E)=>{
        map.set(e[property], e);
    });
    return Array.from(map.values());
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