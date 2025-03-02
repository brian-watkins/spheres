import { behavior, effect, example, fact, step } from "best-behavior";
import { testablePluginContext } from "./helpers/testPluginContext";
import { assignedWith, expect, is, objectOfType, rejectsWith, satisfying, stringContaining } from "great-expectations";

export default behavior("vite plugin", [

  example(testablePluginContext)
    .description("manifest config is set to false in resolved config")
    .script({
      suppose: [
        fact("the resolved config sets the manifest to false", (context) => {
          context.withConfig({
            command: "build",
            environments: {
              client: {
                build: {
                  manifest: false
                }
              }
            }
          })
        })
      ],
      observe: [
        effect("an error is throw when try to load the vite context", async (context) => {
          await expect(context.loadViteContext(), rejectsWith(satisfying([
            objectOfType(Error)
          ])))
        })
      ]
    }),

  example(testablePluginContext)
    .description("reading default manifest file")
    .script({
      suppose: [
        fact("the default manifest file contains some data", (context) => {
          context
            .withConfig({
              command: "build",
              root: "/project/root/",
              environments: {
                client: {
                  build: {
                    outDir: "dist",
                    manifest: true
                  }
                }
              }
            })
            .withFile("/project/root/dist/.vite/manifest.json", `{ data: "blah" }`)
        }),
      ],
      perform: [
        step("load the vite context", async (context) => {
          await context.loadViteContext()
        })
      ],
      observe: [
        effect("the loaded code contains the manifest file contents and the build command", (context) => {
          expect(context.viteContext, is(`export const context = { command: "build", base: "/", manifest: { data: "blah" } };`))
        })
      ]
    }),

  example(testablePluginContext)
    .description("reading specified manifest file")
    .script({
      suppose: [
        fact("the specified manifest file contains some data", (context) => {
          context
            .withConfig({
              command: "build",
              root: "/project/root/",
              environments: {
                client: {
                  build: {
                    manifest: "my-manifest.json",
                    outDir: "dist",
                  }
                }
              }
            })
            .withFile("/project/root/dist/my-manifest.json", `{ data: "fun" }`)
        }),
      ],
      perform: [
        step("load the vite context", async (context) => {
          await context.loadViteContext()
        })
      ],
      observe: [
        effect("the loaded code contains the manifest file contents", (context) => {
          expect(context.viteContext, is(assignedWith(stringContaining(`manifest: { data: "fun" }`))))
        })
      ]
    }),

  example(testablePluginContext)
    .description("when the base is set")
    .script({
      suppose: [
        fact("the default manifest file contains some data", (context) => {
          context
            .withConfig({
              command: "build",
              root: "/project/root/",
              base: "/cool",
              environments: {
                client: {
                  build: {
                    outDir: "dist",
                    manifest: true
                  }
                }
              }
            })
            .withFile("/project/root/dist/.vite/manifest.json", `{ data: "fun" }`)
        }),
      ],
      perform: [
        step("load the vite context", async (context) => {
          await context.loadViteContext()
        })
      ],
      observe: [
        effect("the loaded code contains the manifest file contents and the build command and the base", (context) => {
          expect(context.viteContext, is(`export const context = { command: "build", base: "/cool", manifest: { data: "fun" } };`))
        })
      ]
    }),

  example(testablePluginContext)
    .description("bad manifest file")
    .script({
      suppose: [
        fact("the specified manifest file is set to empty string", (context) => {
          context
            .withConfig({
              command: "build",
              root: "/project/root/",
              environments: {
                client: {
                  build: {
                    manifest: "",
                    outDir: "dist",
                  }
                }
              }
            })
            .withFile("/project/root/dist/my-manifest.json", `{ data: "fun" }`)
        }),
      ],
      observe: [
        effect("an error is thrown when try to load the vite context", async (context) => {
          await expect(context.loadViteContext(), rejectsWith(satisfying([
            objectOfType(Error)
          ])))
        })
      ]
    }),

  example(testablePluginContext)
    .description("manifest file not found")
    .script({
      suppose: [
        fact("the manifest file is not present", (context) => {
          context
            .withConfig({
              command: "build",
              root: "/project/root/",
              environments: {
                client: {
                  build: {
                    outDir: "dist",
                    manifest: true
                  }
                }
              }
            })
        }),
      ],
      observe: [
        effect("an error is thrown when try to load the vite context", async (context) => {
          await expect(context.loadViteContext(), rejectsWith(satisfying([
            objectOfType(Error)
          ])))
        })
      ]
    }),

  example(testablePluginContext)
    .description("serving files")
    .script({
      suppose: [
        fact("the config shows vite is serving files", (context) => {
          context
            .withConfig({
              command: "serve"
            })
        }),
      ],
      perform: [
        step("load the vite context", async (context) => {
          await context.loadViteContext()
        })
      ],
      observe: [
        effect("the context specifies the serve command and the manifest is undefined", (context) => {
          expect(context.viteContext, is(`export const context = { command: "serve", base: "/", manifest: undefined };`))
        })
      ]
    })

])