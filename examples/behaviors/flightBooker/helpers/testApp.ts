import { Context } from "best-behavior";
import { TestApp, TestDisplay, testAppContext } from "../../helpers/testApp";
import { Dialog } from "playwright";

export const flightBookerApp: Context<FlightBookerTestApp> = {
  init: async () => {
    const testApp = await testAppContext.init()
    return new FlightBookerTestApp(testApp)
  },
  teardown: (context) => {
    context.teardown()
  }
}

class TestAlert {
  constructor(public readonly message: string) { }
}

export class FlightBookerTestApp {
  public lastAlert: TestAlert | undefined
  private dialogHandler = async (dialog: Dialog) => {
    this.lastAlert = new TestAlert(dialog.message())
    await dialog.dismiss()
  }

  constructor(private testApp: TestApp) { }

  async renderApp() {
    await this.testApp.renderApp("flightBooker")
    this.testApp.page.on("dialog", this.dialogHandler)
  }

  teardown() {
    this.testApp.page.removeListener("dialog", this.dialogHandler)
  }

  get display(): TestDisplay {
    return this.testApp.display
  }
}