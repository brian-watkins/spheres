
export class DisplayElement {
  constructor(private element: HTMLElement) { }

  text(): string {
    return this.element.innerText
  }
}

export class DisplayElementList {
  constructor(private selector: string) { }

  map<T>(mapper: (element: DisplayElement) => T): Array<T> {
    let elements: Array<DisplayElement> = []
    document.querySelectorAll(this.selector).forEach((element) => {
      elements.push(new DisplayElement(element as HTMLElement))
    })
    return elements.map(mapper)
  }
}

export class TestDisplay {
  hasElementMatching(selector: string): boolean {
    return document.querySelector(selector) !== null
  }

  elementMatching(selector: string): DisplayElement {
    const element: HTMLElement | null = document.querySelector(selector)
    if (!element) {
      throw new Error(`No element matches selector: ${selector}`)
    }
    return new DisplayElement(element)
  }

  elementsMatching(selector: string): DisplayElementList {
    return new DisplayElementList(selector)
  }
}
