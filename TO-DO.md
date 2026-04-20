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
- [ ] Implement [the iterable protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) for `MArrayType` (should use a generator `[Symbol.iterator]()` function; should store its iterator (index) and reference to target MArray internally and check if end of array is reached and get from target on every loop; that way arrays can be mutated while they are being looped over).
- [ ] Implement `MArrayType.prototype.forEach` which should behave like `Array.prototype.forEach`.
- [x] Iterators support
- [ ] Add block concepts:
  - [ ] 
- [ ] Implement blocks:
  - [ ] Array parse (should perform a regular JSON parse, then replace all arrays with Mutable Arrays and all objects with DogeisCut Objects (unless Mutable Objects is loaded, in which case they should become Mutable Objects))
  - [ ] Stringify (should perform a JSON stringify; the main logic should be in `MArrayType.prototype.toJSON` which should simply return `this.array`, unless this is a cyclical reference in which case it returns `'...'`)
  - [ ] For loop (should use `MARRAY.forEach((value, index) => { /* ... */ })` loop; this will only work once `MArrayType.prototype.forEach` has been implemented)
  - [ ] Includes/has/in (main logic should be in `MArrayType.prototype.includes`; should check if the value is in the array using JS `Array.prototype.includes` (which behaves like `===` except for `NaN`))
  - [ ] Get ID
  - [ ] Append (main logic should be in `MArrayType.prototype.push` and should use `this.array.push`)
  - [ ] Insert (index input should be floored and then constrained such that too high inputs are treated as the list's length + 1 and too low inputs are treated as `1`; then actual insert logic should be in `MArrayType.prototype.splice`)
  - [ ] Delete (index input should be floored and then wrapped within the list's bounds using `vm.dvSoupMArraysUtil.mod` (same logic as get block); then actual delete logic should be in `MArrayType.prototype.splice`)
  - [ ] Empty (should use `MARRAY.length = 0`; main logic should be in `MArrayType.prototype.length` **setter**, which should use `this.array.length` setter)
  - [ ] Reverse (main logic should be in `MArrayType.prototype.reverse` and should use `this.array.reverse`)
  - [ ] Extend (should use `MARRAY.push(...EXTENSION)`; this will only work once [the iterable protocol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) has been implemented for `MArrayType`)
  - [ ] Replace (should use `MARRAY.array = REPLACEMENT.array.copy()`; main logic should be in `MArrayType.prototype.replace`)
  - [ ] Map in-place (main logic should be in `MArrayType.prototype.map`; should use `MARRAY.forEach((value, index) => { /* ... */ })` loop and mutate the array at the current index with the result of the lambda being called with the current value; this will only work once `MArrayType.prototype.forEach` has been implemented)
  - [ ] Copy shallow/deep (shallow should use `new MArrayType(this.array.copy())` (logic should be in `MArrayType.prototype.copy` and be called by `MArrayType.prototype.dvSoupMutableCopyHandler(/* deep = */ false)`); deep should first map all items of the array using `value => value.dvSoupMutableCopyHandler?.(true) ?? value` and then use `new MArrayType(mappedArray.copy())` if this is an array that has not been seen before during the copy, otherwise it should return the copy that was already made for this array (this logic should be in `MArrayType.prototype.deepCopy` and be called by `MArrayType.prototype.dvSoupMutableCopyHandler(/* deep = */ true)`))
  - [ ] Freeze shallow/deep (shallow should just return a jwklong Array from copying `this.array` (this logic should be in `MArrayType.prototype.freeze` and be called by `MArrayType.prototype.dvSoupMutableFreezeHandler(/* deep = */ false)`); deep should first map all items of the array using `value => value.dvSoupMutableFreezeHandler?.(true) ?? value` before converting to a jwklong Array, or `'...'` if this is a cyclical reference (this logic should be in `MArrayType.prototype.deepFreeze` and be called by `MArrayType.prototype.dvSoupMutableFreezeHandler(/* deep = */ true)`))
  - [ ] Unfreeze shallow/deep (shallow should just return a new Mutable Array from `this.array.copy()` (this logic should be patched into `jwArray.Type.prototype.dvSoupMutableUnfreezeHandler` with args `(deep = false)`); deep should first map all items of the array using `value => value.dvSoupMutableUnfreezeHandler?.(true) ?? value` before converting to a Mutable Array (this logic should be in `MArrayType.prototype.deepUnfreeze` and be called by `MArrayType.prototype.dvSoupMutableUnfreezeHandler(/* deep = */ true)`))

## Mutable Objects
_\*crickets\*_
