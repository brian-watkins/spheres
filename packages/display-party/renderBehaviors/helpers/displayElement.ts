
export function selectElement(selector: string): DisplayElement {
  return new DisplayElement(selector, 0)
}

export function selectElementWithText(text: string): DisplayElement {
  return selectElement(`:text("${text}")`)
}

export function selectElements(selector: string): DisplayElementList {
  return new DisplayElementList(selector)
}

export class DisplayElementList {
  constructor(private selector: string) { }

  async map<T>(handler: (element: DisplayElement) => Promise<T>): Promise<Array<T>> {
    const count = await window._testDisplayElementsCount(this.selector)
    const results: Array<T> = []
    for (let i = 0; i < count; i++) {
      const result = await handler(new DisplayElement(this.selector, i))
      results.push(result)
    }
    return results
  }
}

export class DisplayElement {
  constructor(private selector: string, private index: number) { }

  text(): Promise<string> {
    return window._testDisplayElement(this.selector, this.index, "text")
  }

  exists(): Promise<boolean> {
    return window._testDisplayElement(this.selector, this.index, "exists")
  }
}