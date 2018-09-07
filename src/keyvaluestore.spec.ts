import { expect } from "chai";
import "mocha";
import { Observable } from "rxjs";

import { KeyValueStore } from "@fs/KeyValueStore";

const { values } = Object;

describe("Creating a key value store", () => {
  let store: KeyValueStore = new KeyValueStore();

  it("should create an empty key value store", () => {
    expect(store.isEmpty()).to.be.true;
    expect(store.count()).to.equal(0);
  });
});

describe("Storing values in the store", () => {
  let store: KeyValueStore = new KeyValueStore();
  store.post("key", "value");
  let o: Observable<any> = store.select("key");

  it("should return an observable of the value", () => {
    o.subscribe(value => {
      expect(value).to.equal("value");
      store.put("key", "valuepart2");
      o.subscribe(value => {
        expect(value).to.equal("valuepart2");
      });
    });
  });
});

describe("Deleting store values", () => {
  let store: KeyValueStore = new KeyValueStore();
  store.post("key", "value");

  it("should delete a key entry", () => {
    expect(store.isEmpty()).to.be.false;
    store.delete("key");
    expect(store.isEmpty()).to.be.true;
  });
});
