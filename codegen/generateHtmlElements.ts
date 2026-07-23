import { MethodSignatureStructure, OptionalKind, ParameterDeclarationStructure, Project } from "ts-morph"
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

htmlElementsFile.addTypeAlias({
  name: "HTMLView",
  isExported: true,
  type: "(root: HTMLBuilder) => void"
})

htmlElementsFile.addTypeAlias({
  name: "TagElement",
  isExported: true,
  typeParameters: ["T extends string"],
  type: "T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : HTMLElement"
})

const caseMatcherInterface = htmlElementsFile.addInterface({
  name: "HTMLCaseMatcher",
  typeParameters: ["T"],
  isExported: true
})

caseMatcherInterface.addMethod({
  name: "when",
  typeParameters: ["X extends T"],
  parameters: [
    { name: "typePredicate", type: "(val: T) => val is X" },
    { name: "generator", type: "(useCase: UseCase<X>) => HTMLView" }
  ],
  returnType: "HTMLCaseMatcher<T>"
})

caseMatcherInterface.addMethod({
  name: "default",
  parameters: [
    { name: "generator", "type": "(useCase: UseCase<T>) => HTMLView" }
  ],
  returnType: "void"
})

const conditionMatcherInterface = htmlElementsFile.addInterface({
  name: "HTMLConditionMatcher",
  isExported: true
})

conditionMatcherInterface.addMethod({
  name: "when",
  parameters: [
    { name: "predicate", type: "(get: GetState) => boolean" },
    { name: "view", type: "HTMLView" }
  ],
  returnType: "HTMLConditionMatcher"
})

conditionMatcherInterface.addMethod({
  name: "default",
  parameters: [
    { name: "view", type: "HTMLView" }
  ],
  returnType: "void"
})


const viewMatcherInterface = htmlElementsFile.addInterface({
  name: "HTMLViewMatcher",
  isExported: true
})

viewMatcherInterface.addMethod({
  name: "withUnion",
  typeParameters: ["T"],
  parameters: [
    { name: "unionValue", type: "(get: GetState) => T" }
  ],
  returnType: "HTMLCaseMatcher<T>"
})

viewMatcherInterface.addMethod({
  name: "withConditions",
  returnType: "HTMLConditionMatcher"
})

const specialHtmlElementsInterface = htmlElementsFile.addInterface({
  name: "SpecialHTMLElements",
  isExported: true
})

specialHtmlElementsInterface.addMethod({
  name: "element",
  parameters: [
    { name: "tag", type: "string" },
    { name: "builder", type: "(element: ConfigurableElement<SpecialElementAttributes & GlobalHTMLAttributes, HTMLBuilder>) => void", hasQuestionToken: true },
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
  name: "subviewMatching",
  parameters: [
    { name: "matcherGenerator", type: "(matcher: HTMLViewMatcher) => void" }
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
    { name: "viewGenerator", type: "(useItem: UseItem<T>) => HTMLView" }
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
    returnType: "HTMLBuilder"
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
      `SpecialElementAttributes<TagElement<"${tag}">>`,
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
  return (voidHtmlTags as Array<string>).includes(tag) ? "never" : "HTMLBuilder"
}