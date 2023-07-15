import { Container, container, GetState, Store, write } from "state-party"
import { inputValue, LitView, withState } from "@src/index.js"
import { html, nothing } from "lit-html"

const nameState = container({ initialValue: "hello" })

const ageState = container({ initialValue: 27 })

const ageView = (get: GetState) => {
  return html`
    <p data-age="true">My age is ${get(ageState)}</p>
  `

  // return view()
  //   .p(el => {
  //     el.config.dataAttribute("age")
  //     el.view.text(`My age is ${get(ageState)}`)
  //   })
}

const nameView = (store: Store) => (get: GetState) => {
  const name = get(nameState)

  // const age = html`<stateful-view .store=${store} .generator=${ageView}></stateful-view>`
  // const age = html`${withState(store, ageView)}`

  return html`
    <div>
      <p data-name="true">My name is: ${name}</p>
      ${ name !== "AGELESS PERSON" ? withState(store, ageView) : withState(store, () => html`${nothing}`) }
    </div>
  `

  // return view()
  //   .div(el => {
  //     el.view.p(el => {
  //       el.config.dataAttribute("name")
  //       el.view.text(`My name is: ${name}`)
  //     })
  //     if (name !== "AGELESS PERSON") {
  //       el.view.withState({ view: ageView })
  //     }
  //   })
}


export default function (): LitView {
  const handleInput = (state: Container<any>) => (evt: Event) => {
    evt.target?.dispatchEvent(new CustomEvent("displayMessage", {
      bubbles: true,
      cancelable: true,
      detail: write(state, inputValue(evt))
    }))
  }

  return new LitView((store) => html`
    <div>
      <h1>This is only a test!</h1>
      ${withState(store, nameView(store))}
      <hr />
      <input type="text" data-name-input="true" @input=${handleInput(nameState)} />
      <input type="text" data-age-input="true" @input=${handleInput(ageState)} />
    </div>
  `)


  // return view()
  //   .div(el => {
  //     el.view
  //       .h1(el => el.view.text("This is only a test!"))
  //       .withState({ view: nameView })
  //       .hr()
  //       .input(({config}) => {
  //         config
  //           .dataAttribute("name-input")
  //           .on({
  //             input: (evt) => write(nameState, inputValue(evt))
  //           })
  //       })
  //       .input(({config}) => {
  //         config
  //           .dataAttribute("age-input")
  //           .on({
  //             input: evt => write(ageState, Number(inputValue(evt)))
  //           })
  //       })
  //   })
}