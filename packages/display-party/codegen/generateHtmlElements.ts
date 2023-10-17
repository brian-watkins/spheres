import { MethodSignatureStructure, OptionalKind, ParameterDeclarationStructure, Project, VariableDeclarationKind } from "ts-morph"
import { htmlElementAttributes } from "html-element-attributes"
import htmlTags from "html-tags"
import { ariaAttributes } from "aria-attributes"
import { booleanAttributes } from "./booleanAttributes"
import { toCamel } from "./helpers"

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
      "ConfigurableElement",
      "SpecialElements",
      "SpecialElementBuilder",
    ],
    moduleSpecifier: "./view.js"
  },
  {
    namedImports: [
      "SpecialAttributes"
    ],
    moduleSpecifier: "./viewConfig.js"
  },
  {
    namedImports: [
      "SVGElements",
      "SvgElementAttributes",
    ],
    moduleSpecifier: "./svgElements.js"
  },
  {
    namedImports: [
      "Stateful"
    ],
    moduleSpecifier: "state-party"
  }
])


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
    "SpecialElementBuilder"
  ],
  isExported: true
})

for (const tag of htmlTags) {
  const methodSignature = viewBuilderInterface.addMethod({
    name: tag,
    returnType: "View"
  })

  if (tag === "svg") {
    methodSignature.addParameter({
      name: "builder?",
      type: (writer) => {
        writer.write(`(element: ConfigurableElement<SvgElementAttributes, SVGElements>) => void`)
      }
    })
  } else {
    methodSignature.addParameter({
      name: "builder?",
      type: (writer) => {
        writer.write(`(element: ConfigurableElement<${attributesName(tag)}, HTMLElements>) => void`)
      }
    })
  }
}


// ViewElements interface

const viewElementsInterface = htmlElementsFile.addInterface({
  name: "HTMLElements",
  extends: [
    "SpecialElements"
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
        writer.write(`(element: ConfigurableElement<SvgElementAttributes, SVGElements>) => void`)
      }
    })
  } else {
    methodSignature.addParameter({
      name: "builder?",
      type: (writer) => {
        writer.write(`(element: ConfigurableElement<${attributesName(tag)}, HTMLElements>) => void`)
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
    methods: elementAttributes.map(buildAttributeProperty(attributesName(tag))),
    extends: [
      "SpecialAttributes",
      "GlobalHTMLAttributes"
    ],
    isExported: true
  })
}


// AriaAttribute Type

htmlElementsFile.addTypeAlias({
  name: "AriaAttribute",
  type: ariaAttributes.map(attr => `"${attr.substring(5)}"`).join(" | "),
  isExported: true
})


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

