import { Context } from "esbehavior";
import { TestApp } from "../helpers/testApp.js";
import createBehavior from "./create.behavior.js";
import filterBehavior from "./filter.behavior.js";
import updateBehavior from "./update.behavior.js";
import { testCrudApp } from "./helpers/testApp.js";
import deleteBehavior from "./delete.behavior.js";

export default (context: Context<TestApp>) => [
  createBehavior(testCrudApp(context)),
  filterBehavior(testCrudApp(context)),
  updateBehavior(testCrudApp(context)),
  deleteBehavior(testCrudApp(context))
]