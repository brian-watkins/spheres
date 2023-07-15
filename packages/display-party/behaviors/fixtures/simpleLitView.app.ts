import { LitView, View, inputValue, litEvent, view, withState } from "@src/index.js"
import { html } from "lit-html"
import { container, GetState, selection, store, write } from "state-party"

const peopleState = container({
  initialValue: [
    { name: "Cool Dude", age: 41 },
    { name: "Awesome Person", age: 28 }
  ]
})

const peopleView = (get: GetState) => {
  const people = get(peopleState)
  // return view()
  // .ul(el => {
  // for (const person of people) {
  // el.view.li(el => {
  // el.config.dataAttribute("person")
  // el.view.text(`${person.name} - ${person.age}`)
  // })
  // }
  // })
  return html`<ul slot="people">${people.map(person =>
    html`<li data-person="true">${person.name} - ${person.age}</li>`
  )}`
}

const localState = container({ initialValue: "" })

const writePeople = selection((get) => {
  return write(peopleState, [{
    name: get(localState),
    age: 104
  }])
})

function updateButton(): View {
  return view()
    .button(el => {
      el.config.on({
        click: () => store(writePeople)
      })
      el.view.text("Click me!")
    })
}

export default function (): LitView {
  const handler = litEvent(() => store(writePeople))

  return new LitView((store) => html`
    <div>
      <p>Here is some person</p>
      ${withState(store, peopleView)}
      <hr />
      <input data-name-input="true" type="text" @input="${litEvent((evt) => write(localState, inputValue(evt)))}" />
      <button @click="${handler}">Click me!</button>
    </div>
  `)
  // view.addSlot("people", peopleView)
  // return view()
  //   .div(el => {
  //     el.view
  //       .p(el => el.view.text("Here is some person"))
  //       .withState({ view: peopleView })
  //       .hr()
  //       .input(el => el.config.on({
  //         input: event => write(localState, inputValue(event))
  //       }))
  //       .withView(updateButton())
  //   })
}