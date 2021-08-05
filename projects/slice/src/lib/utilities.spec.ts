import { distinct, unique, excludeKeys, search } from "./utilities";

type Todo = {
  id: any
  title: string
  tags?: string[]
};

it("should create an empty key value store", () => {
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
  expect(unique(todos, "id")).toBeFalsy();
  expect(distinct(todos2, "id").length).toEqual(2);
  expect(unique(todos2, "id")).toBeTruthy();
});

it("should exclude keys", () => {
  let todo: Todo = { id: 1, title: "Lets do it!" }
  const keys = excludeKeys(todo, ['id']);
  
  expect(keys.length).toEqual(1);
  expect(keys.includes('title'));
});

it("should search the array of todos ", () => {
  let todos: Todo[] = [
    { id: 1, title: "Lets do it!" },
    { id: 1, title: "Lets do it again!" },
    { id: 2, title: "All done!" },
    { id: 2, title: "Tagged todo!", tags: ['t1', 't2'] }
  ];

  expect(search('again', todos).length).toEqual(1);
  expect(search('Lets', todos).length).toEqual(2);
  expect(search('All', todos).length).toEqual(1);
  expect(search('t1', todos).length).toEqual(1);
  expect(search('t2', todos).length).toEqual(1);
//  search('t1',todos).forEach(v=>console.log(v));
});