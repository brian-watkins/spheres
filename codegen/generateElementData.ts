import { ariaAttributes } from "aria-attributes"
import { voidHtmlTags } from "html-tags"
import { Project, VariableDeclarationKind } from "ts-morph"
import { svgTagNames } from "svg-tag-names"
import { svgElementAttributes } from "svg-element-attributes"
import { toCamel } from "./helpers"

const project = new Project({
  tsConfigFilePath: "./tsconfig.json",
})

const elementDataFile = project.createSourceFile("./src/view/elementData.ts", undefined, {
  overwrite: true
})



// AriaAttribute Type

elementDataFile.addTypeAlias({
  name: "AriaAttribute",
  type: ariaAttributes.map(attr => `"${attr.substring(5)}"`).join(" | "),
  isExported: true
})


// Void Elements Set

elementDataFile.addVariableStatement({
  declarationKind: VariableDeclarationKind.Let,
  declarations: [
    {
      name: "voidElementData",
      type: "Set<string> | undefined",
      initializer: "undefined"
    }
  ]
})

elementDataFile.addFunction({
  name: "voidElements",
  returnType: "Set<string>",
  isExported: true,
  statements: [
    "if (voidElementData === undefined) {",
    `  const data = "${voidHtmlTags.join(",")}"`,
    "  voidElementData = new Set(data.split(','))",
    "}",
    "return voidElementData"
  ]
})


// SVG Attribute names
const kebabAttributes = new Set<string>()

elementDataFile.addVariableStatement({
  declarationKind: VariableDeclarationKind.Let,
  declarations: [
    {
      name: "svgAttributeData",
      type: "Map<string, string> | undefined",
      initializer: "undefined"
    }
  ]
})

const svgAttributeStatements: Array<string> = []
for (const tag of svgTagNames) {
  for (const attribute of svgElementAttributes[tag]) {
    if (kebabAttributes.has(attribute)) continue

    if (attribute.includes("-")) {
      kebabAttributes.add(attribute)
      svgAttributeStatements.push(`  svgAttributeData.set("${toCamel(attribute)}", "${attribute}")`)
    }
  }
}

elementDataFile.addFunction({
  name: "svgAttributeNames",
  returnType: "Map<string, string>",
  isExported: true,
  statements: [
    "if (svgAttributeData === undefined) {",
    "  svgAttributeData = new Map()",
    ...svgAttributeStatements,
    "}",
    "return svgAttributeData"
  ]
})


project.save()