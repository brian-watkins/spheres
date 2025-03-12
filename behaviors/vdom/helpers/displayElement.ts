import { usePage } from "best-behavior/page"

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
    return usePage((page, selector) => page.locator(selector).count(), this.selector)
  }

  at(index: number): DisplayElement {
    return new DisplayElement(this.selector, index)
  }

  async texts(): Promise<Array<string>> {
    return this.map(el => el.text())
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

  async text(): Promise<string> {
    const text = await usePage((page, opt) => page.locator(opt.selector).nth(opt.index).textContent({ timeout: 200 }), {
      selector: this.selector,
      index: this.index
    })
    return text ?? ""
  }

  async attribute(name: string): Promise<string | undefined> {
    const attributeValue = await usePage((page, opt) => page.locator(opt.selector).nth(opt.index).getAttribute(opt.name, { timeout: 200 }), {
      selector: this.selector,
      index: this.index,
      name
    })
    return attributeValue ?? undefined
  }

  async property(name: string): Promise<string | undefined> {
    const propertyValue = await usePage((page, opt) => page.locator(opt.selector).nth(opt.index).evaluate((el: Record<string, any>, o) => el[o.name], { name: opt.name }), {
      selector: this.selector,
      index: this.index,
      name
    })

    return propertyValue ?? undefined
  }

  inputValue(): Promise<string> {
    return usePage((page, opt) => page.locator(opt.selector).nth(opt.index).inputValue({ timeout: 200 }), {
      selector: this.selector,
      index: this.index
    })
  }

  type(text: string): Promise<void> {
    return usePage((page, opt) => page.locator(opt.selector).nth(opt.index).fill(opt.text, { timeout: 200 }), {
      selector: this.selector,
      index: this.index,
      text
    })
  }

  async exists(): Promise<boolean> {
    const elementCount = await usePage((page, opt) => page.locator(opt.selector).nth(opt.index).count(), {
      selector: this.selector,
      index: this.index
    })
    return elementCount > 0
  }

  click(): Promise<void> {
    return usePage((page, opt) => page.locator(opt.selector).nth(opt.index).click({ timeout: 200 }), {
      selector: this.selector,
      index: this.index
    })
  }

  focus(): Promise<void> {
    return usePage((page, opt) => page.locator(opt.selector).nth(opt.index).focus({ timeout: 200 }), {
      selector: this.selector,
      index: this.index
    })
  }
}
