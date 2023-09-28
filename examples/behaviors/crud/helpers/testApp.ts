import { Context } from "esbehavior";
import { DataRecord } from "../../../src/crud/state.js";
import { DisplayElement, TestApp, TestDisplay } from "../../helpers/testApp.js";

export function testCrudApp(context: Context<TestApp>): Context<TestCrudApp> {
  return {
    init: () => new TestCrudApp(context.init() as TestApp)
  }
}

export class TestCrudApp {
  constructor(private testApp: TestApp) { }

  async renderAppWithRecords(records: Array<DataRecord>) {
    await this.testApp.renderApp("crud")
    await this.testApp.page?.evaluate((records) => {
      window.startApp(records)
    }, records)
  }

  get display(): CrudDisplay {
    return new CrudDisplay(this.testApp.display)
  }
}

export class CrudDisplay {
  constructor(private display: TestDisplay) { }

  get firstNameInput(): DisplayElement {
    return this.display.selectElement("[data-first-name-input]")
  } 
  
  get lastNameInput(): DisplayElement {
    return this.display.selectElement("[data-last-name-input]")
  }

  get filterInput(): DisplayElement {
    return this.display.selectElement("[data-filter-input]")
  }

  get createButton(): DisplayElement {
    return this.display.selectElement("[data-action='create']")
  }

  get updateButton(): DisplayElement {
    return this.display.selectElement("[data-action='update']")
  }

  get deleteButton(): DisplayElement {
    return this.display.selectElement("[data-action='delete']")
  }

  get recordsList(): DisplayElement {
    return this.display.selectElement("[data-records]")
  }
}