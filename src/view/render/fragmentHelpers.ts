
export function createFragment(start: string, end: string) {
  const fragment = document.createDocumentFragment()
  fragment.appendChild(document.createComment(start))
  fragment.appendChild(document.createComment(end))
  return fragment
}

export const MATCH_START = "match-start-"

export function matchStartIndicator(id: string): string {
  return `${MATCH_START}${id}`
}

export function matchEndIndicator(id: string): string {
  return `match-end-${id}`
}

export function getMatchElementId(element: Node): string {
  return element.nodeValue!.substring(MATCH_START.length)
}

export function findMatchEndNode(start: Node, id: string): Node {
  let end = start.nextSibling!
  while (end.nodeValue !== `match-end-${id}`) {
    end = end.nextSibling!
  }

  return end
}

export const LIST_START = "list-start-"

export function listStartIndicator(id: string): string {
  return `${LIST_START}${id}`
}

export function listEndIndicator(id: string): string {
  return `list-end-${id}`
}

export function getListElementId(element: Node): string {
  return element.nodeValue!.substring(LIST_START.length)
}

export function findListEndNode(start: Node, id: string): Node {
  let end = start.nextSibling!
  while (end && end.nodeValue !== listEndIndicator(id)) {
    end = end.nextSibling!
  }
  return end
}