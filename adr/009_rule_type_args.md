# Generic Type Args for a Rule

A `Rule` needs a few type args: two to specify the container and one to specify any
context that's provided as part of the trigger message and supplied to the function.

The Rule needs one of the container type arguments -- the one that defines the message
the container knows how to process -- because that is the return type of the rule
function. It needs the other argument just to fully type the container that it references.

As we know the Container type is something like: `Container<T, M = T>`, which is to say
that the container message type is optional and defaults to the type of value stored
in the container. This means in a Rule it's also helpful to have the container message
type default to the container storage type.

In addition, not all rules have a context associated with them. And so we'd like the context
type to default to undefined. This allows us to do some Typescript magic to set the number
of arguments we expect on the trigger message -- ie, for a given rule, whether a context
argument should be supplied when triggering it and if so what type it should be.

So a Rule really has two optional types in its definition. This causes some problems when
trying to type Rules manually.

There are two options we could take:

#### 1. Context type in the middle

So the type would be `Rule<ContainerType, ContextType, ContainerMessageType>`. On most
containers it's fine to default the ContainerMessageType to the ContainerType. So rules
on most (non-collection) containers would look like:

```
Rule<number> // without a context
Rule<number, number> // with a context of type number
```

A collection would look like:

```
Rule<Collection<string>, undefined, CollectionMessage<string>> // without a context
Rule<Collection<string>, string, CollectionMessage<string>> // with a context of type string
```

#### 2. Context type at the end

The rule type here would be `Rule<ContainerType, ContainerMessageType, ContextType>`.

So rules for non-collection containers would look like:

```
Rule<number> // without a context
Rule<number, number, number> // with a context of type number
```

Collection rules would look like:

```
Rule<Collection<string>, CollectionMessage<string>> // without a context
Rule<Collection<string>, CollectionMessage<string>, string> // with a context of type string
```

This seems to be a better approach since there's no need to add an `undefined` type
when specifying rules for collections without a context.


#### 3. No Container Type

But what if we don't worry about the container storage type. So the Rule would look like:
`Rule<ContainerMessageType, ContextType>`.

So rules for non-collection containers would look like:

```
Rule<number> // without a context
Rule<number, number> // with a context of type number
```

Collection rules would look like:

```
Rule<CollectionMessage<string>> // without a context
Rule<CollectionMessage<string>, string> // with a context of type string
```

This does work and it seems to make it more explicit as to just how this
type is generic. When writing a Rule, we need to specify the type of value
it will produce and optionally the type of any extra context that will be
provided when the rule is triggered. The storage type of the container doesn't
actually matter so much and so we can actually leave that as an `any` type
I think.


### Decision

We will go with `Rule<ContainerMessageType, ContextType>` because this simplifies
the number of type variables and keeps ContextType as the only optional type.

But note that when defining a rule, the typescript compiler can infer the
ContainerMessageType from the given container and then the rule writer just needs to
type the context argument in the rule function so the compiler will get the
ContextType. That's not too bad.

So manual type is only necessary if for some reason you need to write an explicit
typed reference to a rule, like if you need to store a rule in some object or something.

