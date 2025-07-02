import { HTMLTemplate, templateFromString } from "../template.js";
import { BaseElementRenderer } from "./elementRenderer.js";

export class HtmlElementRenderer extends BaseElementRenderer {
  preTagTemplate(): HTMLTemplate {
    return templateFromString("<!DOCTYPE html>")
  }
}