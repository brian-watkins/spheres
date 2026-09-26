export class ShadowCard extends HTMLElement {
  private internals = this.attachInternals()

  constructor() {
    super()
    if (this.internals.shadowRoot === null) {
      const shadowRoot = this.attachShadow({ mode: "closed" })
      shadowRoot.innerHTML = "<p>In the shadows!</p>"
    }
  }

  connectedCallback() {
    this.setAttribute("data-upgraded", "true")
  }
}
