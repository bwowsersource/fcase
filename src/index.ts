type CB = () => void;
type caseCB = (args: { matchNext: CB; __DO__NEXT__: CB }) => void;
type StateSetter<T> = (val: T) => void;
type StateGetter<T> = () => T;
type LocalState<T> = [StateGetter<T>, StateSetter<T>];
type ThenFn = (cb: caseCB) => void;

function matchNextState(
  setBreak: StateSetter<boolean>,
  setPassThrough: StateSetter<boolean>
) {
  return () => {
    setPassThrough(false);
    setBreak(false);
  };
}

function __DO__NEXT__State(
  setBreak: StateSetter<boolean>,
  setPassThrough: StateSetter<boolean>
) {
  return () => {
    setPassThrough(true);
    setBreak(false);
  };
}

function makeThen<T>(
  val: T,
  pattern: T,
  [getBreak, setBreak]: LocalState<boolean>,
  [getPassThrough, setPassThrough]: LocalState<boolean>
): ThenFn {
  return (cb: caseCB) => {
    if (!getBreak() && (getPassThrough() || pattern === val)) {
      setPassThrough(false);
      setBreak(true);
      cb({
        matchNext: matchNextState(setBreak, setPassThrough),
        __DO__NEXT__: __DO__NEXT__State(setBreak, setPassThrough),
      });
      return true;
    }
    return false;
  };
}


function createState<T>(val: T): LocalState<T> {
  let state = val;
  return [
    () => state,
    (val: T) => {
      state = val;
    },
  ];
}


function match<T = boolean>(input?: T) {
  // if(val === undefined)
  const val = input || true;

  const breakState = createState(false);
  const passThroughState = createState(false);

  function wrapInThen(then: ThenFn) {
    return {
      then: (cb: caseCB) => {
        then(cb);
        return chain();
      },
    };
  }

  const matchCase = (pattern: T) => {
    return wrapInThen(makeThen(val, pattern, breakState, passThroughState));
  };

  const matchCaseIn = (pattern: T[]) => {
    return wrapInThen(
      makeThen(
        val,
        pattern.find(item => item === val) || pattern[0],
        breakState,
        passThroughState
      )
    );
  };

  const matchCaseEval = (pattern: (val: T | boolean) => T) => {
    return wrapInThen(
      makeThen(val, pattern(val), breakState, passThroughState)
    );
  };

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

  return chain();
}

const c = 222;
match<string | number>(c)
  .case(22)
  .then(() => {
    console.log('wrong match');
  })
  .case(222)
  .then(({}) => {
    console.log('number matched');
    // keepGoing();
  })
  .case('222')
  .then(() => console.log('actual match'));

export default match;

const w = 7,
  x = 10;
function exist(val: any) {
  return !!val;
}

match()
  .case(w === 7)
  .then(({ __DO__NEXT__ }) => {
    console.log('w==7');
    __DO__NEXT__();
  })
  .case(x > 10)
  .then(({ matchNext }) => {
    console.log('x!==10');
    matchNext();
  })
  .case(x * w > 10)
  .then(({ matchNext }) => {
    console.log('x * w > 10');
    matchNext();
  })
  .caseIn([false, false, false, false])
  .then(({ matchNext }) => {
    console.log('matched last all false');
    matchNext();
  })
  .caseEval(exist)
  .then(() => {
    console.log('eval success');
  });
