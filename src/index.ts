import {CB, ThenFn, ThenCB, makeThen} from './modifiers';
import {createState, LocalState, StateSetter} from './state';

export default function fcase<Case = boolean, TReturn = void>(
  input?: Case
) {
  type TSourceAndBool = Case | true;
  // if(val === undefined)
  const val = input || true;

  const breakState = createState(false);
  const passThroughState = createState(false);
  const returnState = createState<TReturn | void>(undefined);

  function chain() {
    return {
      case: matchCase,
      caseIn: matchCaseIn,
      caseEval: matchCaseEval,
      default: (cb: CB) => {
        cb();
      },
    };
  }

  type Chain = ReturnType<typeof chain>;
  type Pattern = (chain: {match: Chain} & Chain) => void;
  type Then<T> = {
    then: (cb: T) => Chain;
  };
  function wrapThen(then: ThenFn<TReturn>): Then<ThenCB<TReturn>> {
    return {
      then: (cb: ThenCB<TReturn>): Chain => {
        const [executed, returnVal] = then(cb);
        if (executed) {
          const [_, setReturn] = returnState;
          setReturn(returnVal);
        }

        return chain();
      },
    };
  }

  function matchCase(pattern: TSourceAndBool) {
    return wrapThen(
      makeThen<TSourceAndBool, TReturn>(
        val,
        pattern,
        breakState,
        passThroughState
      )
    );
  }

  function matchCaseIn(pattern: TSourceAndBool[]) {
    return wrapThen(
      makeThen<TSourceAndBool, TReturn>(
        val,
        pattern.find(item => item === val) || pattern[0],
        breakState,
        passThroughState
      )
    );
  }

  function matchCaseEval(pattern: (val: TSourceAndBool) => TSourceAndBool) {
    return wrapThen(
      makeThen<TSourceAndBool, TReturn>(
        val,
        pattern(val),
        breakState,
        passThroughState
      )
    );
  }

  return (pattern: Pattern): TReturn | void => {
    const stub = chain();
    pattern({match: stub, ...stub});
    const [returnVal] = returnState;
    return returnVal();
  };
}
