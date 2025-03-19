import { dispatchMessage } from "../../store/message.js"
import { subscribeOnGet, GetState, initListener, Stateful, TokenRegistry } from "../../store/tokenRegistry.js"
import { EffectLocation } from "./effectLocation.js"
import { UpdateAttributeEffect } from "./effects/attributeEffect.js"
import { activateList, ListEffect } from "./effects/listEffect.js"
import { UpdatePropertyEffect } from "./effects/propertyEffect.js"
import { activateSelect, SelectViewEffect } from "./effects/selectViewEffect.js"
import { UpdateTextEffect } from "./effects/textEffect.js"
import { findListEndNode, findSwitchEndNode, getListElementId } from "./fragmentHelpers.js"
import { spheresTemplateData, StoreEventHandler } from "./index.js"
import { TemplateSelector } from "./selectorBuilder.js"
import { ListItemTemplateContext } from "./templateContext.js"

export enum EffectTemplateTypes {
  Text, Attribute, Property, List, Select, Event
}

export interface TextEffectTemplate {
  type: EffectTemplateTypes.Text
  generator: Stateful<string>
  location: EffectLocation
}

export interface AttributeEffectTemplate {
  type: EffectTemplateTypes.Attribute
  name: string
  generator: Stateful<string>
  location: EffectLocation
}

export interface PropertyEffectTemplate {
  type: EffectTemplateTypes.Property
  name: string
  generator: Stateful<any>
  location: EffectLocation
}

export interface ListEffectTemplate {
  type: EffectTemplateTypes.List
  domTemplate: DOMTemplate
  query: (get: GetState) => Array<any>
  context: ListItemTemplateContext<any>
  elementId: string
  location: EffectLocation
}

export interface SelectEffectTemplate {
  type: EffectTemplateTypes.Select
  selectors: Array<TemplateSelector<DOMTemplate>>
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
    case EffectTemplateTypes.Text: {
      const textEffect = new UpdateTextEffect(registry, effect.location.findNode(root) as Text, effect.generator)
      initListener(textEffect)
      break
    }
    case EffectTemplateTypes.Attribute: {
      const attributeEffect = new UpdateAttributeEffect(registry, effect.location.findNode(root) as Element, effect.name, effect.generator)
      initListener(attributeEffect)
      break
    }
    case EffectTemplateTypes.Property: {
      const propertyEffect = new UpdatePropertyEffect(registry, effect.location.findNode(root) as Element, effect.name, effect.generator)
      initListener(propertyEffect)
      break
    }
    case EffectTemplateTypes.List: {
      const listStartIndicatorNode = effect.location.findNode(root)
      const end = findListEndNode(listStartIndicatorNode, effect.elementId)

      const listEffect = new ListEffect(registry, effect.domTemplate, effect.query, effect.context, listStartIndicatorNode, end)
      initListener(listEffect)
      break
    }
    case EffectTemplateTypes.Select: {
      const startNode = effect.location.findNode(root)
      const endNode = findSwitchEndNode(startNode, effect.elementId)

      const selectEffect = new SelectViewEffect(registry, effect.selectors, startNode, endNode)
      initListener(selectEffect)
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
    case EffectTemplateTypes.Text: {
      const textEffect = new UpdateTextEffect(registry, effect.location.findNode(root) as Text, effect.generator)
      initListener(textEffect)
      break
    }
    case EffectTemplateTypes.Attribute: {
      const attributeEffect = new UpdateAttributeEffect(registry, effect.location.findNode(root) as Element, effect.name, effect.generator)
      initListener(attributeEffect)
      break
    }
    case EffectTemplateTypes.Property: {
      const propertyEffect = new UpdatePropertyEffect(registry, effect.location.findNode(root) as Element, effect.name, effect.generator)
      initListener(propertyEffect)
      break
    }
    case EffectTemplateTypes.List: {
      const listStartIndicatorNode = effect.location.findNode(root)
      const elementId = getListElementId(listStartIndicatorNode)
      let end = findListEndNode(listStartIndicatorNode, elementId)

      const listEffect = new ListEffect(registry, effect.domTemplate, effect.query, effect.context, listStartIndicatorNode, end)
      const data = effect.query(subscribeOnGet(listEffect))
      const virtualList = activateList(registry, effect.context, effect.domTemplate, listStartIndicatorNode, end, data)
      listEffect.setVirtualList(virtualList)

      break
    }
    case EffectTemplateTypes.Select: {
      const startNode = effect.location.findNode(root)
      const endNode = findSwitchEndNode(startNode, effect.elementId)

      const selectEffect = new SelectViewEffect(registry, effect.selectors, startNode, endNode)
      activateSelect(registry, effect.selectors, startNode, subscribeOnGet(selectEffect))

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