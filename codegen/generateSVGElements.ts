import { svgTagNames } from "svg-tag-names"
import { svgElementAttributes } from 'svg-element-attributes'
import { MethodSignatureStructure, OptionalKind, ParameterDeclarationStructure, Project, VariableDeclarationKind } from "ts-morph"
import { toCamel } from "./helpers"

const project = new Project({
  tsConfigFilePath: "./tsconfig.json",
})

const svgElementsFile = project.createSourceFile("./src/view/svgElements.ts", undefined, {
  overwrite: true
})
svgElementsFile.addImportDeclarations([
  {
    namedImports: [
      "ConfigurableElement",
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
  }
])

svgElementsFile.addTypeAlias({
  name: "SVGView",
  isExported: true,
  type: "(root: SVGBuilder) => void"
})

const caseSelectorInterface = svgElementsFile.addInterface({
  name: "SVGCaseSelector",
  typeParameters: [ "T" ],
  isExported: true
})

caseSelectorInterface.addMethod({
  name: "when",
  typeParameters: [ "X extends T" ],
  parameters: [
    { name: "typePredicate", type: "(val: T) => val is X" },
    { name: "generator", type: "(state: State<X>) => SVGView" }
  ],
  returnType: "SVGCaseSelector<T>"
})

caseSelectorInterface.addMethod({
  name: "default",
  parameters: [
    { name: "generator", "type": "(state: State<T>) => SVGView" }
  ],
  returnType: "void"
})

const predicateSelectorInterface = svgElementsFile.addInterface({
  name: "SVGConditionSelector",
  isExported: true
})

predicateSelectorInterface.addMethod({
  name: "when",
  parameters: [
    { name: "predicate", type: "(get: GetState) => boolean" },
    { name: "view", type: "SVGView" }
  ],
  returnType: "SVGConditionSelector"
})

predicateSelectorInterface.addMethod({
  name: "default",
  parameters: [
    { name: "view", type: "SVGView" }
  ],
  returnType: "void"
})

const viewSelectorInterface = svgElementsFile.addInterface({
  name: "SVGViewSelector",
  isExported: true
})

viewSelectorInterface.addMethod({
  name: "withUnion",
  typeParameters: [ "T" ],
  parameters: [
    { name: "state", type: "State<T>" }
  ],
  returnType: "SVGCaseSelector<T>"
})

viewSelectorInterface.addMethod({
  name: "withConditions",
  returnType: "SVGConditionSelector"
})

const specialSVGElementsInterface = svgElementsFile.addInterface({
  name: "SpecialSVGElements",
  isExported: true
})

specialSVGElementsInterface.addMethod({
  name: "element",
  parameters: [
    { name: "tag", type: "string" },
    { name: "builder", type: "(element: ConfigurableElement<SpecialElementAttributes & GlobalSVGAttributes, SVGElements>) => void", hasQuestionToken: true }
  ],
  returnType: "this"
})

specialSVGElementsInterface.addMethod({
  name: "textNode",
  parameters: [
    { name: "value", type: "string | Stateful<string>" }
  ],
  returnType: "this"
})

specialSVGElementsInterface.addMethod({
  name: "subview",
  parameters: [
    { name: "value", type: "SVGView" }
  ],
  returnType: "this"
})

specialSVGElementsInterface.addMethod({
  name: "subviewFrom",
  parameters: [
    { name: "selectorGenerator", type: "(selector: SVGViewSelector) => void" }
  ],
  returnType: "this"
})

specialSVGElementsInterface.addMethod({
  name: "subviews",
  typeParameters: [
    { name: "T" }
  ],
  parameters: [
    { name: "data", type: "(get: GetState) => Array<T>" },
    { name: "viewGenerator", type: "(item: State<T>, index: State<number>) => SVGView" }
  ],
  returnType: "this"
})


// SVGViewBuilder interface

const viewBuilderInterface = svgElementsFile.addInterface({
  name: "SVGBuilder",
  extends: [
    "SpecialSVGElements"
  ],
  isExported: true
})

for (const tag of svgTagNames) {
  if (isExcluded(tag)) continue

  const methodSignature = viewBuilderInterface.addMethod({
    name: toCamel(tag),
    returnType: "void"
  })

  methodSignature.addParameter({
    name: "builder?",
    type: (writer) => {
      writer.write(`(element: ConfigurableElement<${attributesName(tag)}, SVGElements>) => void`)
    }
  })
}


// SVG Elements

const svgElementsInterface = svgElementsFile.addInterface({
  name: "SVGElements",
  extends: [
    "SpecialSVGElements"
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
      writer.write(`(element: ConfigurableElement<${attributesName(tag)}, SVGElements>) => void`)
    }
  })
}

// Global SVG Attributes

const globalAttibutesInterface = svgElementsFile.addInterface({
  name: "GlobalSVGAttributes",
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
    methods: elementAttributes.map(buildAttributeProperty(`${attributesName(tag)}`)),
    extends: [
      "SpecialElementAttributes",
      "GlobalSVGAttributes"
    ],
    isExported: true
  })
}

function buildAttributeProperty(returnType: string): (attribute: string) => OptionalKind<MethodSignatureStructure> {
  return (attribute) => {
    let parameters: Array<OptionalKind<ParameterDeclarationStructure>> = []
    parameters = [
      { name: "value", type: "string | Stateful<string>" }
    ]

    return {
      name: toCamel(attribute),
      returnType,
      parameters
    }
  }
}



function attributesName(tag: string): string {
  if (tag === "svg") return "SVGElementAttributes"

  return `${toCamel(tag, true)}SVGElementAttributes`
}

function isExcluded(tag: string): boolean {
  return tag.startsWith("font") ||
    tag === "missing-glyph" ||
    tag === "color-profile"
}

project.save()
