import { MethodSignatureStructure, OptionalKind, ParameterDeclarationStructure, Project, PropertySignatureStructure, VariableDeclarationKind } from "ts-morph"
import { htmlElementAttributes } from "html-element-attributes"
import { htmlEventAttributes } from "html-event-attributes"
import { htmlTagNames } from "html-tag-names"
import { ariaAttributes } from "aria-attributes"
import { booleanAttributes } from "./booleanAttributes"

const project = new Project({
  tsConfigFilePath: "./tsconfig.json",
})

const htmlElementsFile = project.createSourceFile("./src/htmlElements.ts", undefined, {
  overwrite: true
})
htmlElementsFile.addImportDeclarations([
  {
    namedImports: [
      "View",
      "ViewElement",
      "SpecialElements",
      "SpecialElementBuilder",
      "SpecialAttributes"
    ],
    moduleSpecifier: "./view.js"
  },
  {
    namedImports: [
      "StoreMessage",
      "Stateful"
    ],
    moduleSpecifier: "state-party"
  }
])

// AriaAttributes interface

const ariaAttributesInterface = htmlElementsFile.addInterface({
  name: "AriaAttributes",
  isExported: true
})

for (const attribute of ariaAttributes) {
  if (attribute.startsWith("aria")) {
    ariaAttributesInterface.addProperty({
      name: toCamel(attribute.substring(5)),
      type: "string",
      hasQuestionToken: true
    })
  }
}

// GlobalAttributes interface

const globalAttibutesInterface = htmlElementsFile.addInterface({
  name: "GlobalAttributes",
  isExported: true
})

const globalAttribute = buildAttributeProperty("this")

for (const attribute of htmlElementAttributes['*']) {
  globalAttibutesInterface.addMethod(globalAttribute(attribute))
}

// add aria role property to global attributes
globalAttibutesInterface.addMethod(buildAttributeProperty("this")("role"))

// Events interface

const eventsInterface = htmlElementsFile.addInterface({
  name: "ElementEvents",
  isExported: true
})

for (const event of htmlEventAttributes) {
  eventsInterface.addProperty({
    name: event.substring(2),
    type: (writer) => {
      writer.write("<E extends Event>(evt: E) => StoreMessage<any>")
    },
    hasQuestionToken: true
  })
}

// ViewBuilder interface

const viewBuilderInterface = htmlElementsFile.addInterface({
  name: "ViewBuilder",
  extends: [
    "SpecialElementBuilder"
  ],
  isExported: true
})

for (const tag of htmlTagNames) {
  const methodSignature = viewBuilderInterface.addMethod({
    name: tag,
    returnType: "View"
  })

  methodSignature.addParameter({
    name: "builder?",
    type: (writer) => {
      writer.write(`(element: ViewElement<${attributesName(tag)}>) => void`)
    }
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

for (const tag of htmlTagNames) {
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

// Attribute Interfaces

for (const tag of htmlTagNames) {
  const elementAttributes = htmlElementAttributes[tag] ?? []

  htmlElementsFile.addInterface({
    name: attributesName(tag),
    methods: elementAttributes.map(buildAttributeProperty(attributesName(tag))),
    extends: [
      "SpecialAttributes",
      "GlobalAttributes"
    ],
    isExported: true
  })
}

// Boolean Attributes Set

htmlElementsFile.addVariableStatement({
  declarationKind: VariableDeclarationKind.Const,
  declarations: [
    {
      name: "booleanAttributes",
      type: "Set<string>",
      initializer: "new Set()"
    }
  ],
  isExported: true
})

htmlElementsFile.addStatements(booleanAttributes.map(attr => `booleanAttributes.add("${attr}")`))

project.save()

function buildAttributeProperty(returnType: string): (attribute: string) => OptionalKind<MethodSignatureStructure> {
  return (attribute) => {
    let parameters: Array<OptionalKind<ParameterDeclarationStructure>> = []
    if (booleanAttributes.includes(attribute)) {
      parameters = [
        { name: "value", type: "boolean | Stateful<boolean>" }
      ]
    } else {
      parameters = [
        { name: "value", type: "string | Stateful<string>" }
      ]
    }

    return {
      name: toCamel(attribute),
      returnType,
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