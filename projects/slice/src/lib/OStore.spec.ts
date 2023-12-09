import { KeyObsValueReset, ObsValueReset, OStore, OStoreStart } from './';

const START: OStoreStart = {
  K1: { value: 'V1', reset: 'ResetValue' },
};
interface ISTART extends KeyObsValueReset {
  K1: ObsValueReset;
}
let OS: OStore<ISTART>;

describe('Object Store initialization', () => {
  beforeEach(() => {
    OS = new OStore(START);
  });

  it('should have V1 as the store value on initialization', (done) => {
    expect(OS.snapshot(OS.S.K1)).toEqual('V1');
    OS.S.K1.obs?.subscribe((v) => {
      expect(v).toEqual('V1');
      done();
    });
  });
});

describe('Object Store Reset', () => {
  beforeEach(() => {
    OS = new OStore(START);
  });
  it('should have ResetValue as the value when the store is reset', (done) => {
    OS.reset();
    expect(OS.snapshot(OS.S.K1)).toEqual('ResetValue');
    OS.S.K1.obs?.subscribe((v) => {
      expect(v).toEqual('ResetValue');
      done();
    });
  });
});
describe('Object Store PUT API', () => {
  beforeEach(() => {
    OS = new OStore(START);
  });
  it('should update the value after a put=', (done) => {
    const value = 'NewValue';
    OS.put(OS.S.K1, value);
    expect(OS.snapshot(OS.S.K1)).toEqual(value);
    OS.S.K1.obs?.subscribe((v) => {
      expect(v).toEqual(value);
      done();
    });
  });
});

describe('Object Store DELETE API', () => {
  beforeEach(() => {
    OS = new OStore(START);
  });
  it('should delte a value after a delete', (done) => {
    OS.delete(OS.S.K1);
    expect(OS.snapshot(OS.S.K1)).toBeUndefined();
    OS.S.K1.obs?.subscribe((v) => {
      expect(v).toBeUndefined();
      done();
    });
  });
});

describe('Object Store Clear API', () => {
  beforeEach(() => {
    OS = new OStore(START);
  });
  it('should delte a value after a delete', (done) => {
    OS.clear();
    expect(OS.snapshot(OS.S.K1)).toBeUndefined();
    OS.S.K1.obs?.subscribe((v) => {
      expect(v).toBeUndefined();
      done();
    });
  });
});


describe('Object Store Count API', () => {
  beforeEach(() => {
    OS = new OStore(START);
  });
  it('should return true when a value does exists for a given key', () => {
    expect(OS.count()).toEqual(1);
  });
});


describe('Object Store Exists API', () => {
  beforeEach(() => {
    OS = new OStore(START);
  });
  it('should return true when a value does exists for a given key', () => {
    expect(OS.exists(OS.S.K1)).toBeTrue();
  });
  it('should return false when a value does not exist for a given key', () => {
    expect(OS.exists('DOES_NOT_EXIST')).toBeFalse();
  });
});

describe('Object Store isEmpty API', () => {
  beforeEach(() => {
    OS = new OStore(START);
  });
  it('should return false when is empty is called on an initialized store', () => {
    expect(OS.isEmpty()).toBeFalse();
  });
});


