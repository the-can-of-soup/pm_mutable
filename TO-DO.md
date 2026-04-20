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
- [ ] Add block concepts:
  - [ ] 
- [ ] Implement blocks:
  - [ ] Array parse (should perform a regular JSON parse, then replace all arrays with Mutable Arrays and all objects with DogeisCut Objects (unless Mutable Objects is loaded, in which case they should become Mutable Objects))
  - [ ] Stringify (should perform a JSON stringify; the main logic should be in `MArrayType.prototype.toJSON` which should simply return `this.array`, unless this is a cyclical reference in which case it returns `'...'`)
  - [ ] For loop (should store its iterator (index) and target MArray internally and check if end of array is reached and get from target on every loop; that way arrays can be mutated while they are being looped over)
  - [ ] Includes/has/in (main logic should be in `MArrayType.prototype.includes`; should check if the value is in the array using JS `Array.prototype.includes` (which behaves like `===` except for `NaN`))
  - [ ] Get ID
  - [ ] Append (main logic should be in `MArrayType.prototype.push` and should use `this.array.push`)
  - [ ] Insert (index input should be floored and then constrained such that too high inputs are treated as the list's length + 1 and too low inputs are treated as `1`; then actual insert logic should be in `MArrayType.prototype.splice`)
  - [ ] Delete (index input should be floored and then wrapped within the list's bounds using `vm.dvSoupMArraysUtil.mod` (same logic as get block); then actual delete logic should be in `MArrayType.prototype.splice`)
  - [ ] Empty (should use `MARRAY.length = 0`; main logic should be in `MArrayType.prototype.length` **setter**, which should use `this.array.length` setter)
  - [ ] Reverse (main logic should be in `MArrayType.prototype.reverse` and should use `this.array.reverse`)
  - [ ] Extend (should use `MARRAY.push(...MARRAY2)`)

## Mutable Objects
_\*crickets\*_
