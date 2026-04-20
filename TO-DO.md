# TO-DO List

> [!IMPORTANT]
>
> All changes to code must be items that are listed here.
> To add or change something on this list, make a pull request.
> When you make code changes, you should also check off the relevant items in the same PR.
>
> This is to prevent communication errors and disagreements.

## Mutable Arrays
- [x] Make thumbnail
- [ ] Make icon
- [ ] Implement [the iterable protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) for `MArrayType` (should use a generator `*[Symbol.iterator]()` function; should store its iterator (index) and reference to target MArray internally and check if end of array is reached and get from target on every loop; that way arrays can be mutated while they are being looped over).
- [ ] Implement `MArrayType.prototype.forEach` whose callback arguments should behave like `Array.prototype.forEach`, but whose iteration method should behave like `MArrayType.prototype[Symbol.iterator]`.
- [ ] Implement `MArrayType.prototype.toRaw` which should recursively replace Mutable Array or Mutable Object values with new raw arrays and objects with `null` prototype. Make sure recursive and duplicate references are preserved.
- [x] Iterators support
- [ ] Blocks:
  - [ ] Array parse (simply use `MArrayType.toMArray(VALUE)`; JSON logic should be in `MArrayType.prototype.fromJSON`, which should also be called by `MArrayType.toMArray`; it should perform a regular JSON parse, then replace all arrays with Mutable Arrays and all objects with DogeisCut Objects (unless Mutable Objects is loaded, in which case they should become Mutable Objects))
  - [ ] Stringify (should perform a JSON stringify; the main logic should be in `MArrayType.prototype.toJSON` which should simply return `this.array`, unless this is a cyclical reference in which case it returns `'...'`)
  - [ ] For loop (should use `MARRAY.forEach((value, index) => { /* ... */ })` loop; this will only work once `MArrayType.prototype.forEach` has been implemented)
  - [ ] Includes/has/in (main logic should be in `MArrayType.prototype.includes`; should check if the value is in the array using JS `Array.prototype.includes` (which behaves like `===` except for `NaN`))
  - [ ] Get ID (`MARRAY.id`)
  - [ ] Append (main logic should be in `MArrayType.prototype.push` and should use `this.array.push`)
  - [ ] Insert (index input should be floored and then constrained such that too high inputs are treated as the list's length + 1 and too low inputs are treated as `1`; then actual insert logic should be in `MArrayType.prototype.splice`)
  - [ ] Delete (index input should be floored and then wrapped within the list's bounds using `vm.dvSoupMArraysUtil.mod` (same logic as get block); then actual delete logic should be in `MArrayType.prototype.splice`)
  - [ ] Empty (should use `MARRAY.length = 0`; main logic should be in `MArrayType.prototype.length` **setter**, which should use `this.array.length` setter)
  - [ ] Reverse (main logic should be in `MArrayType.prototype.reverse` and should use `this.array.reverse`)
  - [ ] Extend (should use `MARRAY.push(...EXTENSION)`; this will only work once [the iterable protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) has been implemented for `MArrayType`)
  - [ ] Replace (should use `MARRAY.array = REPLACEMENT.array.copy()`; main logic should be in `MArrayType.prototype.replace`)
  - [ ] Map in-place (main logic should be in `MArrayType.prototype.mapInPlace`; should use `this.forEach((value, index) => { /* ... */ })` loop and mutate the array at the current index with the result of the lambda being called with the current value; this will only work once `MArrayType.prototype.forEach` has been implemented)
  - [ ] All sort in-place blocks (sort asc/desc, sort asc/desc with key, sort asc/desc with custom comparator; default key is `value => value`, default comparator is `Scratch.Cast.compare`; should pass the key lambda the value to key, and the comparator lambda a new Mutable Array on every call containing the two values after keying to compare; main logic should be in `MArrayType.prototype.sort`; behavior if array being sorted is mutated by a lambda is TBD)
  - [ ] Copy shallow/deep (shallow should use `new MArrayType(this.array.copy())` (logic should be in `MArrayType.prototype.copy` and be called by `MArrayType.prototype.dvSoupMutableCopyHandler(/* deep = */ false)`); deep should first map all items of the array using `value => value.dvSoupMutableCopyHandler?.(true) ?? value` and then use `new MArrayType(mappedArray.copy())` if this is an array that has not been seen before during the copy, otherwise it should return the copy that was already made for this array (this logic should be in `MArrayType.prototype.deepCopy` and be called by `MArrayType.prototype.dvSoupMutableCopyHandler(/* deep = */ true)`))
  - [ ] Freeze shallow/deep (shallow should just return a jwklong Array from copying `this.array` (this logic should be in `MArrayType.prototype.freeze` and be called by `MArrayType.prototype.dvSoupMutableFreezeHandler(/* deep = */ false)`); deep should first map all items of the array using `value => value.dvSoupMutableFreezeHandler?.(true) ?? value` before converting to a jwklong Array, or `'...'` if this is a cyclical reference (this logic should be in `MArrayType.prototype.deepFreeze` and be called by `MArrayType.prototype.dvSoupMutableFreezeHandler(/* deep = */ true)`))
  - [ ] Unfreeze shallow/deep (shallow should just return a new Mutable Array from `this.array.copy()` (this logic should be patched into `jwArray.Type.prototype.dvSoupMutableUnfreezeHandler` with args `(deep = false)`); deep should first map all items of the array using `value => value.dvSoupMutableUnfreezeHandler?.(true) ?? value` before converting to a Mutable Array (this logic should be in `MArrayType.prototype.deepUnfreeze` and be called by `MArrayType.prototype.dvSoupMutableUnfreezeHandler(/* deep = */ true)`))
  - [ ] Combined (should use `MARRAY.array.concat(EXTENSION.array)` (this logic should be in `MArrayType.prototype.concat`))
  - [ ] Mapped (main logic should be in `MArrayType.prototype.map`; should create a new array, use `this.forEach((value, index) => { /* ... */ })` loop to append the result of the lambda being called with the each value to the new array; this will only work once `MArrayType.prototype.forEach` has been implemented)
  - [ ] All sliced blocks (blocks themselves should have a failsafe to return an empty array if step is `0`; main logic should be in `MArrayType.prototype.slice` with args `(from = 0, to = -1, step = 1)`; should behave similarly to Python's array slicing feature, but inclusive instead of exclusive; should use a `for (let i = from; i <= to; i += step) { /* ... */ }` loop to loop over the array and append each item to a new array that is then returned)
  - [ ]  All sorted blocks (sorted asc/desc, sorted asc/desc with key, sorted asc/desc with custom comparator; default key is `value => value`, default comparator is `Scratch.Cast.compare`; should pass the key lambda the value to key, and the comparator lambda a new Mutable Array on every call containing the two values after keying to compare; main logic should be in `MArrayType.prototype.sort`; behavior if array being sorted is mutated by a lambda is TBD)
  - [ ] Split (main logic should be in `MArrayType.split`)
  - [ ] Join (main logic should be in `MArrayType.prototype.join`)
  - [ ] Serialize (main logic should be in `MArrayType.serializeFrozen` with args `(mArray)`; should run the VM serializer on the array and then recursively convert all arrays and objects to jwklong Arrays and DogeisCut Objects; I believe the constructor or converter in DogeisCut Objects can do that step)
  - [ ] Unserialize (main logic should be in `MArrayType.unserializeFrozen` with args `(frozenSerializedMArray)`; should recursively convert all jwklong Arrays and DogeisCut Objects to raw arrays and objects with `null` prototype, and then run the VM deserializer on the result)
  - [ ] Reduce (main logic should be in `MArrayType.prototype.reduce`; equivalent of JS `Array.prototype.reduce` that uses a `this.forEach((value, index) => { /* ... */ })` loop; block should use `MARRAY.reduce` to call the lambda on each loop with a 4-element Mutable Array containing in order: accumulator, current value, current index, array being reduced; this Mutable Array should be created once at the start of the reduction and be mutated automatically after every loop; this will only work once `MArrayType.prototype.forEach` has been implemented)
  - [ ] Infinite recursion check (main logic should be in `MArrayType.prototype.isCyclical`)

## Mutable Objects
_\*crickets\*_
