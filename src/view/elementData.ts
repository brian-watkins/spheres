export type AriaAttribute = "activedescendant" | "atomic" | "autocomplete" | "busy" | "checked" | "colcount" | "colindex" | "colspan" | "controls" | "current" | "describedby" | "details" | "disabled" | "dropeffect" | "errormessage" | "expanded" | "flowto" | "grabbed" | "haspopup" | "hidden" | "invalid" | "keyshortcuts" | "label" | "labelledby" | "level" | "live" | "modal" | "multiline" | "multiselectable" | "orientation" | "owns" | "placeholder" | "posinset" | "pressed" | "readonly" | "relevant" | "required" | "roledescription" | "rowcount" | "rowindex" | "rowspan" | "selected" | "setsize" | "sort" | "valuemax" | "valuemin" | "valuenow" | "valuetext" | "";

let voidElementData: Set<string> | undefined = undefined;

export function voidElements(): Set<string> {
    if (voidElementData === undefined) {
      const data = "area,base,br,col,embed,hr,img,input,link,menuitem,meta,param,source,track,wbr"
      voidElementData = new Set(data.split(','))
    }

    return voidElementData
}

let svgAttributeData: Map<string, string> | undefined = undefined;

export function svgAttributeNames(): Map<string, string> {
    if (svgAttributeData === undefined) {
      svgAttributeData = new Map()
      svgAttributeData.set("alignmentBaseline", "alignment-baseline")
      svgAttributeData.set("baselineShift", "baseline-shift")
      svgAttributeData.set("clipPath", "clip-path")
      svgAttributeData.set("clipRule", "clip-rule")
      svgAttributeData.set("colorInterpolation", "color-interpolation")
      svgAttributeData.set("colorInterpolationFilters", "color-interpolation-filters")
      svgAttributeData.set("colorProfile", "color-profile")
      svgAttributeData.set("colorRendering", "color-rendering")
      svgAttributeData.set("dominantBaseline", "dominant-baseline")
      svgAttributeData.set("enableBackground", "enable-background")
      svgAttributeData.set("fillOpacity", "fill-opacity")
      svgAttributeData.set("fillRule", "fill-rule")
      svgAttributeData.set("floodColor", "flood-color")
      svgAttributeData.set("floodOpacity", "flood-opacity")
      svgAttributeData.set("fontFamily", "font-family")
      svgAttributeData.set("fontSize", "font-size")
      svgAttributeData.set("fontSizeAdjust", "font-size-adjust")
      svgAttributeData.set("fontStretch", "font-stretch")
      svgAttributeData.set("fontStyle", "font-style")
      svgAttributeData.set("fontVariant", "font-variant")
      svgAttributeData.set("fontWeight", "font-weight")
      svgAttributeData.set("glyphOrientationHorizontal", "glyph-orientation-horizontal")
      svgAttributeData.set("glyphOrientationVertical", "glyph-orientation-vertical")
      svgAttributeData.set("imageRendering", "image-rendering")
      svgAttributeData.set("letterSpacing", "letter-spacing")
      svgAttributeData.set("lightingColor", "lighting-color")
      svgAttributeData.set("markerEnd", "marker-end")
      svgAttributeData.set("markerMid", "marker-mid")
      svgAttributeData.set("markerStart", "marker-start")
      svgAttributeData.set("navDown", "nav-down")
      svgAttributeData.set("navDownLeft", "nav-down-left")
      svgAttributeData.set("navDownRight", "nav-down-right")
      svgAttributeData.set("navLeft", "nav-left")
      svgAttributeData.set("navNext", "nav-next")
      svgAttributeData.set("navPrev", "nav-prev")
      svgAttributeData.set("navRight", "nav-right")
      svgAttributeData.set("navUp", "nav-up")
      svgAttributeData.set("navUpLeft", "nav-up-left")
      svgAttributeData.set("navUpRight", "nav-up-right")
      svgAttributeData.set("pointerEvents", "pointer-events")
      svgAttributeData.set("shapeRendering", "shape-rendering")
      svgAttributeData.set("stopColor", "stop-color")
      svgAttributeData.set("stopOpacity", "stop-opacity")
      svgAttributeData.set("strokeDasharray", "stroke-dasharray")
      svgAttributeData.set("strokeDashoffset", "stroke-dashoffset")
      svgAttributeData.set("strokeLinecap", "stroke-linecap")
      svgAttributeData.set("strokeLinejoin", "stroke-linejoin")
      svgAttributeData.set("strokeMiterlimit", "stroke-miterlimit")
      svgAttributeData.set("strokeOpacity", "stroke-opacity")
      svgAttributeData.set("strokeWidth", "stroke-width")
      svgAttributeData.set("textAnchor", "text-anchor")
      svgAttributeData.set("textDecoration", "text-decoration")
      svgAttributeData.set("textRendering", "text-rendering")
      svgAttributeData.set("unicodeBidi", "unicode-bidi")
      svgAttributeData.set("wordSpacing", "word-spacing")
      svgAttributeData.set("writingMode", "writing-mode")
      svgAttributeData.set("renderingIntent", "rendering-intent")
      svgAttributeData.set("horizAdvX", "horiz-adv-x")
      svgAttributeData.set("horizOriginX", "horiz-origin-x")
      svgAttributeData.set("horizOriginY", "horiz-origin-y")
      svgAttributeData.set("vertAdvY", "vert-adv-y")
      svgAttributeData.set("vertOriginX", "vert-origin-x")
      svgAttributeData.set("vertOriginY", "vert-origin-y")
      svgAttributeData.set("accentHeight", "accent-height")
      svgAttributeData.set("capHeight", "cap-height")
      svgAttributeData.set("overlinePosition", "overline-position")
      svgAttributeData.set("overlineThickness", "overline-thickness")
      svgAttributeData.set("panose1", "panose-1")
      svgAttributeData.set("strikethroughPosition", "strikethrough-position")
      svgAttributeData.set("strikethroughThickness", "strikethrough-thickness")
      svgAttributeData.set("underlinePosition", "underline-position")
      svgAttributeData.set("underlineThickness", "underline-thickness")
      svgAttributeData.set("unicodeRange", "unicode-range")
      svgAttributeData.set("unitsPerEm", "units-per-em")
      svgAttributeData.set("vAlphabetic", "v-alphabetic")
      svgAttributeData.set("vHanging", "v-hanging")
      svgAttributeData.set("vIdeographic", "v-ideographic")
      svgAttributeData.set("vMathematical", "v-mathematical")
      svgAttributeData.set("xHeight", "x-height")
      svgAttributeData.set("arabicForm", "arabic-form")
      svgAttributeData.set("glyphName", "glyph-name")
    }

    return svgAttributeData
}
