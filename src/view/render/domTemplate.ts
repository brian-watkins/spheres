import { dispatchMessage } from "../../store/message.js"
import { GetState, getStateFunctionWithListener, initListener, StateListener, createSubscriber, TokenRegistry } from "../../store/tokenRegistry.js"
import { EffectLocation } from "./effectLocation.js"
import { activateList, ListEffect } from "./effects/listEffect.js"
import { activateMatch, MatchViewEffect } from "./effects/matchViewEffect.js"
import { findListEndNode, findMatchEndNode, getListElementId, getMatchElementId, LIST_START, MATCH_START } from "./fragmentHelpers.js"
import { spheresTemplateData, StoreEventHandler } from "./index.js"
import { TemplateCollection } from "./viewMatcherBuilder.js"
import { ListItemTemplateContext } from "./templateContext.js"

export enum EffectTemplateTypes {
  Text, Attribute, Property, List, Match, Event
}

export interface TextEffectTemplate {
  type: EffectTemplateTypes.Text
  effect: StateListener
  location: EffectLocation
}

export interface AttributeEffectTemplate {
  type: EffectTemplateTypes.Attribute
  effect: StateListener
  location: EffectLocation
}

export interface PropertyEffectTemplate {
  type: EffectTemplateTypes.Property
  effect: StateListener
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

export interface MatchEffectTemplate {
  type: EffectTemplateTypes.Match
  collection: TemplateCollection<DOMTemplate>
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
  | MatchEffectTemplate
  | EventEffectTemplate

export enum TemplateType {
  List, Match, Other
}

export interface DOMTemplate {
  type: TemplateType
  isFragment: boolean
  element: HTMLTemplateElement
  effects: Array<EffectTemplate>
}

export function render(template: DOMTemplate, registry: TokenRegistry): Node {
  const fragment = template.element.content.cloneNode(true)

  initialize(template, registry, fragment)

  return template.isFragment ? fragment : fragment.firstChild!
}

function initialize(template: DOMTemplate, registry: TokenRegistry, root: Node) {
  attachRegistryData(registry, root.firstChild!)

  initializeEffects(template, registry, root.firstChild!)
}

export function initializeEffects(template: DOMTemplate, registry: TokenRegistry, root: Node) {
  for (const effect of template.effects) {
    initializeEffect(registry, root, effect)
  }
}

export function activate(template: DOMTemplate, registry: TokenRegistry, root: Node) {
  for (const effect of template.effects) {
    activateEffect(registry, root, effect)
  }

  attachRegistryData(registry, root)
}

function attachRegistryData(registry: TokenRegistry, first: Node | null) {
  let node: Node | null = first
  while (node !== null) {
    switch (node.nodeType) {
      case Node.COMMENT_NODE: {
        const indicator = node.nodeValue!
        if (indicator.startsWith(LIST_START)) {
          node = findListEndNode(node, getListElementId(node))
        } else if (indicator.startsWith(MATCH_START)) {
          node = findMatchEndNode(node, getMatchElementId(node))
        }
        break
      }
      case Node.ELEMENT_NODE: {
        // @ts-ignore
        node[spheresTemplateData] = registry
        break
      }
    }

    node = node.nextSibling
  }
}

function initializeEffect(registry: TokenRegistry, root: Node, effect: EffectTemplate) {
  switch (effect.type) {
    case EffectTemplateTypes.Text:
    case EffectTemplateTypes.Attribute:
    case EffectTemplateTypes.Property: {
      initListener(registry, effect.effect, effect.location.findNode(root))
      break
    }
    case EffectTemplateTypes.List: {
      const listStartIndicatorNode = effect.location.findNode(root)
      const end = findListEndNode(listStartIndicatorNode, effect.elementId)

      const listEffect = new ListEffect(registry, effect.domTemplate, effect.query, effect.context, listStartIndicatorNode, end)
      initListener(registry, listEffect)
      break
    }
    case EffectTemplateTypes.Match: {
      const startNode = effect.location.findNode(root)
      const endNode = findMatchEndNode(startNode, effect.elementId)

      const selectEffect = new MatchViewEffect(registry, effect.collection, startNode, endNode)
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
      initListener(registry, effect.effect, effect.location.findNode(root))
      break
    }
    case EffectTemplateTypes.List: {
      const listStartIndicatorNode = effect.location.findNode(root)
      const elementId = getListElementId(listStartIndicatorNode)
      let end = findListEndNode(listStartIndicatorNode, elementId)

      const listEffect = new ListEffect(registry, effect.domTemplate, effect.query, effect.context, listStartIndicatorNode, end)
      const data = effect.query(getStateFunctionWithListener(createSubscriber(registry, listEffect)))
      const virtualList = activateList(registry, effect.context, effect.domTemplate, listStartIndicatorNode, end, data)
      listEffect.setVirtualList(...virtualList)

      break
    }
    case EffectTemplateTypes.Match: {
      const startNode = effect.location.findNode(root)
      const endNode = findMatchEndNode(startNode, effect.elementId)

      const selectEffect = new MatchViewEffect(registry, effect.collection, startNode, endNode)
      const selection = activateMatch(registry, effect.collection, startNode, getStateFunctionWithListener(createSubscriber(registry, selectEffect)))
      selectEffect.setCurrentMatch(selection)

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