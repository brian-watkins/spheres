export class EffectLocation {
  constructor(readonly findNode: (root: Node) => Node) { }

  nextSibling(): EffectLocation {
    return new EffectLocation((root) => this.findNode(root).nextSibling!)
  }

  firstChild(): EffectLocation {
    return new EffectLocation((root) => this.findNode(root).firstChild!)
  }

  nextCommentSiblingMatching(commentValue: string): EffectLocation {
    return new EffectLocation((root) => {
      let next = this.findNode(root)
      while (next.nodeValue !== commentValue) {
        next = next.nextSibling!
      }
      return next
    })
  }
}
