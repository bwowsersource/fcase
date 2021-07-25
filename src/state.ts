
export type StateSetter<T> = (val: T) => void;
export type StateGetter<T> = () => T;
export type LocalState<T> = [StateGetter<T>, StateSetter<T>];

export function createState<T>(val: T): LocalState<T> {
  let state = val;
  return [
    () => state,
    (val: T) => {
      state = val;
    },
  ];
}