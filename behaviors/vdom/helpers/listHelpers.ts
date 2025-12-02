import { Action, Observation, Presupposition, effect, fact, step } from "best-behavior"
import { RenderApp } from "./renderContext"
import { selectElements } from "./displayElement"
import { expect, is } from "great-expectations"
import { container, Container } from "@store/index.js"
import { HTMLView, UseData } from "@view/index"

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
          el.children.subviews(get => get(context.state.listContainer), itemView)
        })
      })
    }),
  ]
}

export function ssrAndActivateBasedOnState(data: Array<string>): Array<Presupposition<RenderApp<ListExamplesState>>> {
  return [
    containerWithList(data),
    fact("there is a view that renders based on the list", (context) => {
      context.ssrAndActivate(root => {
        root.div(el => {
          el.children.subviews(get => get(context.state.listContainer), itemView)
        })
      })
    }),
  ]
}

export function itemView(stateful: UseData<string>): HTMLView {
  return (root) => {
    root.p(el => {
      el.config.dataAttribute("child")
      el.children.textNode(stateful((item, get, index) => `${item} (${get(index)})`))
    })
  }
}

export function otherItemView(stateful: UseData<string>): HTMLView {
  return root => {
    root.h1(el => {
      el.config.dataAttribute("child")
      el.children.textNode(stateful((item, get, index) => `Other ${item} (${get(index)})`))
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
    const childElements = await selectElements("[data-child]").texts()
    expect(childElements, is(expectedTexts))
  })
}
