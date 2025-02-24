import { MethodSignatureStructure, OptionalKind, ParameterDeclarationStructure, Project, VariableDeclarationKind } from "ts-morph"
import { htmlElementAttributes } from "html-element-attributes"
import htmlTags, { voidHtmlTags } from "html-tags"
import { ariaAttributes } from "aria-attributes"
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
      "ConfigurableElement"
    ],
    moduleSpecifier: "./viewBuilder.js"
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
      "SVGElements",
      "SVGElementAttributes",
    ],
    moduleSpecifier: "./svgElements.js"
  }
])

htmlElementsFile.addTypeAlias({
  name: "HTMLView",
  isExported: true,
  type: "(root: HTMLBuilder) => void"
})

const viewSelectorInterface = htmlElementsFile.addInterface({
  name: "HTMLViewSelector",
  isExported: true
})

viewSelectorInterface.addMethod({
  name: "when",
  parameters: [
    { name: "predicate", type: "(get: GetState) => boolean" },
    { name: "view", type: "HTMLView" }
  ],
  returnType: "HTMLViewSelector"
})

viewSelectorInterface.addMethod({
  name: "default",
  parameters: [
    { name: "view", type: "HTMLView" }
  ],
  returnType: "void"
})

const specialHtmlElementsInterface = htmlElementsFile.addInterface({
  name: "SpecialHTMLElements",
  isExported: true
})

specialHtmlElementsInterface.addMethod({
  name: "element",
  parameters: [
    { name: "tag", type: "string" },
    { name: "builder", type: "(element: ConfigurableElement<SpecialElementAttributes & GlobalHTMLAttributes, HTMLElements>) => void", hasQuestionToken: true }
  ],
  returnType: "this"
})

specialHtmlElementsInterface.addMethod({
  name: "textNode",
  parameters: [
    { name: "value", type: "string | Stateful<string>" }
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
  name: "subviewOf",
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
    { name: "viewGenerator", type: "(item: State<T>, index: State<number>) => HTMLView" }
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
  const methodSignature = viewBuilderInterface.addMethod({
    name: tag,
    returnType: "void"
  })

  if (tag === "svg") {
    methodSignature.addParameter({
      name: "builder?",
      type: (writer) => {
        writer.write(`(element: ConfigurableElement<SVGElementAttributes, SVGElements>) => void`)
      }
    })
  } else {
    methodSignature.addParameter({
      name: "builder?",
      type: (writer) => {
        writer.write(`(element: ConfigurableElement<${attributesName(tag)}, ${elementChildren(tag)}>) => void`)
      }
    })
  }
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
  const methodSignature = viewElementsInterface.addMethod({
    name: tag,
    returnType: "this"
  })

  if (tag === "svg") {
    methodSignature.addParameter({
      name: "builder?",
      type: (writer) => {
        writer.write(`(element: ConfigurableElement<SVGElementAttributes, SVGElements>) => void`)
      }
    })
  } else {
    methodSignature.addParameter({
      name: "builder?",
      type: (writer) => {
        writer.write(`(element: ConfigurableElement<${attributesName(tag)}, ${elementChildren(tag)}>) => void`)
      }
    })
  }
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
        { name: "value", type: "boolean | Stateful<boolean>" }
      ]
    } else {
      parameters = [
        { name: "value", type: "string | Stateful<string>" }
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