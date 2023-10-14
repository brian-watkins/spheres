import { Context } from "esbehavior";
import { TestApp } from "../helpers/testApp.js";
import createBehavior from "./create.behavior.js";
import { testCirclesApp } from "./helpers/testApp.js";
import hoverBehavior from "./hover.behavior.js";
import adjustBehavior from "./adjust.behavior.js";
import undoBehavior from "./undo.behavior.js";
import redoBehavior from "./redo.behavior.js";

export default (context: Context<TestApp>) => [
  createBehavior(testCirclesApp(context)),
  hoverBehavior(testCirclesApp(context)),
  adjustBehavior(testCirclesApp(context)),
  undoBehavior(testCirclesApp(context)),
  redoBehavior(testCirclesApp(context))
]