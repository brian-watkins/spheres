import { behavior, example, fact } from "esbehavior";
import { ListExamplesState, childElementText, containerWithList, itemView, otherItemView, updateState } from "helpers/listHelpers";
import { renderContext } from "helpers/renderContext";

export default behavior("lists interspersed among other children", [

  example(renderContext<ListExamplesState>())
    .description("when there are other children before the list")
    .script({
      suppose: [
        containerWithList(["list-child-1", "list-child-2", "list-child-3"]),
        fact("there is a view with other children", (context) => {
          context.mountView((root) => {
            root.main(el => {
              el.children
                .h1(el => {
                  el.config.dataAttribute("child", "-2")
                  el.children.textNode("Some title")
                })
                .p(el => {
                  el.config.dataAttribute("child", "-1")
                  el.children.textNode("Some text")
                })
                .zones(get => get(context.state.listContainer), itemView)
            })
          })
        })
      ],
      observe: [
        childElementText("all the children are displayed in order", [
          "Some title",
          "Some text",
          "list-child-1",
          "list-child-2",
          "list-child-3"
        ])
      ]
    }).andThen({
      perform: [
        updateState("remove some elements from the list", [
          "list-child-3"
        ])
      ],
      observe: [
        childElementText("the other children are unaffected", [
          "Some title",
          "Some text",
          "list-child-3"
        ])
      ]
    }).andThen({
      perform: [
        updateState("add more items to the list", [
          "list-child-1",
          "list-child-2",
          "list-child-3",
          "list-child-4",
          "list-child-5",
        ])
      ],
      observe: [
        childElementText("the other children are unaffected", [
          "Some title",
          "Some text",
          "list-child-1",
          "list-child-2",
          "list-child-3",
          "list-child-4",
          "list-child-5"
        ])
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("when there are children after the list")
    .script({
      suppose: [
        containerWithList(["list-child-1", "list-child-2", "list-child-3"]),
        fact("there is a view with other children after the list", (context) => {
          context.mountView((root) => {
            root.main(el => {
              el.children
                .zones(get => get(context.state.listContainer), itemView)
                .p(el => {
                  el.config.dataAttribute("child", "-1")
                  el.children.textNode("Some text")
                })
                .h1(el => {
                  el.config.dataAttribute("child", "-2")
                  el.children.textNode("Some footer")
                })
            })
          })
        })
      ],
      observe: [
        childElementText("all the children are displayed in order", [
          "list-child-1",
          "list-child-2",
          "list-child-3",
          "Some text",
          "Some footer"
        ])
      ]
    }).andThen({
      perform: [
        updateState("remove some items from the list", [
          "list-child-2"
        ])
      ],
      observe: [
        childElementText("the other children are unaffected", [
          "list-child-2",
          "Some text",
          "Some footer"
        ])
      ]
    }).andThen({
      perform: [
        updateState("add items at the beginning and the end of the list", [
          "list-child-1",
          "list-child-2",
          "list-child-6",
          "list-child-7",
        ])
      ],
      observe: [
        childElementText("the other children are unaffected", [
          "list-child-1",
          "list-child-2",
          "list-child-6",
          "list-child-7",
          "Some text",
          "Some footer"
        ])
      ]
    }).andThen({
      perform: [
        updateState("add more items at the end", [
          "list-child-1",
          "list-child-2",
          "list-child-6",
          "list-child-7",
          "list-child-8",
          "list-child-9",
        ])
      ],
      observe: [
        childElementText("the other children are unaffected", [
          "list-child-1",
          "list-child-2",
          "list-child-6",
          "list-child-7",
          "list-child-8",
          "list-child-9",
          "Some text",
          "Some footer"
        ])
      ]
    }).andThen({
      perform: [
        updateState("rearrange item to the end", [
          "list-child-1",
          "list-child-6",
          "list-child-7",
          "list-child-8",
          "list-child-9",
          "list-child-2",
        ])
      ],
      observe: [
        childElementText("the other children are unaffected", [
          "list-child-1",
          "list-child-6",
          "list-child-7",
          "list-child-8",
          "list-child-9",
          "list-child-2",
          "Some text",
          "Some footer"
        ])
      ]
    }),

  example(renderContext<ListExamplesState>())
    .description("multiple lists")
    .script({
      suppose: [
        containerWithList(["child-1", "child-2"]),
        fact("there is a view with two lists", (context) => {
          context.mountView((root) => {
            root.main(el => {
              el.children
                .zones(get => get(context.state.listContainer), itemView)
                .zones(get => get(context.state.listContainer), otherItemView)
            })
          })
        })
      ],
      observe: [
        childElementText("both lists are displayed", [
          "child-1",
          "child-2",
          "Other child-1",
          "Other child-2",
        ]) 
      ]
    }).andThen({
      perform: [
        updateState("add to the end of the list", [
          "child-1",
          "child-2",
          "child-3",
        ])
      ],
      observe: [
        childElementText("both lists are updated", [
          "child-1",
          "child-2",
          "child-3",
          "Other child-1",
          "Other child-2",
          "Other child-3",
        ])
      ]
    })

])

