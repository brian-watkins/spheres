import { Entity } from "../../store/index.js"
import { dispatchMessage } from "../../store/message.js"
import { GetState, getStateFunctionWithListener, initListener, StateListener, createSubscriber, TokenRegistry } from "../../store/tokenRegistry.js"
import { EffectLocation } from "./effectLocation.js"
import { activateList, ListEffect } from "./effects/listEffect.js"
import { ListEntityEffect } from "./effects/listEntityEffect.js"
import { activateSelect, SelectViewEffect } from "./effects/selectViewEffect.js"
import { findListEndNode, findSwitchEndNode, getListElementId } from "./fragmentHelpers.js"
import { spheresTemplateData, StoreEventHandler } from "./index.js"
import { SelectorCollection } from "./selectorBuilder.js"
import { ListEntityTemplateContext, ListItemTemplateContext } from "./templateContext.js"

export enum EffectTemplateTypes {
  Text, Attribute, Property, List, ListEntity, Select, Event
}

export interface TextEffectTemplate {
  type: EffectTemplateTypes.Text
  effect: StateListener
}

export interface AttributeEffectTemplate {
  type: EffectTemplateTypes.Attribute
  effect: StateListener
}

export interface PropertyEffectTemplate {
  type: EffectTemplateTypes.Property
  effect: StateListener
}

export interface ListEffectTemplate {
  type: EffectTemplateTypes.List
  domTemplate: DOMTemplate
  query: (get: GetState) => Array<any>
  context: ListItemTemplateContext<any>
  elementId: string
  location: EffectLocation
}

export interface ListEntityEffectTemplate {
  type: EffectTemplateTypes.ListEntity
  domTemplate: DOMTemplate
  query: (get: GetState) => Entity<Array<any>>
  context: ListEntityTemplateContext<any>
  elementId: string
  location: EffectLocation
}

export interface SelectEffectTemplate {
  type: EffectTemplateTypes.Select
  selectors: SelectorCollection<DOMTemplate>
  elementId: string
  location: EffectLocation
}

export interface EventEffectTemplate {
  type: EffectTemplateTypes.Event
  name: string
  handler: StoreEventHandler<any>
  location: EffectLocation
}

export type EffectTemplate
  = TextEffectTemplate
  | AttributeEffectTemplate
  | PropertyEffectTemplate
  | ListEffectTemplate
  | ListEntityEffectTemplate
  | SelectEffectTemplate
  | EventEffectTemplate

export enum TemplateType {
  List, Select, Other
}

export interface DOMTemplate {
  type: TemplateType
  isFragment: boolean
  element: HTMLTemplateElement
  effects: Array<EffectTemplate>
}

export function render(template: DOMTemplate, registry: TokenRegistry): Node {
  const fragment = template.element.content.cloneNode(true)

  initialize(template, registry, fragment.firstChild!)

  return template.isFragment ? fragment : fragment.firstChild!
}

export function initialize(template: DOMTemplate, registry: TokenRegistry, root: Node) {
  for (const effect of template.effects) {
    initializeEffect(registry, root, effect)
  }

  if (!template.isFragment) {
    // @ts-ignore
    root[spheresTemplateData] = registry
  }
}

export function activate(template: DOMTemplate, registry: TokenRegistry, root: Node) {
  for (const effect of template.effects) {
    activateEffect(registry, root, effect)
  }

  if (!template.isFragment) {
    // @ts-ignore
    root[spheresTemplateData] = registry
  }
}

function initializeEffect(registry: TokenRegistry, root: Node, effect: EffectTemplate) {
  switch (effect.type) {
    case EffectTemplateTypes.Text:
    case EffectTemplateTypes.Attribute:
    case EffectTemplateTypes.Property: {
      initListener(registry, effect.effect, root)
      break
    }
    case EffectTemplateTypes.List: {
      const listStartIndicatorNode = effect.location.findNode(root)
      const end = findListEndNode(listStartIndicatorNode, effect.elementId)

      const listEffect = new ListEffect(registry, effect.domTemplate, effect.query, effect.context, listStartIndicatorNode, end)
      initListener(registry, listEffect)
      break
    }
    case EffectTemplateTypes.ListEntity: {
      // console.log("Creating a list entity effect!")
      // create some effect that can handle a list entity
      const listStartIndicatorNode = effect.location.findNode(root)
      const listEndIndicatorNode = findListEndNode(listStartIndicatorNode, effect.elementId)

      const listEffect = new ListEntityEffect(registry, effect.domTemplate, effect.query, effect.context, listStartIndicatorNode, listEndIndicatorNode)
      initListener(registry, listEffect)
      break
    }
    case EffectTemplateTypes.Select: {
      const startNode = effect.location.findNode(root)
      const endNode = findSwitchEndNode(startNode, effect.elementId)

      const selectEffect = new SelectViewEffect(registry, effect.selectors, startNode, endNode)
      initListener(registry, selectEffect)
      break
    }
    case EffectTemplateTypes.Event: {
      const element = effect.location.findNode(root)
      element.addEventListener(effect.name, (evt) => {
        const message = effect.handler(evt)
        dispatchMessage(registry, message)
      })
      break
    }
  }
}

function activateEffect(registry: TokenRegistry, root: Node, effect: EffectTemplate) {
  switch (effect.type) {
    case EffectTemplateTypes.Text:
    case EffectTemplateTypes.Attribute:
    case EffectTemplateTypes.Property: {
      initListener(registry, effect.effect, root)
      break
    }
    case EffectTemplateTypes.List: {
      const listStartIndicatorNode = effect.location.findNode(root)
      const elementId = getListElementId(listStartIndicatorNode)
      let end = findListEndNode(listStartIndicatorNode, elementId)

      const listEffect = new ListEffect(registry, effect.domTemplate, effect.query, effect.context, listStartIndicatorNode, end)
      const data = effect.query(getStateFunctionWithListener(createSubscriber(registry, listEffect)))
      const virtualList = activateList(registry, effect.context, effect.domTemplate, listStartIndicatorNode, end, data)
      listEffect.setVirtualList(virtualList)

      break
    }
    case EffectTemplateTypes.Select: {
      const startNode = effect.location.findNode(root)
      const endNode = findSwitchEndNode(startNode, effect.elementId)

      const selectEffect = new SelectViewEffect(registry, effect.selectors, startNode, endNode)
      activateSelect(registry, effect.selectors, startNode, getStateFunctionWithListener(createSubscriber(registry, selectEffect)))

      break
    }
    case EffectTemplateTypes.Event: {
      const element = effect.location.findNode(root)
      element.addEventListener(effect.name, (evt) => {
        const message = effect.handler(evt)
        dispatchMessage(registry, message)
      })
      break
    }
  }
}