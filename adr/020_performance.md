# Performance and Memory

We've made this framework, but would it work in a real world scenario? How
does it compare to something like React? We can answer this question one
way by using a well-known benchmark to understand the performance qualities
and memory-usage imposed by our framework. We will use
[this benchmark](https://github.com/krausest/js-framework-benchmark) and
potentially could submit our framework to it when it's released.

This benchmark probably tries to give a good across the board view of
dom manipulations. But it's obviously focused on the single-page app
use case, whereas we could also optimize further obviously by rendering
static content on the server first.

We started out pretty slow compared with React and React/Jotai (which is
probably most similar to what we are trying to do). But many optimizations
later we are now much faster than React and even faster than a non-virtual
dom framework like Svelte -- at least according to this benchmark.

The big takeaway seems to be that -- according to this benchmark at least --
this framework can have performance that is close to Svelte and Vue.
However, the memory usage is higher than other frameworks.

Here are some of the major optimizations: ...

- Simplify the default state identifier to a number (string)
- changed iteration to standard `for` loops
- changed the api to remove the need to do more processing for aria
attributes and event handlers
- removed weird default implementations of reducer and writer in the
container controller and just make these undefined by default and
write the code to handle the undefined state
- Changed the way our proxy objects were implemented to remove extra
calls which were getting routed again through the proxy
- reuse the patch function in stateful nodes rather than recreating it
for each node
- introduce the notion of a query on the store to remove the need to
create a new state token (and controller) just to subscribe to updates for
the stateful node renders
- simplify the implementation of the api for creating view configs to speed
up creation and reduce memory
- store one set for both dependents and subscribers
- do not use `bind` -- use arrow function instead
- Reuse classes where possible and just create low-level data objects
when constructing virtual nodes
- don't use the css classes module in Snabbdom -- just set the css
class names directly as an attribute
- make the proxy objects into prototypes of the class that has helper
methods on it.

### Possible future optimizations:

The virtual dom layer (snabbdom) -- is really the part of the rendering
system that we haven't optimized. There are some things in the snabbdom
code that are done to make snabbdom itself more generalizable to lots
of use cases, but which we do not need and which could potentially
speed up processing. For example, in Snabbdom the selector can include
css class names and so there is some string parsing that happens to
determine whether this is being done. We could skip all that.

Maybe too there are other approaches besides virtual dom. Solid
is extremely fast and seems to take a different approach -- compiling
templates to code that updates the dom. Not sure if that would work
with our API though, and we want to avoid templates and JSX.