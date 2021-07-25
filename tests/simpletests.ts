// import {assert} from 'chai'
// import * as sinon from 'sinon';
import fcase from '../src';
import {
  finishTest,
  shouldNotCall,
  testDivider,
  testFail,
  testInfo,
  testSuccess,
} from './utils';

testInfo(
  'I spent one whole afternoon trying to make Mocha and Jasmine work. Gave up when my hunger took over'
);
testInfo("I've never set up either of them in an es module project with typescript");
testInfo(
  'If someone can help me out on how to set up either of them, feel free to make a PR'
);
testInfo('This is a rudimentary test. It does what tests are supposed to do');
testDivider('\n');

const c = 222;
testInfo('Testing against', c);
const result = fcase<string | number, number>(c)(({match}) => {
  match
    .case(22)
    .then(shouldNotCall('Match wrong value', 1))
    .case(22)
    .then(shouldNotCall('Match wrong value when checked again', 2))
    .case(222)
    .then(({}) => {
      testSuccess('Match number 222');
      return 3;
    })
    .case('222')
    .then(shouldNotCall('Match string "222"', 4));
});

result === 3
  ? testSuccess('Match 3rd case')
  : testFail('Did not match 3rd case');

finishTest();

const w = 7,
  x = 10;
function exist(val: any) {
  return !!val;
}

testInfo(
  'Testing without a test subject. Test subject defaults to boolean(true)'
);

fcase()(match =>
  match
    .case(w === 7)
    .then(({__DO__NEXT__}) => {
      testSuccess('Executed:Exact match');
      __DO__NEXT__();
    })
    .case(x > 10)
    .then(({matchNext}) => {
      testSuccess(
        'Executed: next block without a match but called __DO__NEXT__ in previous block'
      );
      matchNext();
    })
    .case(x * w > 10)
    .then(({matchNext}) => {
      testSuccess(
        'Executed: called matchNext from previous and condition matched'
      );
      matchNext();
    })
    .caseIn([false, false, false, false])
    .then(
      shouldNotCall(
        'Execute when matchNext called in previous block and conditions did not match'
      )
    )
    .caseIn([false, false, true, false])
    .then(({matchNext}) => {
      testSuccess(
        'caseIn: previous block called matchNext and one case in array matched'
      );
      matchNext();
    })
    .caseEval(exist)
    .then(() => {
      testSuccess('matchNext called in previous block and caseEval matched');
    })
);

finishTest();
