import { Sparky, FuseBox, UglifyJSPlugin, TypeScriptHelpers, CSSPlugin, EnvPlugin, WebIndexPlugin, LESSPlugin, CSSResourcePlugin, CSSModules, PostCSS, SassPlugin, SVGPlugin } from 'fuse-box';
import { join } from 'path';
import * as express from 'express';

// PostCSS filters
import * as postcssNested from 'postcss-nested';

// CSSNext is our PostCSS plugin of choice, that will allow us to use 'future'
// stylesheet syntax like it's available today.
import * as cssnext from 'postcss-cssnext';

// CSSNano will optimise our stylesheet code
import * as cssnano from 'cssnano';

const dummy = new FuseBox().producer;
let producer:  typeof dummy;
let production = false;

FuseBox.init().producer

Sparky.task('build', ['prepare'], async () => {

  const cssPlugins = [
    PostCSS([
        postcssNested(),
        cssnext(),
        cssnano({
          // Disable autoprefixer-- CSSNext already used it
          autoprefixer: false,
        }),
      ],
    ),
    CSSResourcePlugin({
      dist: 'dist/public/assets/img',
    }),
    CSSPlugin({
      group: production ? 'all.css' : undefined,
      outFile: production ? join(__dirname, 'dist/public/assets/css/all.css') : undefined,
    }),
  ];
  
  const fuse = FuseBox.init({
    homeDir: 'src',
    output: 'dist/public/$name.js',
    hash: production,
    cache: !production,
    debug: true,
    log: true,
    plugins: [
      TypeScriptHelpers(),
      EnvPlugin({ NODE_ENV: production ? 'production' : 'development', SERVER: false }),
      ['.global.css', ...cssPlugins.slice(0, 2), CSSModules(), ...cssPlugins.slice(2)],
      ['.less', LESSPlugin(), ...cssPlugins.slice(0, 2), CSSModules(), ...cssPlugins.slice(2)],
      ['.scss', SassPlugin(), ...cssPlugins.slice(0, 2), CSSModules(), ...cssPlugins.slice(2)],
      ['.css', ...cssPlugins.slice(0, 2), CSSModules(), ...cssPlugins.slice(2)],
      SVGPlugin(),
      WebIndexPlugin({title: 'ReactQL', path: '/public', template: 'src/views/index.html'}),
      production && UglifyJSPlugin(),
    ]
  });

  if (!production) {
    // Configure development server
    fuse.dev({ root: false, port: 8080 }, server => {
      const dist = join(__dirname, 'dist');
      const app = server.httpServer.app as express.Application;
      app.use('/public/', express.static(join(dist, 'public')));
      app.get('*', (_, res) => {
        res.sendFile(join(dist, 'public', 'index.html'));
      });
    });
  }

  // extract dependencies automatically
  const vendor = fuse.bundle('vendor')
    .instructions('~ **/**.{ts,tsx} +tslib')
  if (!production) { vendor.hmr().watch(); }

  const browser = fuse.bundle('browser')
    .sourceMaps(true)
    .instructions('!> [entry/browser.tsx]');

  if (!production) { browser.hmr().watch(); }

  producer = await fuse.run();
});

// main task
Sparky.task('default', ['clean', 'build'], () => {});

// clean all
Sparky.task('clean', () => Sparky.src('dist/*').clean('dist/'));

Sparky.task('set-production-env', () => production = true);
Sparky.task('dist', ['clean', 'set-production-env', 'build'], () => {});
