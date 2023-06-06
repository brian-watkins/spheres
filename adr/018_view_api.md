# The View API

We need some API for building or declaring HTML views. The distinctive
feature and challenge of this kind of API is that HTML is heierarchical,
by which I mean that each tag can not only have properties that characterize
it but also children, and these children can be for the most part completely
arbitrary.

There are some typical approaches to building this kind of API:

#### JSX

JSX takes the approach of: let's just put HTML right into javascript. The
supposition being that HTML itself is the best API for representing, well,
HTML. What happens under the covers is that JSX is converted to javascript
function calls, maybe something like the `h` pattern as described below.
One benefit of this is that attributes can be typed for a particular element,
and there is some autocompletion as well for when you are inserting new
attributes.

For me, the downside of JSX is just that it is HTML. This makes it somewhat
unwieldy inside the world of Javascript; at the very least, part of the code
has different rules than other parts of the code in the very same file.
If I want to do any JS, I need to wrap that code in `{}`, but then it's unclear
to me if it's possible to do conditionals that way (like with JSP) and in any
case, the code and indentation start to get very weird very fast if you do
anything other than a one-liner. Also, it's annoying to have to write close
tags and get everything lined up correctly.

The kind of code you get is generally a map on some list of things, but then
it's more difficult to do things like conditional logic on whether particular
items should appear. Or at least I haven't found a good pattern for that.

Obviously, lots of people like JSX. But I'd rather not have to write HTML if
I can avoid it, and I'd rather be in a position to take full advantage of JS since
I'm in that environment.


### Templates

Frameworks like Angular and Vue rely on templates to produce HTML. This is
similar to the JSX approach in that you are typically writing real HTML (although
presumably you could use another technology to allow you to write the
templates, like pug or haml or whatever).

The downside of this approach is that it becomes harder to include logic
for generating views programmatically -- like conditional logic to hide or
show some part or looping logic. This is typically accomplished in a
'declarative' way by adding special attributes to the elements that do things
like loops or conditions. But, to me, this just makes things more complicated
and unclear. And it's necessary to create new components to do any sort of
modularization.


#### h and other functions

Another alternative is to use a function to construct HTML elements. This is
what I take to be one of the original examples:
[hyperscript](https://github.com/hyperhype/hyperscript) and the `h` function.
Even today there are different approaches to this -- see VanJS and Strawberry
for two similar approaches.

The basic idea is to have a function that takes a tag name, a hash of attributes,
and usually an array of children (or a rest-parameter, which is basically the
same thing), with the children being further invocations of the element generating
function.

One approach to this that was used earlier in this project was inspired by
how Elm handles HTML generation:

```
div([ id("blah") ], [ text("hello") ])
```

Basically, a function for each tag, with two arguments: the first being an
array of functions that produce attributes and the second an array of functions
that produce (child) elements.

This approach works fine, and, indeed, something like this is what JSX compiles
down to anyway. The good thing is that you are fully in the JS world here, and
so all your code works the same way. You can break up html into smaller functions
and so on. The downside is that the API is not always the easiest to work
with. In order to conditionally include certain attributes or certain child
elements, one needs to build up the array to hand to the function somehow --
there's not a nice way to just 'hide or show' an element in an array.


### A different take on the function approach

An approach to generating HTML that is rooted in normal Javascript idioms
is the one that has the potential to provide the best developer experience,
I think. Generating HTML is a programmatic exercise and so we should be
able to easily take full advantage of the resources and facility for
writing programs that JS provides, without having to add any extra stuff
around it.

The problems with the `h` function approach is that it encapsulates the
building of an element into a *single statement*. So if you want to configure
anything different about the element, then you need to do some work to
build up the correct arguments to provide to that statement.

Instead, we can consider an API in which building up an HTML element is
done via a *series of statements*. If each attribute added to an element is
itself a statement, then it's trivial to wrap that statement in a conditional
or a loop or whatever. And if adding each child to an element is itself
a statement, then the same is true for that as well.

But we still want to be able to preserve the sense of hierarchy, as that's
what's essential to HTML -- you are building up a document as you go based
on the relationships of parent to child and among siblings.

So, we'll use an API like so:

```
view()
  .div(el => {
    el.config.id("blah")
    el.view.text("hello)
  })
```

So, basically, you start with the `view` function, which returns an object with
methods for all tags, plus some special ones like `withState`. Then for each
tag element, it takes a function with an argument that has two properties:
`config` and `view`. The config exposes functions for setting attributes or
properties, and the view exposes the same api for adding a new tag as the
first `view` function. All these function calls are 'fluent' in the sense
that they return the original object so you can continue to build on them
without needing to invoke the target explicitly.

I like this approach because you still get a hierarchical view that shows
the relationship between elements. But you're working with *statements* to
build up a particular element, rather than elements of an array or an object.
So it's much more straightforward to represent any logic required to
build up the element. Using a function for the element configuration is
also nice because it could be passed in from the outside etc.

Finally, this approach lets us use lots of typescript magic to actually
keep the code size down. We can just generate types (that won't be included
at runtime) and use proxy objects to handle all the function calls
dynamically. We will use ts-morph for code generation so we don't have
to write all the html tags and attributes by hand.

### Caveats

We will go with this approach but there are some drawbacks. One is just that
maybe this approach is a little more verbose than others. It may get
annoying to write large hierarchies in this way, but we'll see. We can
destructure the arguments to the configuration function to make it a little
bit less verbose:

```
view()
  .div(({config, view}) => {
    config.id("blah")
    view.text("hello)
  })
```

So just kind of depends on what feels easier.