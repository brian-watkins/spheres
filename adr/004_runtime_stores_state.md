# The Runtime Stores Application State

We've come to realize that `root` and `state` (essential and derived state), should
be a **description** of the application state. In other words, the instances of
`Root<T>` and `State<T>` that we create should not themselves *be* the application
state. They merely *describe* the application state, in particular, the set of
relationships that compose that state -- the state graph, so to speak. So, they
just reference the initial state and the set of subscribers to changes in that state.

This allows the runtime to manage how we store that state. Maybe we want to store everything
in memory -- great! Maybe we want to periodically write the application state to local
storage so that when we revisit the app we resume where we left off -- we let the runtime
handle this detail about *storage* and instead let Root and State be merely descriptions
of how our application state is defined.

Furthermore, we do not want to explicitly update state on any atom. Especially when we
are defining a view, and some event needs to update state (like if we are using local
state), what we want is for the view to send a message describing the change to be made.
Then the runtime will handle this change. If we were to allow explicit update of state
(say, with a `.write(value)` method on the atom instance) then a few things would
probably happen. 

1. We could update state from anywhere at any time. This is kind of
ok since we would notify all subscribers, but it seems like too much freedom which could
lead to wack code.

2. Our view would have to allow for more control logic in processing
event handlers -- in other words, a click handler would need to execute a function with
statements in it so that we could call this method to update the state. This is bad, I think,
and really opens the door to mixing view logic and application logic (like you get with
React etc). We want to instead follow Elm in making the view merely a function the produces
the displayed user interface *and nothing else*. To that end, we want event handlers to
simply specify a message to send. Some of these will involve functions (like an input
handler is a function from the new input value to a message) but generally any logic
there is about constructing the message and should be very simple.

3. Eventually some write operations will be async. For example, in the future it will
probably be possible to specify that some state is stored in a web service, so that whenever
a write operation happens, an http request is sent to that service with some data and we
wait for a response before notifying subscribers. But this would mean any `.write(value)`
method would probably need to return a promise. This would complicate the view code
and, given (1) and (2) perhaps open the door to more convoluted mixing of concerns like
'generating the view' and 'updating the state'. At the very least it would complicate
the view code by introducing promises everywhere we need to deal with state.

So for these reasons we don't want to allow for explicit state updates. Instead, a state
atom should provide a method to generate a `Message` that describes a request to update
its state. The `Message` should be passed to the runtime and processed there. When complete,
subscribers to that state will be notified.

When it comes to reading state, I think it is ok to allow for this to occur explicitly
whenever necessary. Primarily, though, this will occur with the `get` function when describing
derived state so typically user code should not need to call the `read()` method on an atom.

Nevertheless, whenever `read()` is called, it will ask the runtime for the current state
value and return it immediately. Even if, in the future, writing state may be an
asynchronous process, it should be the case that there is always a current state for any
atom and that state can be returned immediately when requested (ie without any Promise
required).

So, `Root` and `State` *describe* the application state, and the runtime actually *stores*
the state. To read and write that state, you need to talk to the runtime. Each root will
have a reference to the runtime so that it can request the current state when necessary,
for when derived state needs to be computed. BUT, our api is such that the only way to read
state will be to subscribe to changes, in which case the updated state will be provided
to the subscriber. If a subscriber needs multiple pieces of state, then they should create
a derived state involving those and subscribe to it.


### The Loop is the application runtime

We'll create an object called a `Loop` that serves as the application runtime. So far, the
Loop merely stores state for atoms. It knows how to process messages to update the state
for an atom, and it knows how to fetch the current state of an atom when requested.

One benefit of the Loop is that now we have an actual JS object that we can refer to
which holds all the application state. Some implementations might use an instance internal
to a module (and we might eventually do that as well) but by exposing the Loop it's easy
to create one for testing purposes and throw it away at the end of the test.

So far the API ergonomics of this aren't that great. For each root, derived state, and
display, we need to pass in a reference to the loop explicitly. In the future, we hope
to make this optional and have each of these things reference some default Loop instead
so that we can just create those without having to specify the runtime loop instance
specifically. In any case, this does open the door to more complicated situations that
might have multiple distinct runtimes (loops) on the same web page ... (in the way
that you can run multiple Elm apps on the same web page)
