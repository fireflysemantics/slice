import { Todo, TodoSliceEnum, todosFactory } from "./test-setup";
import { GUID } from './utilities';
import { EStore } from "./EStore";
import { Slice } from "./Slice";
import { Observable } from "rxjs";
import { OStoreStart, OStore } from './OStore';

const { values } = Object;

/**
 * CONCERN: OStore Initialization
 * METHODs: `constructor`
 */
it.only("should constructor initialize the OStore instance", () => {

  const START:OStoreStart = {
    K1: { key:'K1', value: 'V1',  },
    K2: { key:'K2', value: 'V2'},
    K3: { key:'K3', value: 'V3', reset: 'V4'}  
  }
  
  let os:OStore = new OStore(START)

  expect(os.count()).toEqual(3)
  expect(os.snapshot(START.K1.key)).toEqual(START.K1.value)
  expect(os.snapshot(START.K2.key)).toEqual(START.K2.value)
  expect(os.snapshot(START.K3.key)).toEqual(START.K3.value)  
});

test('the observable ', done => {

  const START:OStoreStart = {
    K1: { key:'K1', value: 'V1',  },
    K2: { key:'K2', value: 'V2'},
    K3: { key:'K3', value: 'V3', reset: 'V4'}  
  }

  let os:OStore = new OStore(START)

  expect(os.count()).toEqual(3)
  expect(os.snapshot(os.S.K1.key)).toEqual(START.K1.value)
  expect(os.snapshot(os.S.K2.key)).toEqual(START.K2.value)
  expect(os.snapshot(os.S.K3.key)).toEqual(START.K3.value)
  
  const K1$ = os.observe(START.K1.key);
  
  K1$.subscribe(v=>{
    expect(v).toEqual('V1')
  })  
  done();
})