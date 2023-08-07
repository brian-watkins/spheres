
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

  async count(): Promise<number> {
    return window._testDisplayElementsCount(this.selector)
  }

  async map<T>(handler: (element: DisplayElement) => Promise<T>): Promise<Array<T>> {
    const count = await this.count()
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

  inputValue(): Promise<string> {
    return window._testDisplayElement(this.selector, this.index, "inputValue")
  }

  type(text: string): Promise<void> {
    return window._testDisplayElement(this.selector, this.index, "type", text)
  }

  exists(): Promise<boolean> {
    return window._testDisplayElement(this.selector, this.index, "exists")
  }

  click(): Promise<void> {
    return window._testDisplayElement(this.selector, this.index, "click")
  }
}