# spheres

## 0.26.1

### Patch Changes

- bc9b095: Fix import extensions

## 0.26.0

### Minor Changes

- 993f626: Stream messages written to tokens in the state manifest
- 71d82ec: Internal view tokens trigger onRegister hook; added optional id token to container

### Patch Changes

- 2f7cfe2: Allow onRegister hook to add hooks to containers
- b4020f0: Wait to deserialize streamed data until the chunk has been fully streamed

## 0.25.2

### Patch Changes

- a680a06: Fix dropped subscriptions with union type view selector

## 0.25.1

### Patch Changes

- 2d82d17: Select view no longer loses subscriptions

## 0.25.0

### Minor Changes

- 43eed2c: Performance improvements; better memory management; new subviews api

## 0.24.0

### Minor Changes

- 4e2712e: Better support for special markup, like SVG

## 0.23.3

### Patch Changes

- 09086f4: Only stream changes to meta state

## 0.23.2

### Patch Changes

- dcc5fd3: SSR Store data is included in initial html when using built assets

## 0.23.1

### Patch Changes

- 05f9190: Streaming works even if there is no data to stream

## 0.23.0

### Minor Changes

- 00c0539: Support for streaming data during SSR
- 6035e21: Initializer works with multiple containers
- a0080ba: Define initializer when creating a store
- 2338bbf: Use record with serializing/deserializing tokens

### Patch Changes

- 16218bc: Default StoreMessage type to any

## 0.22.7

### Patch Changes

- 634dd9c: Performance improvements

## 0.22.6

### Patch Changes

- 2cd8e07: Run user-defined effects after all rendering is complete

## 0.22.5

### Patch Changes

- 053e9a5: Allow access to event subtype properties

## 0.22.4

### Patch Changes

- bb05d85: Support for event bubbling (and canceling via stopPropagation)

## 0.22.3

### Patch Changes

- 4b02a07: Fix events with union selectors

## 0.22.2

### Patch Changes

- 1fbb64e: Reset meta state value whenever a write hook sends an ok message

## 0.22.1

### Patch Changes

- 684bb85: Fix for when server rendered stateful text is empty

## 0.22.0

### Minor Changes

- 946d1d3: Support for selecting views by case of discriminated unions

### Patch Changes

- da69e16: Add DOCTYPE when rendering html tag to string
- de66acf: Fix possible glitches in nested effects with derived state

## 0.21.1

### Patch Changes

- be2ebe4: Fix esm imports

## 0.21.0

### Minor Changes

- 478fe1a: Enable tree shaking for SVG code

### Patch Changes

- 47cd3f9: Enable tree shaking for Store code

## 0.20.0

### Minor Changes

- ba54892: Use reusable string renderer for server-side rendering

## 0.19.3

### Patch Changes

- 48217c9: Add base path to assets when transformed by the plugin
- 48217c9: Set build options for each environment via the plugin

## 0.19.2

### Patch Changes

- 0276623: Vite plugin injects vite context automatically

## 0.19.1

### Patch Changes

- fbea9da: Move virtual module types into their own folder

## 0.19.0

### Minor Changes

- e1984ef: Plugin provides a virtual module with vite context

## 0.18.0

### Minor Changes

- 87e0f6b: Vite plugin for easy dev and build config

## 0.17.1

### Patch Changes

- 8594e0c: No longer escape quotes in text nodes renderer to string
- 7578448: Void elements are rendered to string without closing tag

## 0.17.0

### Minor Changes

- 6b0e308: Serialize meta values for containers
- 7a32b7f: Better type support for containers with supplied values

## 0.16.0

### Minor Changes

- 805e249: Easier API for initializing container state

## 0.15.5

### Patch Changes

- 27efc16: Fix for inserting new items in list

## 0.15.4

### Patch Changes

- a8093d6: Set prev link when activating items in list

## 0.15.3

### Patch Changes

- 24dadb7: Fix bug with reordering list items

## 0.15.2

### Patch Changes

- 1a4f687: Fixed list reordering bug

## 0.15.1

### Patch Changes

- cc1d18b: Export UpdateResult type

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
