# Prevent Unnecessary Calculations

Currently, no matter the new value of a state token, that value would
be publishes and all dependents and subscribers would be triggered with
it. This can be extra unnecessary work if that value is exactly the same
as the old value, because presumably each subscriber and dependent only
cares about the value itself and so would generate the very same result.

We have some options for how we could check to determine whether we should
publish a new value.

#### 1. Use some normal JS comparison

We could simply compare the objects with the tools that JS provides. Here
`Object.is` is probably the best option. And, I think, this is the approach
that React uses to determine whether props have changed for a component.

The consequence of this, however, is that mutating an object inside a query
and returning that mutated object will not end up publishing the mutated
object to dependents and subscribers. This is because, in this case,
`Object.is` will return that we are still dealing with the very same object;
it just looks at references to positions in memory and not the values of
the properties of the object. So, on this approach all queries must be
pure in the sense that they return a new value (and don't try to mutate the
current value to generate a new one).

#### 2. Use some deep equals method

Another approach would be to use some library that would allow us to do a
'deep equals' comparison. In this case, even if the returned value was a
mutated version of the current value, the algorithm would see that they
have some property values that are not the same and so would publish the
mutated value. We could consider libraries like `dequal` or `deep-equal`
for example.

The benefit of this approach is that in certain cases it's just more
natural to mutate an object rather than go through the process of generating
a new object with some different, potentially deeply nested, property.

The downside to this approach is that a deep equals comparison is potentially
more costly in terms of cpu time than the `Object.is` approach, especially
for large objects with deeply nested changes.

### Decision

In order to prevent this unnecessry work we will use `Object.is` to
compare the new value with the current value. We will publish the
new value only if the comparison shows us that the new value is not
the same as the current.

This means that queries must return a new value (and not mutate the
current value) in order for dependents and subscribers to be alerted to
a change. This seems like a good thing overall, and there are libraries
that can facilitate this (like immutable.js) for more complex data
structures.

### Future Considerations

We could also look into a library like immer that allows for producing
a new object by mutating the old. There's a world in which we bake that
into the query itself, but certainly it would be possible to use this
without it being part of the library.

Also, we could use `Object.freeze` to freeze the current state value to
prevent accidental mutations. However, for this really to work we'd need
to recursively freeze all the properties of the value as well. That feels
like it could get costly if the value stored in state is a large
object. It seems like this would result in a better experience, though.
Getting an error (in strict mode) that you cannot change the object vs
just not seeing any updates and wondering what happened.

Since both of these things could be used without modifying the library,
we'll just hold off for now.