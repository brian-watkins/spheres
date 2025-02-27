import { behavior, effect, example, fact, step } from "best-behavior"
import { testableViteBuildContext } from "./helpers/testableViteBuildContext"
import { expect, is, stringMatching } from "great-expectations"
import { testableSSRBuilderContext } from "./helpers/testableSSRBuilderContext"
import { useModule } from "best-behavior/transpiler"
import { ssrTestAppContext } from "./helpers/testSSRServer"

export default behavior("rendering html page from transpiled server renderer", [

  example(testableViteBuildContext)
    .description("explicit stylesheet and script imports")
    .script({
      suppose: [
        fact("the server renderer is built with the spheres vite plugin", async (context) => {
          await context.buildWithPlugin("./behaviors/server/fixtures/ssrApp/plugin", {
            serverEntries: {
              renderer: "./behaviors/server/fixtures/ssrApp/plugin/renderer.ts"
            },
            clientEntries: {
              client: "./behaviors/server/fixtures/ssrApp/plugin/index.ts",
              tracing: "./behaviors/server/fixtures/ssrApp/plugin/tracing.ts",
              another: "./behaviors/server/fixtures/ssrApp/plugin/anotherPage.ts",
              styles: "./behaviors/server/fixtures/ssrApp/plugin/styles.css",
              tracingStyles: "./behaviors/server/fixtures/ssrApp/plugin/tracing.css"
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
        effect("the script import references the transpiled js", async (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<script type="module" src="assets\/client-.+\.js"><\/script>/)
          ))
        }),
        effect("the script tag for other transpiled js is included", async (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<link rel="modulepreload" href="assets\/helperView-.+\.js">/)
          ))
        }),
        effect("the stylesheet import references the transpiled css", async (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<link rel="stylesheet" href="assets\/styles-.+\.css">/)
          ))
        }),
        effect("the link to styles referenced in the js is included", async (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<link rel="stylesheet" href="assets\/client-.+\.css">/)
          ))
        }),
        effect("the script tag with a GetState function for src points to the compiled js", async (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<script type="module" src="assets\/tracing-.+\.js"><\/script>/)
          ))
        }),
        effect("the link tag with a GetState href function points to the compiled css", async (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<link rel="stylesheet" href="assets\/tracingStyles-.+\.css">/)
          ))
        }),
        effect("link for css imported by an extra script is included", async (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<link rel="stylesheet" href="assets\/helperView-.+\.css">/)
          ))
        }),
        effect("link for dynamic script import is included", async (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<link rel="modulepreload" href="assets\/someView-.+\.js">/)
          ))
        }),
        effect("link for dynamic script import from extra script is included", async (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<link rel="modulepreload" href="assets\/dynamicView-.+\.js">/)
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
          await context.server.renderPage("/index.html")
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
            stringMatching(/<script type="module" src="\/src\/index.ts"><\/script>/))
          )
        })
      ]
    }),

  example(testableViteBuildContext)
    .description("build the render module")
    .script({
      suppose: [
        fact("the server renderer is built with the spheres vite plugin", async (context) => {
          await context.buildWithPlugin("./behaviors/server/fixtures/ssrApp/page", {
            serverEntries: {
              renderer: "./behaviors/server/fixtures/ssrApp/page/renderer.ts"
            },
            clientEntries: {
              activate: "./behaviors/server/fixtures/ssrApp/page/src/index.ts"
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
        effect("the head does not contain the vite client import", async (context) => {
          expect(context.getRenderedHTML().includes(`src="/@vite/client"`), is(false))
        }),
        effect("the script import references the transpiled js", async (context) => {
          expect(context.getRenderedHTML(), is(
            stringMatching(/<script type="module" src="assets\/activate-.+\.js"><\/script>/)
          ))
        }),
      ]
    }),

  example(testableSSRBuilderContext)
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
            stringMatching(/<link rel="modulepreload" href="assets\/pageHeader-.+\.js">/)
          ))
          expect(context.getHTML(), is(
            stringMatching(/<link rel="modulepreload" href="assets\/another-\w+\.js">/)
          ))
        }),
        effect("the link tag for the extra script referenced twice is included only once", (context) => {
          expect(context.getHTML(), is(
            stringMatching(/<link rel="modulepreload" href="assets\/index-\w+\.js">/g, { times: 1 })
          ))
        })
      ]
    }),

  example(testableSSRBuilderContext)
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
            stringMatching(/<script type="module" src="assets\/dashboard-CsRjAryI.js"><\/script>/)
          ))
        })
      ]
    })

])