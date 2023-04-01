declare module "snabbdom-to-html/init.js" {
  import {VNode, Module, ModuleIndex} from "snabbdom-to-html-common";
  function init (modules: Module[]): (vnode: VNode) => string;
  export = init
}

declare module "snabbdom-to-html/modules/index.js" {
  import {ModuleIndex} from "snabbdom-to-html-common";
  let modules: ModuleIndex;
  export = modules
}