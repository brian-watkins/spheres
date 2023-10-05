### No two-way binding

Some frameworks use a method of associating state with input elements
called 'two-way binding'. This means that after declaring an association
between some input element and some piece of state, any time the state
changes, the input value will change, and vice-versa.

This kind of two-way binding can seem pretty useful especially when following
a pattern for form implementation where every input value is stored in
state. Elm, for example, (or the documentation of Elm) suggests this kind
of pattern, where input events are attached to input elements and their
values are stored in the model as changes occur /and/ those values from
the model are used to set the value of the element. Note that Elm does not
have two-way binding and this is sometimes perceived as a source of pain
due to the 'boilerplate' code that is required to produce a large form.
Vue is one of the frameworks that supports two-way binding.

Sometimes it's necessary to follow this pattern of syncing the value of an
input field with state. Consider, for example, an input field that allows
a user to input text and has it's value dynamically updated when other
things happen. See the 'temperature converter' example app for one such
case. In this case, something like two-way binding can seem very appealing
as a way to simplify the code. But often it's fine to allow the dom element
to hold the value of an input field and just collect that value via dom API's
when the form that contains the input field is submitted.

Two-way binding might simplify the code a bit, but it's somewhat complicated
to implement, since it needs to support a variety of input elements. You have
to handle text input fields one way, and checkboxes and radio buttons another
way. And checkboxes and radio boxes can have multiple selected values, so you
have to account for that. And then you have to handle textareas and select
tags, and select tags can have multiple options too. Plus, you might want to
somehow be smart about converting strings to numbers when storing in state,
and so on.

Beyond just the implementation complexity, it's not clear to me that it actually
makes code more understandable. Sure, it may simplify the sometimes common
task of associating state with some input field. But just looking and seeing
an attribute like `bind` doesn't immediately make it easy for me to reason
about what is happening. Perhaps one could argue that this is more 'declarative'
-- we're saying that whatever the value of the state is, so too goes the
value of the input element and vice-versa. But it still feels a little
magical. Being forced to be explicit is not a bad thing.

Furthermore, with the way we support state, the savings from two-way binding
is really just about not having to explicitly define an event handler on the
element that writes to a container. But if you let the system do that, you lose
one opportunity to separate concerns in the system. Maybe the input field is a
string value but the state holds a number. We can use that event handler to
cast the input value as a number, so that our state doesn't need to care about
the format that the number is originally provided in. Or we can translate it to
some other value entirely (like a constant or something).

### Decision

We will not implement two-way binding as part of this framework. The supposed
pro of simplifying the code is probably not all that advantageous except in
simple cases. And the amount of simplification that occurs is not all that
great. By avoiding two-way binding, we encourage programmers to use the dom
to store input state when possible. In cases where that's not a good idea,
we force programmers to be explicit about the intention of the code. And, finally,
we preserve opportunities to separate state management and application logic
from the details of the display/presentation/input mode.

Even so, if it makes sense to implement something like two-way for an element,
it seems like this could be done via a wrapper function that just creates a
small view and applies the correct event handler to it. So a programmer could
always opt-in to two-way binding by writing their own wrapper function. This is
basically what we would do anyway to implement this within the framework.