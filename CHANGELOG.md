# spheres

## 0.15.0

### Minor Changes

- Use collections to dynamically reference state tokens
- Serialize and deserialize state by providing a map from
  string id to token
- Removed id attribute from state; use name for debugging
  purposes
- Performance improvements

## 0.14.2

### Patch Changes

- f0f2bf7: Fix type of index token for subviews

## 0.14.1

### Patch Changes

- cbc3ecf: Performance improvements

## 0.14.0

### Minor Changes

- 15ed39e: More flexible serializable store

## 0.13.1

### Patch Changes

- cba3bcc: Initialize derived state with a query function
- 762d52a: Notify subscribers upon list item update instead of re-rendering
- eb31b08: Fix for activating stores with data that have store hooks

## 0.13.0

### Minor Changes

- 2cfd097: Support for defining state internal to views
- cc0b7e4: Support for activating multiple SSR stores

## 0.12.0

### Minor Changes

- 3b999bb: Serialize store for automatic state transfer from server to client
- a394d78: Provide parent element when activating a view
- 3b999bb: Remove onPublish container hook

## 0.11.1

### Patch Changes

- 9e36b8b: Fix extensions on imports

## 0.11.0

### Minor Changes

- adfca2f: Performance improvements

## 0.10.0

### Minor Changes

- dd6b980: Simplified, purely reactive view API

## 0.9.1

### Patch Changes

- a8bd20d: Fixed example in README

## 0.9.0

### Minor Changes

- 475734c: Fixed distribution

## 0.8.0

### Minor Changes

- 40c444a: Initial Release
