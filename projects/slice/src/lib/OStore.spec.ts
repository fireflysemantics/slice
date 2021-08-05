import { OStoreStart, OStore, ObsValueReset, KeyObsValueReset } from './OStore';

const START:OStoreStart = {
  K1: { value: 'V1',  },
  K2: { value: 'V2'},
  K3: { value: 'V3', reset: 'V4'}  
}

interface ISTART extends KeyObsValueReset  {
  K1: ObsValueReset
  K2: ObsValueReset
  K3: ObsValueReset
}

/**
 * CONCERN: OStore Initialization
 * METHODs: `constructor`
 */
it("should constructor initialize the OStore instance", () => { 
  
  let os:OStore<ISTART> = new OStore(START)

  expect(os.count()).toEqual(3)
  expect(os.snapshot(START.K1)).toEqual(START.K1.value)
  expect(os.snapshot(START.K2)).toEqual(START.K2.value)
  expect(os.snapshot(START.K3)).toEqual(START.K3.value)  
});

test('clear', () => { 
  let os:OStore<ISTART> = new OStore(START)
  expect(os.isEmpty()).toBeFalsy()
  os.clear()
  expect(os.isEmpty()).toBeTruthy()
})

test('exists', () => { 
  let os:OStore<ISTART> = new OStore(START)
  expect(os.exists(os.S.K1)).toBeTruthy()
  expect(os.exists("NOTKEYED")).toBeFalsy()
  os.put(os.S.K1, null)
  expect(os.exists(os.S.K1)).toBeFalsy()
  os.put(os.S.K1, undefined)
  expect(os.exists(os.S.K1)).toBeFalsy()
})

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
  
  const K1ObservableFromStore = os.S.K1.obs
  K1ObservableFromStore.subscribe(v=>{
    expect(v).toEqual('V1')
  })
  done();
})