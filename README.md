# Functional pattern matching for typescript/javascript

Define complex patterns as functions.

Portable reusable logic.

Strictly typed pattern matching using typescript

```ts
const testSubject = 222;
```

```ts
const result = fcase(testSubject)( match => {
  match
    .case(22)
    .then(shouldNotCall('22 !== testSubject'))
    .case(22)
    .then(shouldNotCall('22 !== testSubject'))
    .case(222)
    .then(() => {
      testSuccess('Yay!! 222 === testSubject');
      return 3;
    })
    .case('222') // will throw error in typescript. More later
    .then(shouldNotCall('conditions already met'));
});
```

```ts
result === 3  // true - since matching block returned 3
```
