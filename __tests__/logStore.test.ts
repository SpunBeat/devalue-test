/**
 * @format
 */

import { useLogStore } from '../src/store/useLogStore';

const validDraft = {
  date: '2026-08-11',
  sleepTime: '9:10 pm',
  wakeTime: '4:55 am',
};

beforeEach(() => {
  useLogStore.setState({ logs: [] });
});

describe('useLogStore', () => {
  test('adds a parseable entry and reports success', () => {
    const added = useLogStore.getState().addEntry(validDraft);
    const { logs } = useLogStore.getState();

    expect(added).toBe(true);
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({ date: '2026-08-11' });
  });

  test('rejects an unparseable draft without touching the list', () => {
    const added = useLogStore
      .getState()
      .addEntry({ ...validDraft, wakeTime: 'morning' });

    expect(added).toBe(false);
    expect(useLogStore.getState().logs).toHaveLength(0);
  });

  test('keeps the newest wake time first regardless of insertion order', () => {
    const { addEntry } = useLogStore.getState();

    addEntry({ ...validDraft, date: '2026-08-11' });
    addEntry({ ...validDraft, date: '2026-08-09' });
    addEntry({ ...validDraft, date: '2026-08-10' });

    expect(useLogStore.getState().logs.map(log => log.date)).toEqual([
      '2026-08-11',
      '2026-08-10',
      '2026-08-09',
    ]);
  });

  test('gives every entry a distinct id', () => {
    const { addEntry } = useLogStore.getState();

    addEntry(validDraft);
    addEntry(validDraft);

    const ids = useLogStore.getState().logs.map(log => log.id);

    expect(new Set(ids).size).toBe(2);
  });

  test('removes an entry by id', () => {
    useLogStore.getState().addEntry(validDraft);
    const [{ id }] = useLogStore.getState().logs;

    useLogStore.getState().removeEntry(id);

    expect(useLogStore.getState().logs).toHaveLength(0);
  });
});
