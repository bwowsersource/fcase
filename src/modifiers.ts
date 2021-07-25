import {StateSetter, LocalState} from './state';

export type CB = () => void;
export type ThenCB<TThenReturn> = (args: {
  matchNext: CB;
  __DO__NEXT__: CB;
}) => TThenReturn;

type ThenStatusReturn<TThenReturn> =
  | [executed: true, val: TThenReturn]
  | [executed: false, val: void];

export type ThenFn<TThenReturn> = (
  cb: ThenCB<TThenReturn>
) => ThenStatusReturn<TThenReturn>;

export function matchNextState(
  setBreak: StateSetter<boolean>,
  setPassThrough: StateSetter<boolean>
) {
  return () => {
    setPassThrough(false);
    setBreak(false);
  };
}

export function __DO__NEXT__State(
  setBreak: StateSetter<boolean>,
  setPassThrough: StateSetter<boolean>
) {
  return () => {
    setPassThrough(true);
    setBreak(false);
  };
}

export function makeThen<TThenSource, TThenReturn>(
  val: TThenSource,
  pattern: TThenSource,
  [getBreak, setBreak]: LocalState<boolean>,
  [getPassThrough, setPassThrough]: LocalState<boolean>
): ThenFn<TThenReturn> {
  return (cb: ThenCB<TThenReturn>) => {
    if (!getBreak() && (getPassThrough() || pattern === val)) {
      setPassThrough(false);
      setBreak(true);
      const returnVal = cb({
        matchNext: matchNextState(setBreak, setPassThrough),
        __DO__NEXT__: __DO__NEXT__State(setBreak, setPassThrough),
      });
      return [true, returnVal];
    }
    return [false, undefined];
  };
}
