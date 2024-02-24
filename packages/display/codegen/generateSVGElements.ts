import { svgTagNames } from "svg-tag-names"
import { svgElementAttributes } from 'svg-element-attributes'
import { MethodSignatureStructure, OptionalKind, ParameterDeclarationStructure, Project, VariableDeclarationKind } from "ts-morph"
import { toCamel } from "./helpers"

const project = new Project({
  tsConfigFilePath: "./tsconfig.json",
})

const svgElementsFile = project.createSourceFile("./src/svgElements.ts", undefined, {
  overwrite: true
})
svgElementsFile.addImportDeclarations([
  {
    namedImports: [
      "ConfigurableElement",
      "SpecialElements",
      "SpecialElementBuilder",
      "View",
      "Stateful"
    ],
    moduleSpecifier: "./view.js"
  },
  {
    namedImports: [
      "SpecialAttributes"
    ],
    moduleSpecifier: "./viewConfig.js"
  }
])


// SVGViewBuilder interface

const viewBuilderInterface = svgElementsFile.addInterface({
  name: "SVGBuilder",
  typeParameters: [
    { name: "Context" }
  ],
  extends: [
    "SpecialElementBuilder<Context>"
  ],
  isExported: true
})

for (const tag of svgTagNames) {
  if (isExcluded(tag)) continue

  const methodSignature = viewBuilderInterface.addMethod({
    name: toCamel(tag),
    returnType: "View"
  })

  methodSignature.addParameter({
    name: "builder?",
    type: (writer) => {
      writer.write(`(element: ConfigurableElement<${attributesName(tag)}<Context>, SVGElements<Context>, Context>) => void`)
    }
  })
}


// SVG Elements

const svgElementsInterface = svgElementsFile.addInterface({
  name: "SVGElements",
  typeParameters: [
    { name: "Context" }
  ],
  extends: [
    "SpecialElements<Context>"
  ],
  isExported: true
})


for (const tag of svgTagNames) {
  if (isExcluded(tag)) continue

  const methodSignature = svgElementsInterface.addMethod({
    name: toCamel(tag),
    returnType: "this"
  })

  methodSignature.addParameter({
    name: "builder?",
    type: (writer) => {
      writer.write(`(element: ConfigurableElement<${attributesName(tag)}<Context>, SVGElements<Context>, Context>) => void`)
    }
  })
}

// Global SVG Attributes

const globalAttibutesInterface = svgElementsFile.addInterface({
  name: "GlobalSVGAttributes",
  typeParameters: [
    { name: "Context" }
  ],
  isExported: true
})

const globalAttribute = buildAttributeProperty("this")

for (const attribute of svgElementAttributes['*']) {
  globalAttibutesInterface.addMethod(globalAttribute(attribute))
}


// SVG Attributes

for (const tag of svgTagNames) {
  if (isExcluded(tag)) continue

  const elementAttributes = svgElementAttributes[tag] ?? []

  svgElementsFile.addInterface({
    name: attributesName(tag),
    typeParameters: [
      { name: "Context" }
    ],
    methods: elementAttributes.map(buildAttributeProperty(`${attributesName(tag)}<Context>`)),
    extends: [
      "SpecialAttributes<Context>",
      "GlobalSVGAttributes<Context>"
    ],
    isExported: true
  })
}

function buildAttributeProperty(returnType: string): (attribute: string) => OptionalKind<MethodSignatureStructure> {
  return (attribute) => {
    let parameters: Array<OptionalKind<ParameterDeclarationStructure>> = []
    parameters = [
      { name: "value", type: "string | Stateful<string, Context>" }
    ]

    return {
      name: toCamel(attribute),
      returnType,
      parameters
    }
  }
}


// Attribute names
const kebabAttributes = new Set<string>()

svgElementsFile.addVariableStatement({
  declarationKind: VariableDeclarationKind.Const,
  declarations: [
    {
      name: "svgAttributeNames",
      type: "Map<string, string>",
      initializer: "new Map()"
    }
  ],
  isExported: true
})

for (const tag of svgTagNames) {
  for (const attribute of svgElementAttributes[tag]) {
    if (kebabAttributes.has(attribute)) continue

    if (attribute.includes("-")) {
      kebabAttributes.add(attribute)
      svgElementsFile.addStatements(`svgAttributeNames.set("${toCamel(attribute)}", "${attribute}")`)
    }
  }
}



function attributesName(tag: string): string {
  if (tag === "svg") return "SvgElementAttributes"

  return `${toCamel(tag, true)}SVGElementAttributes`
}

function isExcluded(tag: string): boolean {
  return tag.startsWith("font") ||
    tag === "missing-glyph" ||
    tag === "color-profile"
}

project.save()
