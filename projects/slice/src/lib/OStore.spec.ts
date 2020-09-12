import { Todo, TodoSliceEnum, todosFactory } from "./test-setup";
import { GUID } from './utilities';
import { EStore } from "./EStore";
import { Slice } from "./Slice";
import { Observable } from "rxjs";
import { OStoreStart, OStore, ObsValueReset } from './OStore';

const { values } = Object;

const START:OStoreStart = {
  K1: { value: 'V1',  },
  K2: { value: 'V2'},
  K3: { value: 'V3', reset: 'V4'}  
}

interface ISTART {
  K1: ObsValueReset
  K2: ObsValueReset
  K3: ObsValueReset
}

/**
 * CONCERN: OStore Initialization
 * METHODs: `constructor`
 */
it.only("should constructor initialize the OStore instance", () => { 
  
  let os:OStore<ISTART> = new OStore(START)

  expect(os.count()).toEqual(3)
  expect(os.snapshot(START.K1)).toEqual(START.K1.value)
  expect(os.snapshot(START.K2)).toEqual(START.K2.value)
  expect(os.snapshot(START.K3)).toEqual(START.K3.value)  
});

test('the observable ', done => {

  let os:OStore<ISTART> = new OStore(START)

  expect(os.count()).toEqual(3)
  expect(os.snapshot(os.S.K1)).toEqual(START.K1.value)
  expect(os.snapshot(os.S.K2)).toEqual(START.K2.value)
  expect(os.snapshot(os.S.K3)).toEqual(START.K3.value)
  
  const K1$ = os.observe(START.K1);
  
  K1$.subscribe(v=>{
    expect(v).toEqual('V1')
  })
  
  const K1ObservableFromStore = START.K1.obs
  K1ObservableFromStore.subscribe(v=>{
    expect(v).toEqual('V1')
  })
  done();
})