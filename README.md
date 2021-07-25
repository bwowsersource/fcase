# Functional pattern matching for typescript/javascript

Define complex patterns as functions.

Portable reusable logic.

Strictly typed pattern matching using typescript

```ts
const testSubject = 222;
```

```ts
const result = fcase(testSubject)(match => {
  match
    .case('222')
    .then(shouldNotCall('string("222") !== number(222)'))
    .case(22)
    .then(shouldNotCall('22 !== testSubject'))
    .case(22)
    .then(shouldNotCall('22 !== testSubject'))
    .case(222)
    .then(() => {
      testSuccess('Yay!! 222 === testSubject');
      return 3;
    })
    .case(222)
    .then(shouldNotCall('conditions already met'));
});
```

```ts
result === 3; // true - since matching block returned 3
```

> Unlike traditional switch-case, fcase always break after a match.
> To keep continuing, an explicit call to `matchNext` must be made.

### `Modifier` and `didMatch`

`Modifier` is an object consisting of 2 control flow modifier functions `{matchNext,__DO__NEXT__}` passed as 1st parameter to `then` callback. 
`didMatch` is the 2nd parameter to `then` callback. It is a boolean value resolved from equality checking testSubject to case value. This will be false when the previous block called `__DO__NEXT__` and condition does not match.

> `__DO__NEXT__` is named so, to signify the oddness of using it and as a reminder that it is not recommended for regular usage. It is added as an explicit call, only to feature match native switch-case statement.

These can be accessed as follows:

```ts
const result = fcase(testSubject)(match => {
  match
  ...
    .case('first matching condition in this chain')
    .then(({matchNext, __DO__NEXT__}, didMatch) => {
      // didMatch is true
      // if matchNext/__DO__NEXT__ is not called, execution will break here
      matchNext();
      return 2;
    })
    .case('someCondition that will not matches')
    .then(shouldNotExecute("condition doesn't match"))
    .case('someCondition that matches')
    .then(({matchNext, __DO__NEXT__}, didMatch) => {
      // didMatch is true
      // if matchNext/__DO__NEXT__ is not called, execution will break here
      __DO__NEXT__();
      return 3;
    })
    .case('someCondition-that-will-never-match')
    .then(({matchNext, __DO__NEXT__}, didMatch) => {
      // `didMatch` is false
      // this block executes because of __DO__NEXT__ in previous block
      // __DO__NEXT__ executes block right after
      // next block will not execute
      return 4;
    })
...

```
In the above example return value will be the value returned bu last executing block, despite what caused it to execute
```ts
result === 4 // `true` since last executing block returned 4
```
