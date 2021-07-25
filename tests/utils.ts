import * as colors from 'colors';
import {fake} from 'sinon';

let fails: string[] = [];
let didNotCalls: any[] = [];

export function testSuccess(msg: string, ...args: any[]) {
  console.log(colors.green(msg), ...args);
}

export function testFail(msg: string, ...args: any[]) {
  console.log(colors.red(msg), ...args);
  fails.push(msg);
}

export function testInfo(msg: string, ...args: any[]) {
  console.log(colors.blue(msg), ...args);
}

export function testDivider(str: string = '') {
  console.log(Array(80).fill('=').join('') + '\n', str);
}

export function shouldNotCall<T = any>(msg: string, returnVal?: T) {
  const didNotCall = fake.returns(returnVal);
  didNotCalls.push([didNotCall, msg]);
  return () => {
    testFail(msg);
    return didNotCall();
  };
}

export function finishTest() {
  if (fails.length === 0) {
    didNotCalls.forEach(([fake, message]) => {
      if (fake.notCalled) testSuccess(colors.bold('Did not call: ') + message);
    });
    didNotCalls = [];
    fails = [];
    return testDivider(colors.bold('Test success\n'));
  }
  const failMessages = colors.red(fails.join('\n'));
  testDivider(colors.red.bold(`${fails.length} test(s) failed`));

  throw new Error(failMessages);
}
