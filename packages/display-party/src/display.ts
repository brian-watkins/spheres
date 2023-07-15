import { GetState, Store, StoreMessage } from "state-party";
import { View, renderToDOM } from "./view.js";
import { TemplateResult, html, nothing, render } from "lit-html";
import { ChildPart, Directive, directive } from "lit-html/directive.js";

export function createDisplay(store: Store = new Store()): Display {
  return new Display(store)
}

export class Display {
  private listener: (evt: Event) => void = () => { }

  constructor(private store: Store) {
    this.listener = (evt: Event) => {
      const displayMessageEvent = evt as CustomEvent<StoreMessage<any>>
      this.store.dispatch(displayMessageEvent.detail)
    }
  }

  mount(element: Element, view: View): () => void {
    const renderResult = renderToDOM(this.store, element, view)
    renderResult.root.addEventListener("displayMessage", this.listener)

    return () => {
      renderResult.root.removeEventListener("displayMessage", this.listener)
      renderResult.unmount()
    }
  }
}

export class LitDisplay {
  private listener: (evt: Event) => void = () => { }

  constructor(private store: Store) {
    this.listener = (evt: Event) => {
      const displayMessageEvent = evt as CustomEvent<StoreMessage<any>>
      console.log("Got a message", JSON.stringify(displayMessageEvent.detail))
      this.store.dispatch(displayMessageEvent.detail)
    }
  }

  mount(element: HTMLElement, view: LitView): () => void {
    // const renderResult = renderToDOM(this.store, element, view)
    // renderResult.root.addEventListener("displayMessage", this.listener)
    element.addEventListener("displayMessage", this.listener)
    // view.mount(element)
    // this.store.query((get) => view.templateGenerator(get), (result) => {
    // render(result, element)
    // })
    view.mount(this.store, element)

    return () => {
      element.removeEventListener("displayMessage", this.listener)
      while (element.hasChildNodes()) {
        element.lastChild?.remove()
      }
    }
    // return () => {
    //   renderResult.root.removeEventListener("displayMessage", this.listener)
    //   renderResult.unmount()
    // }
  }
}

export class LitView {
  constructor(public templateGenerator: (store: Store) => TemplateResult) { }

  mount(store: Store, container: HTMLElement) {
    render(this.templateGenerator(store), container)
  }
}

class StatefulViewDirective extends Directive {
  
  render(_: Store, __: (get: GetState) => TemplateResult) {
    return nothing
  }

  update(part: ChildPart, [store, generator]: Array<any>) {
    store.query(generator, (updated: TemplateResult) => {
      render(html`<div>${updated}</div>`, part.parentNode as HTMLElement, { renderBefore: part.startNode as ChildNode })
    })
    return this.render(store, generator)
  }

}

export const withState = directive(StatefulViewDirective)

class StatefulView extends HTMLElement {
  store: Store | undefined
  generator: ((get: GetState) => TemplateResult) | undefined
  private unsubscribe: (() => void) | undefined;

  connectedCallback() {
    // const shadowRoot = this.attachShadow({ mode: "open" })
    // console.log("Added stateful view", this.store, this.generator)
    this.unsubscribe = this.store?.query(this.generator!, (updated) => {
      render(updated, this)
    })
  }

  disconnectedCallback() {
    this.unsubscribe?.()
  }
}

export function litEvent(handler: (evt: Event) => StoreMessage<any>): (evt: Event) => void {
  return (evt: Event) => {
    evt.target?.dispatchEvent(new CustomEvent("displayMessage", {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: handler(evt)
    }))
  }
}

customElements.define("stateful-view", StatefulView)