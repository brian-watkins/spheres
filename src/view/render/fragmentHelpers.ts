
export function createFragment(start: string, end: string) {
  const fragment = document.createDocumentFragment()
  fragment.appendChild(document.createComment(start))
  fragment.appendChild(document.createComment(end))
  return fragment
}

export function switchStartIndicator(id: string): string {
  return `switch-start-${id}`
}

export function switchEndIndicator(id: string): string {
  return `switch-end-${id}`
}

export function getSwitchElementId(element: Node): string {
  return element.nodeValue!.substring(13)
}

export function findSwitchEndNode(start: Node, id: string): Node {
  let end = start.nextSibling!
  while (end.nodeValue !== `switch-end-${id}`) {
    end = end.nextSibling!
  }

  return end
}

export function listStartIndicator(id: string): string {
  return `list-start-${id}`
}

export function listEndIndicator(id: string): string {
  return `list-end-${id}`
}

export function getListElementId(element: Node): string {
  return element.nodeValue!.substring(11)
}

export function findListEndNode(start: Node, id: string): Node {
  let end = start.nextSibling!
  while (end && end.nodeValue !== `list-end-${id}`) {
    end = end.nextSibling!
  }
  return end
}