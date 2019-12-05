import { Observable } from "rxjs";

import { OStore } from "@fs/OStore";

const { values } = Object;

describe("Creating a key value store", () => {
  let ostore: OStore = new OStore();

  it("should create an empty key value store", () => {
    expect(ostore.isEmpty()).toBeTruthy();
    expect(ostore.count()).toEqual(0);
  });
});

describe("Posting values to the store", () => {
  let store: OStore = new OStore();
  store.post("key", "value");
  let o: Observable<any> = store.observe("key");

  it("should return an observable of the value", () => {
    o.subscribe(value => {
      expect(value).toEqual("value");
    });
  });
  it("should return an snapshot of the value", () => {
    expect(store.snapshot("key")).toEqual("value");
  });
});

describe("Checking whether a value exists for the given key", () => {
  let store: OStore = new OStore();
  it("should throw an exception when no subject exists", () => {
    expect(()=>{store.exists('key')}).toThrow(Error);
  });

  it("should return an observable of the value", () => {
    store.post("key", "value");
    let o: Observable<any> = store.observe("key");
    expect(()=>{store.exists('key')}).toBeTruthy();
  });
});


describe("Put(ing) / updating store values", () => {
  let store: OStore = new OStore();
  store.post("key", "value");
  let o: Observable<any> = store.observe("key");

  it("should return an observable of the value", () => {
    store.put("key", "valuepart2");
    o.subscribe(value => {
      expect(value).toEqual("valuepart2");
    });
  });
});

describe("Deleting store values", () => {
  let store: OStore = new OStore();
  store.post("key", "value");

  it("should delete a key entry", () => {
    expect(store.isEmpty()).toBeFalsy();
    store.delete("key");
    expect(store.isEmpty()).toBeTruthy();
  });
});
