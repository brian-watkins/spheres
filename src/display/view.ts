import { GetState } from "../index.js";
import { LoopMessage, State } from "../loop.js";
import { Attribute, CssClasses, CssClassname, EventHandler, Key, makeNode, makeViewData, NoAttribute, Property, statefulView, StatefulViewOptions, View, ViewAttribute } from "./vdom.js";
export type { View, ViewAttribute } from "./vdom.js"


export function property(name: string, value: string): ViewAttribute {
  return new Property(name, value)
}

export function id(value: string): ViewAttribute {
  return new Property("id", value)
}

export function key(value: string | number | State<any>): ViewAttribute {
  return new Key(`${value}`)
}

export function data(name: string, value: string = "true"): ViewAttribute {
  return new Attribute(`data-${name}`, value)
}

export function value(value: string): ViewAttribute {
  return new Attribute("value", value)
}

export function disabled(isDisabled: boolean): ViewAttribute {
  return isDisabled ? new Attribute("disabled", "") : new NoAttribute()
}

export function href(value: string): ViewAttribute {
  return new Attribute("href", value)
}

export function text(value: string): View {
  return makeNode(undefined, undefined, undefined, value)
}

export function element(tag: string, attributes: Array<ViewAttribute>, children: Array<View>): View {
  return makeNode(tag, makeViewData(attributes), children)
}

export function div(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("div", attributes, children)
}

export function h1(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("h1", attributes, children)
}

export function h2(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("h2", attributes, children)
}

export function h3(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("h3", attributes, children)
}

export function h4(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("h4", attributes, children)
}

export function h5(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("h5", attributes, children)
}

export function h6(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("h6", attributes, children)
}

export function hr(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("hr", attributes, children)
}

export function article(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("article", attributes, children)
}

export function section(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("section", attributes, children)
}

export function p(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("p", attributes, children)
}

export function ul(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("ul", attributes, children)
}

export function li(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("li", attributes, children)
}

export function a(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("a", attributes, children)
}

export function input(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("input", attributes, children)
}

export function button(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("button", attributes, children)
}

export function textarea(attributes: Array<ViewAttribute>, children: Array<View>): View {
  return element("textarea", attributes, children)
}

export function cssClasses(classes: Array<CssClassname>): ViewAttribute {
  const classObject: { [key: CssClassname]: boolean } = {}
  for (const classname of classes) {
    classObject[classname] = true
  }

  return new CssClasses(classObject)
}


export function onClick<M extends LoopMessage<any>>(message: M): ViewAttribute {
  return new EventHandler("click", () => message)
}

export function onInput<M extends LoopMessage<any>>(generator: (value: string) => M): ViewAttribute {
  return new EventHandler("input", (evt) => {
    return generator((<HTMLInputElement>evt.target)?.value)
  })
}

export type ViewGenerator = (parent: View) => View

export function withState(options: StatefulViewOptions, generator: (get: <S>(state: State<S>) => S) => View): View
export function withState(generator: (get: <S>(state: State<S>) => S) => View): View
export function withState(optionsOrGenerator: StatefulViewOptions | ((get: GetState) => View), generator?: (get: GetState) => View): View {
  if (typeof optionsOrGenerator === "function") {
    return statefulView("view-fragment", {}, optionsOrGenerator as (get: GetState) => View)
  } else {
    return statefulView("view-fragment", optionsOrGenerator as StatefulViewOptions, generator!)
  }
}

export async function island(loader: () => Promise<{ default: (get: GetState) => View }>): Promise<View> {
  const loadedModule = await loader()
  return statefulView("view-island", { loader: loader.toString() }, loadedModule.default)
}