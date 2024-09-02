import { Action, Observation, Presupposition, effect, fact, step } from "esbehavior"
import { Container, State } from "../../../src/store/store"
import { RenderApp } from "./renderContext"
import { container } from "../../../src/store/container"
import { HTMLView } from "@src/htmlViewBuilder"
import { selectElements } from "./displayElement"
import { expect, is } from "great-expectations"

export interface ListExamplesState {
  listContainer: Container<Array<string>>
}

export function containerWithList(data: Array<string>): Presupposition<RenderApp<ListExamplesState>> {
  return fact("there is state that contains a list of strings", (context) => {
    context.setState({
      listContainer: container({
        initialValue: data
      })
    })
  })
}

export function renderAppBasedOnState(data: Array<string>): Array<Presupposition<RenderApp<ListExamplesState>>> {
  return [
    containerWithList(data),
    fact("there is a view that renders based on the list", (context) => {
      context.mountView(root => {
        root.div(el => {
          el.children.zones(get => get(context.state.listContainer), itemView)
        })
      })
    }),
  ]
}

export function itemView(item: State<string>): HTMLView {
  return (root) => {
    root.p(el => {
      el.config.dataAttribute("child")
      el.children.textNode(get => get(item))
    })
  }
}

export function otherItemView(item: State<string>): HTMLView {
  return root => {
    root.h1(el => {
      el.config.dataAttribute("child")
      el.children.textNode(get => `Other ${get(item)}`)
    })
  }
}

export function updateState(description: string, data: Array<string>): Action<RenderApp<ListExamplesState>> {
  return step(description, (context) => {
    context.writeTo(context.state.listContainer, data)
  })
}

export function childElementText(description: string, expectedTexts: Array<string>): Observation<RenderApp<ListExamplesState>> {
  return effect(description, async () => {
    const childElements = await selectElements("[data-child]").map(el => el.text())
    expect(childElements, is(expectedTexts))
  })
}
