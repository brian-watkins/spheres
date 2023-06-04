import { MethodSignatureStructure, OptionalKind, ParameterDeclarationStructure, Project } from "ts-morph"
import { htmlElementAttributes } from "html-element-attributes"
import { htmlEventAttributes } from "html-event-attributes"

const project = new Project({
  tsConfigFilePath: "./tsconfig.json",
})

const htmlElementsFile = project.createSourceFile("./src/htmlElements.ts", undefined, {
  overwrite: true
})
htmlElementsFile.addImportDeclarations([
  {
    namedImports: [
      "ViewElement",
      "SpecialElements",
      "SpecialAttributes"
    ],
    moduleSpecifier: "./viewBuilder.js"
  },
  {
    namedImports: [
      "StoreMessage"
    ],
    moduleSpecifier: "state-party"
  }
])

// GlobalAttributes interface

const globalAttibutesInterface = htmlElementsFile.addInterface({
  name: "GlobalAttributes",
  isExported: true
})

for (const attribute of htmlElementAttributes['*']) {
  if (attribute === "class") continue

  globalAttibutesInterface.addMethod({
    name: attribute,
    returnType: "this",
    parameters: [
      { name: "value", type: "string" }
    ]
  })
}

// Events apply to all elements

for (const event of htmlEventAttributes) {
  globalAttibutesInterface.addMethod({
    name: `on${capitalize(event.substring(2))}`,
    returnType: "this",
    typeParameters: [
      {
        name: "M",
        constraint: (writer) => {
          writer.write("StoreMessage<any>")
        }
      }
    ],
    parameters: [
      {
        name: "handler", type: (writer) => {
          writer.write("<E extends Event>(evt: E) => M")
        }
      }
    ]
  })
}

// ViewElements interface

const viewElementsInterface = htmlElementsFile.addInterface({
  name: "ViewElements",
  extends: [
    "SpecialElements"
  ],
  isExported: true
})

for (const tag of Object.keys(htmlElementAttributes)) {
  if (tag === "*") continue

  htmlElementsFile.addInterface({
    name: attributesName(tag),
    methods: htmlElementAttributes[tag].map(buildAttributeProperty(tag)),
    extends: [
      "SpecialAttributes",
      "GlobalAttributes"
    ],
    isExported: true
  })

  const methodSignature = viewElementsInterface.addMethod({
    name: tag,
    returnType: "this"
  })

  methodSignature.addParameter({
    name: "builder?",
    type: (writer) => {
      writer.write(`(element: ViewElement<${attributesName(tag)}>) => void`)
    }
  })
}

project.save()

function buildAttributeProperty(tag: string): (attribute: string) => OptionalKind<MethodSignatureStructure> {
  return (attribute) => {
    let parameters: Array<OptionalKind<ParameterDeclarationStructure>> = []
    if (attribute === "disabled") {
      parameters = [
        { name: "isDisabled", type: "boolean" }
      ]
    } else {
      parameters = [
        { name: "value", type: "string" }
      ]
    }

    return {
      name: toCamel(attribute),
      returnType: attributesName(tag),
      parameters
    }
  }
}

function attributesName(tag: string): string {
  return `${toCamel(tag, true)}ElementAttributes`
}

function toCamel(word: string, capitalizeFirst: boolean = false): string {
  return word
    .split("-")
    .map((word, i) => capitalizeFirst || i > 0 ? capitalize(word) : word)
    .join("")
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.substring(1)
}