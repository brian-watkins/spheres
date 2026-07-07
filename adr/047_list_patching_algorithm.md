# New List Patching Algorithm

The list patching algorithm is responsible for updating the DOM when the
array of data that governs a list view changes. The previous implementation
attempted to patch the DOM in a single pass over the existing items, making
decisions about each item as it went. This led to several problems:

1. The implementation was complicated and difficult to reason about. Patching
decisions were interleaved with DOM mutations and virtual list bookkeeping
(detached items, cloned slots, deferred appends), so it was hard to understand
what the algorithm would do in any given case.

2. Bugs continued to crop up, and some cases were obviously less efficient
than they could be -- that is, they resulted in non-optimal sets of DOM
mutations.

3. In order to preserve element state on reordered items when *all* items are
reordered, we had to remove the fast-path check for the case in which all
items are replaced, since -- from the perspective of a single pass over the
list -- rearranging all items was indistinguishable from replacing all items.
This meant that the common case of replacing an entire list lost its fast
path.

### Decision

We rewrote the list patching algorithm to separate *planning* from *applying*
changes. The algorithm first scans the list to build up a description of the
updates that need to occur, and only then mutates the DOM.

At a high level:

1. **Scan.** Walk the existing virtual items (a doubly-linked list) in tandem
with the new data array, using a one-item lookahead to classify each position:
if the item's key matches the current data value, the item stays in place; if
the item's key matches the *next* data value, record an insert before the
item; if the current data value matches the *next* item's key, record a
delete; otherwise record a change of the item in this slot. Items remaining
after the data is exhausted are deleted; leftover data is appended. Any item
tentatively marked for deletion or replacement is cached by its key, since it
may turn out to have moved elsewhere in the list.

2. **Detect moves.** Scan the planned inserts, changes, and appends for data
values that match a cached item. Any match means the item has *moved* rather
than been removed, so it survives and its element (and associated state) will
be reused.

3. **Apply.** Process deletes first, then appends, then the remaining inserts
and changes in reverse order, so that the anchor node for each mutation is
already in its final position. Moved items are relocated with `moveBefore`
(falling back to `insertBefore`) so that element state like focus and
animations is preserved; new items are rendered and inserted; replaced items
are removed once their replacement is in place.

The scan also reveals two fast paths. If the scan produces no updates, we are
only appending items to the end of the list. And if no item remained in place
*and* no cached item turned out to have moved, we are replacing all items, so
we can drop the whole list at once (using `replaceChildren` when the list is
the only content of its parent) and append fresh items. Note that this
restores the replace-all fast path that motivation (3) forced us to remove:
because moves are now detected explicitly, rearranging all items is
distinguishable from replacing all items.

Since planning is separated from DOM mutation, each case is easier to reason
about. The algorithm produces minimal sets of DOM mutations in practice (as
far as has been observed so far), and its correctness is exercised by a new
suite of fuzz tests that apply inserts, deletes, moves, replacements, and
shuffles and verify the resulting DOM.

### Caveats

We considered implementing a more conventional LIS based algorithm so that
the algorithm might acheve provably optimal sets of DOM mutations. However,
that's not all that fun and we wanted to try writing our own algorithm. The
resulting algorithm operates in constant time and seems to result in
optimal sets of DOM mutations so we will stick with it for now. It could be
the case that we discover cases that the algorithm does not handle well and
so we might revisit at a later date.
