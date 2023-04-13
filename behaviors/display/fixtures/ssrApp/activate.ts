import * as View from "@src/display"
import counter from "./counter"
import tally from "./tally"

// I could make this a function you have to call
// for each island ... And you could call it whenever I guess
// Like if you wanted to wait for some element to load on the
// page and then call activate.
// The only downside is that we add the event listener in
// activate islands ... so we'd want to find a way to only add
// that once.

// So maybe what we need to do is create a Display object
// but instead of calling mount, we call activate or something

View.activateIslands([
  counter,
  tally
])

// View.activate(counter)
// View.activate(() => import("./tally.js"))
