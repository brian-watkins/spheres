import { behavior, effect, example, fact, step } from "best-behavior"
import { testableViteBuildContext } from "./helpers/testableViteBuildContext"
import { expect, is, satisfying, stringContaining, stringMatching } from "great-expectations"
import { testableStringRendererContext } from "./helpers/testableStringRendererContext"
import { useModule } from "best-behavior/transpiler"
import { ssrTestAppContext } from "./helpers/testSSRServer"
import { container } from "@store/index"

export default behavior("rendering html page from transpiled server renderer", [

  example(testableViteBuildContext)
    .description("explicit stylesheet and script imports")
    .script({
      suppose: [
        fact("the server renderer is built with the spheres vite plugin", async (context) => {
          await context.buildWithPlugin("./behaviors/server/fixtures/ssrApp/plugin", {
            server: {
              entries: {
                renderer: "./behaviors/server/fixtures/ssrApp/plugin/renderer.ts"
              },
              build: {
                target: "esnext"
              }
            },
            client: {
              entries: {
                client: "./behaviors/server/fixtures/ssrApp/plugin/index.ts",
                tracing: "./behaviors/server/fixtures/ssrApp/plugin/tracing.ts",
                another: "./behaviors/server/fixtures/ssrApp/plugin/anotherPage.ts",
                styles: "./behaviors/server/fixtures/ssrApp/plugin/styles.css",
                tracingStyles: "./behaviors/server/fixtures/ssrApp/plugin/tracing.css"
              },
              build: {
                target: "esnext"
              }
            }
          })
        }),
      ],
      perform: [
        step("render the html", async (context) => {
          await context.render(async () => {
            const { renderHTML } = await useModule("./behaviors/server/fixtures/ssrApp/plugin/dist/renderer.js")
            return renderHTML()
          })
        })
      ],
      observe: [
        effect("the head does not contain the vite client import", async (context) => {
          expect(context.getRenderedHTML().includes(`src="/@vite/client"`), is(false))
        }),
        effect("the script import references the transpiled js only once", async (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<script type="module" async src="\/assets\/client-[^"]+\.js"><\/script>/g, { times: 1 })
          ))
        }),
        effect("the script tag for other transpiled js is included", async (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<link rel="modulepreload" href="\/assets\/activate-.+\.js">/)
          ))
        }),
        effect("the stylesheet import references the transpiled css", async (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<link rel="stylesheet" href="\/assets\/styles-.+\.css">/)
          ))
        }),
        effect("the link to styles referenced in the js is included", async (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<link rel="stylesheet" href="\/assets\/client-.+\.css">/)
          ))
        }),
        effect("the script tag with a GetState function for src points to the compiled js", async (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<script type="module" src="\/assets\/tracing-.+\.js"><\/script>/)
          ))
        }),
        effect("the link tag with a GetState href function points to the compiled css", async (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<link rel="stylesheet" href="\/assets\/tracingStyles-.+\.css">/)
          ))
        }),
        effect("link for css imported by an extra script is included", async (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<link rel="stylesheet" href="\/assets\/activate-.+\.css">/)
          ))
        }),
        effect("link for dynamic script import is included", async (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<link rel="modulepreload" href="\/assets\/someView-.+\.js">/)
          ))
        }),
        effect("link for dynamic script import from extra script is included", async (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<link rel="modulepreload" href="\/assets\/dynamicView-.+\.js">/)
          ))
        })
      ]
    }),

  example(ssrTestAppContext(server => server.useSpheresPlugin()))
    .description("serve view with spheres plugin")
    .script({
      suppose: [
        fact("a view is specified to be rendered", (context) => {
          context.server.setSSRView("./behaviors/server/fixtures/ssrApp/page/renderer.ts")
        })
      ],
      perform: [
        step("the view is rendered", async (context) => {
          await context.server.renderPage("/app")
        })
      ],
      observe: [
        effect("the rendered view contains the vite client", (context) => {
          expect(context.server.renderedHTML, is(
            stringMatching(/<script type="module" src="\/@vite\/client"><\/script>/))
          )
        }),
        effect("the rendered view does not transform the script imports", (context) => {
          expect(context.server.renderedHTML, is(
            stringMatching(/<script type="module" async src="\/src\/index.ts"><\/script><\/body>/))
          )
        })
      ]
    }),

  example(testableViteBuildContext)
    .description("build the render module")
    .script({
      suppose: [
        fact("the server renderer is built with the spheres vite plugin", async (context) => {
          await context
            .setBase("/awesome")
            .buildWithPlugin("./behaviors/server/fixtures/ssrApp/page", {
              server: {
                entries: {
                  renderer: "./behaviors/server/fixtures/ssrApp/page/renderer.ts"
                }
              },
              client: {
                entries: {
                  activate: "./behaviors/server/fixtures/ssrApp/page/src/index.ts",
                }
              }
            })
        }),
      ],
      perform: [
        step("render the html", async (context) => {
          await context.render(async () => {
            const renderer = await useModule("./behaviors/server/fixtures/ssrApp/page/dist/renderer.js")
            return renderer.render()
          })
        })
      ],
      observe: [
        effect("the head does not contain the vite client import", (context) => {
          expect(context.getRenderedHTML(), is(stringContaining(`src="/@vite/client"`, { times: 0 })))
        }),
        effect("the script import references the transpiled js", (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<script type="module" async src="\/awesome\/assets\/activate-.+\.js"><\/script>/)
          ))
        }),
        effect("the non-transformed script is included", (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<script type="module" src="https:\/\/my-other-server\/js\/someScript.js"><\/script>/)
          ))
        }),
        effect("a non-transformed stateful script is included", (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<script type="module" src="https:\/\/some-resource\.com\/resource"><\/script>/)
          ))
        }),
        effect("the script contains the initial state of the store", (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<script type="application\/json" data-spheres-store="_spheres_store_data_">/)
          ))
        })
      ]
    }),

  example(testableViteBuildContext)
    .description("build the render module for streaming zones")
    .script({
      suppose: [
        fact("the renderer is built with the spheres vite plugin", async (context) => {
          await context
            .setBase("/fun")
            .buildWithPlugin("./behaviors/server/fixtures/ssrApp/streamingZones", {
              server: {
                entries: {
                  server: "./behaviors/server/fixtures/ssrApp/streamingZones/server.ts"
                }
              },
              client: {
                entries: {
                  activateOne: "./behaviors/server/fixtures/ssrApp/streamingZones/activateOne.ts",
                  activateTwo: "./behaviors/server/fixtures/ssrApp/streamingZones/activateTwo.ts"
                }
              }
            })
        }),
      ],
      perform: [
        step("render the html", async (context) => {
          await context.render(async () => {
            const serverModule = await useModule("./behaviors/server/fixtures/ssrApp/streamingZones/dist/server.js")
            const { stream } = serverModule.default()

            let html = ""
            for await (const chunk of stream) {
              html += chunk
            }

            return html
          })
        })
      ],
      observe: [
        effect("the head does not contain the vite client import", async (context) => {
          expect(context.getRenderedHTML(), is(stringContaining(`src="/@vite/client"`, { times: 0 })))
        }),
        effect("the script import references the transpiled js", async (context) => {
          expect(context.getRenderedHTML(), is(
            satisfying([
              stringMatching(/<script type="module" async src="\/fun\/assets\/activateOne-.+\.js"><\/script>/),
              stringMatching(/<script type="module" async src="\/fun\/assets\/activateTwo-.+\.js"><\/script>/),
              stringMatching(/<link rel="modulepreload" href="\/fun\/assets\/counter-.+\.js">/),
            ])
          ))
        }),
      ]
    }),

  example(testableStringRendererContext)
    .description("manifest with extra scripts in extra scripts")
    .script({
      suppose: [
        fact("there is a manifest with extra scripts in extra scripts", (context) => {
          context.useManifest({
            "_index-CmRxQ4Kg.js": {
              "file": "assets/index-CmRxQ4Kg.js",
              "name": "index"
            },
            "_another-888888.js": {
              "file": "assets/another-888888.js",
              "name": "index"
            },
            "_pageHeader-CMFcDjBz.js": {
              "file": "assets/pageHeader-CMFcDjBz.js",
              "name": "pageHeader",
              "imports": [
                "_index-CmRxQ4Kg.js",
                "_another-888888.js"
              ]
            },
            "my-script.ts": {
              "file": "assets/backlog-LmEve9Li.js",
              "name": "backlog",
              "src": "my-script.ts",
              "isEntry": true,
              "imports": [
                "_pageHeader-CMFcDjBz.js",
                "_index-CmRxQ4Kg.js",
              ]
            }
          })
        })
      ],
      perform: [
        step("render a view based on the manifest", (context) => {
          context.renderView((root) => {
            root.html(el => {
              el.children
                .head(el => {
                  el.children
                    .script(el => {
                      el.config
                        .type("module")
                        .src("my-script.ts")
                    })
                })
            })
          })
        })
      ],
      observe: [
        effect("the link tag for the extra script referenced by an extra script is included in the html", (context) => {
          expect(context.getHTML(), is(
            stringMatching(/<link rel="modulepreload" href="\/assets\/pageHeader-.+\.js">/)
          ))
          expect(context.getHTML(), is(
            stringMatching(/<link rel="modulepreload" href="\/assets\/another-\w+\.js">/)
          ))
        }),
        effect("the link tag for the extra script referenced twice is included only once", (context) => {
          expect(context.getHTML(), is(
            stringMatching(/<link rel="modulepreload" href="\/assets\/index-\w+\.js">/g, { times: 1 })
          ))
        })
      ]
    }),

  example(testableStringRendererContext)
    .description("script referenced multiple times when using stateful src")
    .script({
      suppose: [
        fact("there is a manifest with extra scripts in extra scripts", (context) => {
          context.useManifest({
            "_index-CmRxQ4Kg.js": {
              "file": "assets/index-CmRxQ4Kg.js",
              "name": "index"
            },
            "_another-888888.js": {
              "file": "assets/another-888888.js",
              "name": "index"
            },
            "_pageHeader-CMFcDjBz.js": {
              "file": "assets/pageHeader-CMFcDjBz.js",
              "name": "pageHeader",
              "imports": [
                "_index-CmRxQ4Kg.js",
                "_another-888888.js"
              ]
            },
            "my-script.ts": {
              "file": "assets/backlog-LmEve9Li.js",
              "name": "backlog",
              "src": "my-script.ts",
              "isEntry": true,
              "imports": [
                "_pageHeader-CMFcDjBz.js",
                "_index-CmRxQ4Kg.js",
              ]
            }
          })
        })
      ],
      perform: [
        step("render a view based on the manifest", (context) => {
          const scriptToken = container({ initialValue: "my-script.ts" })

          context.renderView((root) => {
            root.html(el => {
              el.children
                .head(el => {
                  el.children
                    .script(el => {
                      el.config
                        .type("module")
                        .src(get => get(scriptToken))
                    })
                })
            })
          })
        })
      ],
      observe: [
        effect("the link tag for the extra script referenced by an extra script is included in the html", (context) => {
          expect(context.getHTML(), is(
            stringMatching(/<link rel="modulepreload" href="\/assets\/pageHeader-.+\.js">/)
          ))
          expect(context.getHTML(), is(
            stringMatching(/<link rel="modulepreload" href="\/assets\/another-\w+\.js">/)
          ))
        }),
        effect("the link tag for the extra script referenced twice is included only once", (context) => {
          expect(context.getHTML(), is(
            stringMatching(/<link rel="modulepreload" href="\/assets\/index-\w+\.js">/g, { times: 1 })
          ))
        })
      ]
    }),

  example(testableStringRendererContext)
    .description("view with absolute paths to assets")
    .script({
      suppose: [
        fact("there is a manifest with extra scripts in extra scripts", (context) => {
          context.useManifest({
            "_index-CmRxQ4Kg.js": {
              "file": "assets/index-CmRxQ4Kg.js",
              "name": "index"
            },
            "_pageHeader-CMFcDjBz.js": {
              "file": "assets/pageHeader-CMFcDjBz.js",
              "name": "pageHeader",
              "imports": [
                "_index-CmRxQ4Kg.js",
                "_another-888888.js"
              ]
            },
            "dashboard/src/index.ts": {
              "file": "assets/dashboard-CsRjAryI.js",
              "name": "dashboard",
              "src": "dashboard/src/index.ts",
              "isEntry": true,
              "imports": [
                "_pageHeader-CMFcDjBz.js",
                "_index-CmRxQ4Kg.js"
              ]
            }
          })
        })
      ],
      perform: [
        step("render a view based on the manifest", (context) => {
          context.renderView((root) => {
            root.html(el => {
              el.children
                .head(el => {
                  el.children
                    .script(el => {
                      el.config
                        .type("module")
                        .src("/dashboard/src/index.ts")
                    })
                })
            })
          })
        })
      ],
      observe: [
        effect("the script tag imports the transpiled script", (context) => {
          expect(context.getHTML(), is(
            stringMatching(/<script type="module" src="\/assets\/dashboard-CsRjAryI.js"><\/script>/)
          ))
        })
      ]
    })

])