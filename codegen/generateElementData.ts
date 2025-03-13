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
  declarationKind: VariableDeclarationKind.Const,
  declarations: [
    {
      name: "voidElements",
      type: "Set<string>",
      initializer: "new Set()"
    }
  ],
  isExported: true
})

elementDataFile.addStatements(voidHtmlTags.map(tag => `voidElements.add("${tag}")`))


// SVG Attribute names
const kebabAttributes = new Set<string>()

elementDataFile.addVariableStatement({
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
      elementDataFile.addStatements(`svgAttributeNames.set("${toCamel(attribute)}", "${attribute}")`)
    }
  }
}

project.save()