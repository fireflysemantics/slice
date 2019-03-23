import { distinct, unique } from "./utilities";

type Todo = {
  id: any;
  title: string;
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
