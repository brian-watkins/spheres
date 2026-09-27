import { AbstractViewConfig } from "./viewConfig.js"
import { ElementConfig, ElementConfigSupport } from "../elementSupport.js"

export class ShadowRootConfig extends AbstractViewConfig {
  private attributes = new Map<string, string>()

  get shadowRootInit(): ShadowRootInit {
    const userDefinedMode = this.attributes.get("shadowrootmode") as ShadowRootMode | undefined
    return {
      mode: userDefinedMode ?? "open",
      delegatesFocus: this.attributes.has("shadowrootdelegatesfocus"),
      clonable: this.attributes.has("shadowrootclonable"),
      serializable: this.attributes.has("shadowrootserializable"),
    }
  }

  attribute(name: string, value: string): this {
    this.attributes.set(name, value)
    return this
  }

  property(): this {
    return this
  }

  on(): this {
    return this
  }

  elementIdentifier(): this {
    return this
  }
}

export class ShadowRootConfigSupport implements ElementConfigSupport {
  private hasMode: boolean = false

  constructor(private next: ElementConfigSupport) {}

  configure(config: ElementConfig, name: string, args: Array<any>): void {
    if (name === "shadowrootmode") {
      this.hasMode = true
    }

    this.next.configure(config, name, args)
  }

  postBuild(config: ElementConfig): void {
    if (!this.hasMode) {
      config.attribute("shadowrootmode", "open")
    }

    this.next.postBuild?.(config)
  }
}
