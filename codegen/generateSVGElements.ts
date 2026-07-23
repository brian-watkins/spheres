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
      "UseCase",
      "UseItem"
    ],
    moduleSpecifier: "./render/viewRenderer.js"
  },
  {
    namedImports: [
      "GetState",
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

svgElementsFile.addTypeAlias({
  name: "SVGView",
  isExported: true,
  type: "(root: SVGBuilder) => void"
})

svgElementsFile.addTypeAlias({
  name: "SvgTagElement",
  isExported: true,
  typeParameters: ["T extends string"],
  type: "T extends keyof SVGElementTagNameMap ? SVGElementTagNameMap[T] : SVGElement"
})

const caseMatcherInterface = svgElementsFile.addInterface({
  name: "SVGCaseMatcher",
  typeParameters: [ "T" ],
  isExported: true
})

caseMatcherInterface.addMethod({
  name: "when",
  typeParameters: [ "X extends T" ],
  parameters: [
    { name: "typePredicate", type: "(val: T) => val is X" },
    { name: "generator", type: "(useCase: UseCase<X>) => SVGView" }
  ],
  returnType: "SVGCaseMatcher<T>"
})

caseMatcherInterface.addMethod({
  name: "default",
  parameters: [
    { name: "generator", "type": "(useCase: UseCase<T>) => SVGView" }
  ],
  returnType: "void"
})

const conditionMatcherInterface = svgElementsFile.addInterface({
  name: "SVGConditionMatcher",
  isExported: true
})

conditionMatcherInterface.addMethod({
  name: "when",
  parameters: [
    { name: "predicate", type: "(get: GetState) => boolean" },
    { name: "view", type: "SVGView" }
  ],
  returnType: "SVGConditionMatcher"
})

conditionMatcherInterface.addMethod({
  name: "default",
  parameters: [
    { name: "view", type: "SVGView" }
  ],
  returnType: "void"
})

const viewMatcherInterface = svgElementsFile.addInterface({
  name: "SVGViewMatcher",
  isExported: true
})

viewMatcherInterface.addMethod({
  name: "withUnion",
  typeParameters: [ "T" ],
  parameters: [
    { name: "unionValue", type: "(get: GetState) => T" }
  ],
  returnType: "SVGCaseMatcher<T>"
})

viewMatcherInterface.addMethod({
  name: "withConditions",
  returnType: "SVGConditionMatcher"
})

const specialSVGElementsInterface = svgElementsFile.addInterface({
  name: "SpecialSVGElements",
  isExported: true
})

specialSVGElementsInterface.addMethod({
  name: "element",
  parameters: [
    { name: "tag", type: "string" },
    { name: "builder", type: "(element: ConfigurableElement<SpecialElementAttributes & GlobalSVGAttributes, SVGBuilder>) => void", hasQuestionToken: true },
    { name: "support", type: "ElementSupport", hasQuestionToken: true }
  ],
  returnType: "this"
})

specialSVGElementsInterface.addMethod({
  name: "textNode",
  parameters: [
    { name: "value", type: "string | Stateful<string | undefined>" }
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
  name: "subviewMatching",
  parameters: [
    { name: "matcherGenerator", type: "(matcher: SVGViewMatcher) => void" }
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
    { name: "viewGenerator", type: "(useItem: UseItem<T>) => SVGView" }
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
    returnType: "SVGBuilder"
  })

  methodSignature.addParameter({
    name: "builder?",
    type: (writer) => {
      writer.write(`(element: ConfigurableElement<${attributesName(tag)}, SVGBuilder>) => void`)
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
      `SpecialElementAttributes<SvgTagElement<"${tag}">>`,
      "GlobalSVGAttributes"
    ],
    isExported: true
  })
}

function buildAttributeProperty(returnType: string): (attribute: string) => OptionalKind<MethodSignatureStructure> {
  return (attribute) => {
    let parameters: Array<OptionalKind<ParameterDeclarationStructure>> = []
    parameters = [
      { name: "value", type: "string | Stateful<string | undefined>" }
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
