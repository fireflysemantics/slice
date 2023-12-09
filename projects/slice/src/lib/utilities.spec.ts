import { Observable } from 'rxjs';
import { KeyObsValueReset, ObsValueReset, OStore, OStoreStart } from './OStore';
import {
  distinct,
  unique,
  excludeKeys,
  search,
  onFilteredEvent,
} from './utilities';

type Todo = {
  id: any;
  title: string;
  tags?: string[];
};

it('should create an empty key value store', () => {
  let todos: Todo[] = [
    { id: 1, title: 'Lets do it!' },
    { id: 1, title: 'Lets do it again!' },
    { id: 2, title: 'All done!' },
  ];

  let todos2: Todo[] = [
    { id: 1, title: 'Lets do it!' },
    { id: 2, title: 'All done!' },
  ];

  expect(distinct(todos, 'id').length).toEqual(2);
  expect(unique(todos, 'id')).toBeFalsy();
  expect(distinct(todos2, 'id').length).toEqual(2);
  expect(unique(todos2, 'id')).toBeTruthy();
});

it('should exclude keys', () => {
  let todo: Todo = { id: 1, title: 'Lets do it!' };
  const keys = excludeKeys(todo, ['id']);

  expect(keys.length).toEqual(1);
  expect(keys.includes('title'));
});

it('should search the array of todos ', () => {
  let todos: Todo[] = [
    { id: 1, title: 'Lets do it!' },
    { id: 1, title: 'Lets do it again!' },
    { id: 2, title: 'All done!' },
    { id: 2, title: 'Tagged todo!', tags: ['t1', 't2'] },
  ];

  expect(search('again', todos).length).toEqual(1);
  expect(search('Lets', todos).length).toEqual(2);
  expect(search('All', todos).length).toEqual(1);
  expect(search('t1', todos).length).toEqual(1);
  expect(search('t2', todos).length).toEqual(1);
  //  search('t1',todos).forEach(v=>console.log(v));
});

it('should filter events', (done) => {
  type NamedEvent = { name: string };
  const namedEvent: NamedEvent = { name: 'hilde' };

  const START: OStoreStart = {
    event: { value: namedEvent },
  };
  interface ISTART extends KeyObsValueReset {
    event: ObsValueReset;
  }
  let OS: OStore<ISTART> = new OStore(START);

  const hildeEvents$: Observable<NamedEvent> = onFilteredEvent<NamedEvent>(
    'hilde',
    'name',
    OS.S.event.obs!
  );

  OS.put(OS.S.event, { name: 'dagmar' });
  OS.put(OS.S.event, { name: 'hilde', type: 'event' });

  hildeEvents$.subscribe((e) => {
    expect(e['name']).toContain('hilde');
    done();
  });
});