import { MethodSignatureStructure, OptionalKind, ParameterDeclarationStructure, Project, VariableDeclarationKind } from "ts-morph"
import { htmlElementAttributes } from "html-element-attributes"
import htmlTags, { voidHtmlTags } from "html-tags"
import { booleanAttributes } from "./booleanAttributes"
import { toCamel } from "./helpers"

const project = new Project({
  tsConfigFilePath: "./tsconfig.json",
})

const htmlElementsFile = project.createSourceFile("./src/view/htmlElements.ts", undefined, {
  overwrite: true
})
htmlElementsFile.addImportDeclarations([
  {
    namedImports: [
      "ConfigurableElement",
      "UseData"
    ],
    moduleSpecifier: "./render/viewRenderer.js"
  },
  {
    namedImports: [
      "GetState",
      "State",
      "Stateful"
    ],
    moduleSpecifier: "../store/index.js"
  },
  {
    namedImports: [
      "SpecialElementAttributes"
    ],
    moduleSpecifier: "./specialAttributes.js"
  },
  {
    namedImports: [
      "ElementSupport"
    ],
    moduleSpecifier: "./elementSupport.js"
  }
])

htmlElementsFile.addTypeAlias({
  name: "HTMLView",
  isExported: true,
  type: "(root: HTMLBuilder) => void"
})

const caseSelectorInterface = htmlElementsFile.addInterface({
  name: "HTMLCaseSelector",
  typeParameters: ["T"],
  isExported: true
})

caseSelectorInterface.addMethod({
  name: "when",
  typeParameters: ["X extends T"],
  parameters: [
    { name: "typePredicate", type: "(val: T) => val is X" },
    { name: "generator", type: "(state: State<X>) => HTMLView" }
  ],
  returnType: "HTMLCaseSelector<T>"
})

caseSelectorInterface.addMethod({
  name: "default",
  parameters: [
    { name: "generator", "type": "(state: State<T>) => HTMLView" }
  ],
  returnType: "void"
})

const conditionSelectorInterface = htmlElementsFile.addInterface({
  name: "HTMLConditionSelector",
  isExported: true
})

conditionSelectorInterface.addMethod({
  name: "when",
  parameters: [
    { name: "predicate", type: "(get: GetState) => boolean" },
    { name: "view", type: "HTMLView" }
  ],
  returnType: "HTMLConditionSelector"
})

conditionSelectorInterface.addMethod({
  name: "default",
  parameters: [
    { name: "view", type: "HTMLView" }
  ],
  returnType: "void"
})


const viewSelectorInterface = htmlElementsFile.addInterface({
  name: "HTMLViewSelector",
  isExported: true
})

viewSelectorInterface.addMethod({
  name: "withUnion",
  typeParameters: ["T"],
  parameters: [
    { name: "state", type: "State<T>" }
  ],
  returnType: "HTMLCaseSelector<T>"
})

viewSelectorInterface.addMethod({
  name: "withConditions",
  returnType: "HTMLConditionSelector"
})

const specialHtmlElementsInterface = htmlElementsFile.addInterface({
  name: "SpecialHTMLElements",
  isExported: true
})

specialHtmlElementsInterface.addMethod({
  name: "element",
  parameters: [
    { name: "tag", type: "string" },
    { name: "builder", type: "(element: ConfigurableElement<SpecialElementAttributes & GlobalHTMLAttributes, HTMLElements>) => void", hasQuestionToken: true },
    { name: "support", type: "ElementSupport", hasQuestionToken: true }
  ],
  returnType: "this"
})

specialHtmlElementsInterface.addMethod({
  name: "textNode",
  parameters: [
    { name: "value", type: "string | Stateful<string | undefined>" }
  ],
  returnType: "this"
})

specialHtmlElementsInterface.addMethod({
  name: "subview",
  parameters: [
    { name: "value", type: "HTMLView" }
  ],
  returnType: "this"
})

specialHtmlElementsInterface.addMethod({
  name: "subviewFrom",
  parameters: [
    { name: "selectorGenerator", type: "(selector: HTMLViewSelector) => void" }
  ],
  returnType: "this"
})

specialHtmlElementsInterface.addMethod({
  name: "subviews",
  typeParameters: [
    { name: "T" }
  ],
  parameters: [
    { name: "data", type: "(get: GetState) => Array<T>" },
    { name: "viewGenerator", type: "(useData: UseData<T>) => HTMLView" }
  ],
  returnType: "this"
})

// GlobalAttributes interface

const globalAttibutesInterface = htmlElementsFile.addInterface({
  name: "GlobalHTMLAttributes",
  isExported: true
})

const globalAttribute = buildAttributeProperty("this")

for (const attribute of htmlElementAttributes['*']) {
  globalAttibutesInterface.addMethod(globalAttribute(attribute))
}

// add aria role property to global attributes
globalAttibutesInterface.addMethod(buildAttributeProperty("this")("role"))


// ViewBuilder interface

const viewBuilderInterface = htmlElementsFile.addInterface({
  name: "HTMLBuilder",
  extends: [
    "SpecialHTMLElements"
  ],
  isExported: true
})

for (const tag of htmlTags) {
  if (tag === "svg") {
    continue
  }

  const methodSignature = viewBuilderInterface.addMethod({
    name: tag,
    returnType: "void"
  })

  methodSignature.addParameter({
    name: "builder?",
    type: (writer) => {
      writer.write(`(element: ConfigurableElement<${attributesName(tag)}, ${elementChildren(tag)}>) => void`)
    }
  })
}


// ViewElements interface

const viewElementsInterface = htmlElementsFile.addInterface({
  name: "HTMLElements",
  extends: [
    "SpecialHTMLElements"
  ],
  isExported: true
})

for (const tag of htmlTags) {
  if (tag === "svg") {
    continue
  }

  const methodSignature = viewElementsInterface.addMethod({
    name: tag,
    returnType: "this"
  })

  methodSignature.addParameter({
    name: "builder?",
    type: (writer) => {
      writer.write(`(element: ConfigurableElement<${attributesName(tag)}, ${elementChildren(tag)}>) => void`)
    }
  })
}


// Attribute Interfaces

for (const tag of htmlTags) {
  if (tag === "svg") {
    continue
  }

  const elementAttributes = htmlElementAttributes[tag] ?? []

  htmlElementsFile.addInterface({
    name: attributesName(tag),
    methods: elementAttributes.map(buildAttributeProperty(`${attributesName(tag)}`)),
    extends: [
      "SpecialElementAttributes",
      "GlobalHTMLAttributes"
    ],
    isExported: true
  })
}


project.save()

function buildAttributeProperty(returnType: string): (attribute: string) => OptionalKind<MethodSignatureStructure> {
  return (attribute) => {
    let parameters: Array<OptionalKind<ParameterDeclarationStructure>> = []
    if (booleanAttributes.includes(attribute)) {
      parameters = [
        { name: "value", type: "boolean | Stateful<boolean | undefined>" }
      ]
    } else {
      parameters = [
        { name: "value", type: "string | Stateful<string | undefined>" }
      ]
    }

    return {
      name: toCamel(attribute),
      returnType: `${returnType}`,
      parameters
    }
  }
}

function attributesName(tag: string): string {
  return `${toCamel(tag, true)}ElementAttributes`
}

function elementChildren(tag: string): string {
  return (voidHtmlTags as Array<string>).includes(tag) ? "never" : "HTMLElements"
}