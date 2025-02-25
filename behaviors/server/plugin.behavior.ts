import { behavior, effect, example, fact, step } from "best-behavior";
import { testablePluginContext } from "./helpers/testPluginContext";
import { expect, is, objectOfType, rejectsWith, satisfying } from "great-expectations";

export default behavior("vite plugin", [

  example(testablePluginContext)
    .description("transforming some file other than the asset manifest")
    .script({
      perform: [
        step("transform some random file", async (context) => {
          await context.transformFile("/some/other/file.ts")
        })
      ],
      observe: [
        effect("the transform returns undefined", async (context) => {
          expect(context.transformResults, is(undefined))
        })
      ]
    }),

  example(testablePluginContext)
    .description("when serving files")
    .script({
      suppose: [
        fact("the file is served by vite", (context) => {
          context.withConfig({
            root: "/project/root/",
            command: "serve",
            environments: {
              client: {
                build: {
                  outDir: "dist",
                  manifest: true
                }
              }
            }
          })
        })
      ],
      perform: [
        step("transform the asset manifest", async (context) => {
          await context.transformFile("/my/path/server/assetManifest.ts")
        })
      ],
      observe: [
        effect("the transform returns undefined", async (context) => {
          expect(context.transformResults, is(undefined))
        })
      ]
    }),

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
        effect("an error is throw when try to transform the asset manifest module", async (context) => {
          await expect(context.transformFile("/my/path/to/server/assetManifest.ts"), rejectsWith(satisfying([
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
        step("transform the asset manifest module", async (context) => {
          await context.transformFile("/my/path/to/server/assetManifest.ts")
        })
      ],
      observe: [
        effect("the transformed code contains the manifest file contents", (context) => {
          expect(context.transformResults?.code, is(`export const manifest = { data: "blah" };`))
        })
      ]
    }),

  example(testablePluginContext)
    .description("transforming already transpiled asset manifest module")
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
        step("transform the asset manifest module", async (context) => {
          await context.transformFile("/my/node_modules/spheres/dist/server/assetManifest.js")
        })
      ],
      observe: [
        effect("the transformed code contains the manifest file contents", (context) => {
          expect(context.transformResults?.code, is(`export const manifest = { data: "blah" };`))
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
        step("transform the asset manifest module", async (context) => {
          await context.transformFile("/my/path/to/server/assetManifest.js")
        })
      ],
      observe: [
        effect("the transformed code contains the manifest file contents", (context) => {
          expect(context.transformResults?.code, is(`export const manifest = { data: "fun" };`))
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
        effect("an error is thrown when try to transform the asset manifest module", async (context) => {
          await expect(context.transformFile("/my/path/to/server/assetManifest.js"), rejectsWith(satisfying([
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
        effect("an error is thrown when try to transform the asset manifest module", async (context) => {
          await expect(context.transformFile("/my/path/to/server/assetManifest.js"), rejectsWith(satisfying([
            objectOfType(Error)
          ])))
        })
      ]
    })

])