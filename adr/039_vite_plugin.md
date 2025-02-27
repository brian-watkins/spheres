# Vite Plugin

We will create a Vite plugin to simplify build and dev
configs. 

Spheres can be used to create a single-page app or a
server-side rendered multi-page app, or even a completely
pre-rendered app. While spheres itself doesn't necessarily
need any build step -- except to transpile typescript, and
even that might not be necessary in some environments, typically
one will want to use a build step to create assets that
are optimized for a production environment: minified, divided
up appropriately, etc. 

By itself, spheres should be compatible with any build tool.
However, because Vite is particularly excellent, we will
provide some tooling to optimize the build and development
experience when using Vite as a dev server and build tool.

There are several different cases we might consider: a SPA app,
a multi-page app with no SSR, a SPA app that involves SSR, a
MPA with SSR for each page, a fully pre-rendered app. We will
set aside the fully pre-rendered app for now. But in all the
other cases, we can simplify dev and build config for Vite by
providing a Vite plugin.

This plugin will do two main things:

### When Building the App

When building the app, the plugin will accept configuration to
specify the client and server entry points. The plugin will
then create two Vite 'environments' -- one for the client and
one for the server -- and it will build both of these environments.

In addition, the plugin will automatically leverage the
asset manifest produced by Vite to replace references from server-
rendered pages to client entrypoints with references to the
transpiled assets to be served to the client.

To accomplish this, we decided to have the Vite plugin
write the asset manifest into the server entrypoint so that
when the `renderToString` function stringifies a view that builds
an HTML page with script tags, the src attribute of these tags
will be replaced with the appropriate value for production. When
not using the Spheres plugin, this asset manifest value will be
undefined and the string renderer will simply print the unmodified
src attributes.

Client entrypoints should do anything necessary to activate the
server-rendered view, typically using the `activateView` function.
With Spheres, there is no need to activate the entire view -- if,
for example, the entire HTML page were defined as a HTMLView that
was rendered to a string. Selective activation is enabled by
providing the container element in the DOM and the view function
to activate there.

### When Serving the App

When serving the app, the vite client will be injected into the
`HEAD` element of any HTML page rendered using the `renderToString`
function. This avoids the need to run the `transformIndexHTML`
function at all. There may be caveats to this but it seems to work --
it's required mainly to enable hot-module reloading during dev.

Again, if the plugin is not used, the `HEAD` element will not
be changed at all.


## Scope of the Vite Plugin

Many frameworks like next.js and remix provide some functionality
for the frontend to communicate with the server in a way that
appears seamless ... via 'server actions' or something like that.

In extreme cases, this can mean that code that runs on the server
can be found in the same file as code that runs of the client.

To enable this functionality, I believe that these frameworks need
to do a lot of wild stuff via the bundler to produce appropriate
server-side bundles and client-side bundles, and probably inject
or otherwise transform some code to make things work.

While it does seem like a good idea to make communication from the
client to the server as seamless and easy as possible, we will
treat this as a concern separate from the spheres vite plugin.

Since spheres itself has no server component, and only exposes a
function to render a view to a string, spheres has nothing to say
about the technology used for the server or anything else. There
are many options to create a server in typescript and it's beyond
the scope of the Spheres project to make a decision there.

Furthermore, this means that Spheres is agnostic about how server-side
rendering should be implemented, beyond the fact that the
`renderToString` function will be used to generate HTML.

Any server framework should be able to provide its own mechanism,
therefore, for calling `renderToString` at the appropriate time and
doing anything else necessary to enable seamless communication
between the client and the server. If that framework needs extra
support from Vite during build or dev, then it should provide
its own plugin to allow that.

In the case where the server framework needs to do something
very complicated with its build process, it seems like the
spheres plugin could just be used to build a module on the server-side
that would be consumed by the server framework. In other
words, the server entrypoint provided to the spheres vite
plugin need not be a file that runs the server; it could also
be a file that simple exports a function to render a page of
HTML, which itself could be consumed by the server framework.

The scope of Spheres is rendering HTML based on state either
to the DOM or to a string. So, the scope of the spheres vite
plugin is just focused on rendering html so that it can be
served in dev mode or building (at least) the parts of an application
that generate HTML.

