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

The server entrypoint should ultimately do server-side rendering
at the very least. To accomplish this with spheres, it should somehow
call the `renderToString` function with an `HTMLView` to render.
This can be a fragment of a view that is later inserted into a
template. However, we really want this view to describe the
entire HTML page for maximum flexibility.

Client entrypoints should do anything necessary to activate the
server-rendered view, typically using the `activateView` function.
With Spheres, there is no need to activate the entire view -- if,
for example, the entire HTML page were defined as a HTMLView that
was rendered to a string. Selective activation is enabled by
providing the container element in the DOM and the view function
to activate there.

The plugin will take this configuration -- the server and client
entrypoints -- and build an application. To do this, it will
leverage the asset manifest produced by Vite to replace references
from server-rendered pages to client entrypoints with references
to the transpiled assets to be served to the client.

In addition, if the plugin is *not* being used then things
should work as expected, just without any transformation of
references.

There are several ways we considered accomplishing this:

#### Transform a spheres module to provide the asset manifest

We had our code reference a module that by default just exported
`undefined`. But when the plugin was invoked, it would transform
the file to have it export the asset manifest. This worked great
but only in developmenbt. What we didn't realize is that vite would
not run the spheres package through the plugin/transformation pipeline
once it was just packaged as a node module. By default all these
are externalized by default when processing a server-side module
(which is where the `renderToString` function etc would be referenced.)
So, it just didn't work.

#### Expose a virtual module that provides the asset manifest

The idea here is that with a reference to a virtual module, the vite
plugin can provide the contents at build/serve time. So, we exposed
a virtual module that the plugin transformed into the asset manifest
and then the user's code would take this and pass it to the
`renderToString` function. This worked, but the problem is that
virtual modules do not seem to work well with Typescript. We couldn't
figure out a good way to provide types for the file. And when we were
able to, it required the user to add a typescript `///` reference at
the top of the file pointing to the type declaration. So, while this
approach works, it really required two extra manual steps -- importing
a virtual module and adding the reference to the type declaration.
This is just too much setup to ask; it's too easy to forget and there's
no feedback by design (so that spheres can be used without the plugin).

#### Inject a virtual module that loads the asset manifest

We know that when someone imports `renderToString` they must do so
by importing from `spheres/server`. So, the plugin looks for that kind
of import and then replaces it with an import to a virtual module.
That virtual module exposes a `renderToString` function and in addition
imports the asset manifest via another virtual module and passes it to
the real `renderToString` function via the exposed function. This
actually seems to work well, and does not require the user to do anything
different with their code -- just use the spheres plugin and it will
do extra stuff; if you don't use it, it doesn't. And since all the
references to virtual modules occur in transpiled javascript, there's
no need to worry about providing proper type declarations.

So, we decided to go with this approach. There are some caveats though:
- The plugin may need to be smarter about what it replaces ... right now
it just looks for the string `spheres/server` and replaces that. It's
unlikely but still possible that they could show up in some other way
and then things would just get messed up.
- If we ever expose other functions from the `spheres/server` module,
then the virtualized version of this module would need to get more
complicated. In that case, though, it could probably just export the
non-virtualized functions ...


### When Serving the App

In addition to facilitating the build process, the plugin also
helps when serving the app for development purposes, by
injecting the vite client into the
`HEAD` element of any HTML page rendered using the `renderToString`
function. The vite client enable HMR and other functionality.
By having the plugin do this transformation, we avoid the need to
run the `transformIndexHTML` function at all. There may be caveats
to this but it seems to work.

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

