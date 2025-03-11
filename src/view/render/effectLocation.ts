export class EffectLocation {
  constructor(readonly findNode: (root: Node) => Node) { }

  nextSibling(): EffectLocation {
    return new EffectLocation((root) => {
      console.log("Next sibling")
      return this.findNode(root).nextSibling!
    })
  }

  firstChild(): EffectLocation {
    return new EffectLocation((root) => {
      console.log("First child")
      return this.findNode(root).firstChild!
    })
  }

  nextCommentSiblingMatching(commentValue: string): EffectLocation {
    return new EffectLocation((root) => {
      console.log("Comment matching", commentValue)
      let next = this.findNode(root)
      while (next.nodeValue !== commentValue) {
        next = next.nextSibling!
      }
      return next
    })
  }
}
