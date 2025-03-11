import { GetState, State } from "../../store";
import { initListener } from "../../store/tokenRegistry";
import { HTMLView } from "../htmlElements";
import { DomRenderer } from "./domRenderer";
import { ListEffect } from "./effects/listEffect";
import { listEndIndicator, listStartIndicator } from "./fragmentHelpers";
import { getDOMTemplate } from "./template";

export class HTMLDomRenderer extends DomRenderer {
  // subviews<T>(data: (get: GetState) => Array<T>, viewGenerator: (item: State<T>, index: State<number>) => HTMLView): this {
  //   // vnode.id = idSequence.next
  //   const listStartNode = document.createComment(listStartIndicator(vnode.id))
  //   const listEndNode = document.createComment(listEndIndicator(vnode.id))
  //   const parentFrag = document.createDocumentFragment()
  //   parentFrag.appendChild(listStartNode)
  //   parentFrag.appendChild(listEndNode)

  //   const effect = new ListEffect(this.zone, this.registry, vnode, listStartNode, listEndNode, getDOMTemplate)
  //   initListener(effect)
  //   return this
  // }
}