import { Sparky, FuseBox, UglifyJSPlugin, TypeScriptHelpers, CSSPlugin, EnvPlugin } from 'fuse-box';
import { join, relative } from 'path';
import * as express from 'express';
const dummy = new FuseBox().producer;
let producer:  typeof dummy;
let production = false;

FuseBox.init().producer

Sparky.task('build', ['prepare'], async () => {
  const fuse = FuseBox.init({
    homeDir: 'src',
    output: 'dist/public/$name.js',
    hash: production,
    cache: !production,
    plugins: [
      TypeScriptHelpers(),
      EnvPlugin({ NODE_ENV: production ? 'production' : 'development' }),
      CSSPlugin(),
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
        res.sendFile(join(dist, 'index.html'));
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
Sparky.task('default', ['clean', 'build', 'make-html'], () => {});

// clean all
Sparky.task('clean', () => Sparky.src('dist/*').clean('dist/'));

// copy and replace HTML
Sparky.task('make-html', () => {
  return Sparky.src('src/index.html')
    .file('*', (file: any) => {
      const vendor = producer.bundles.get('vendor');
      const browser = producer.bundles.get('browser');
      // get generated bundle names
      file.template({
        vendor: relative('dist/public', vendor!.process.filePath),
        browser: relative('dist/public', browser!.process.filePath),
      });
    })
    .dest('dist/$name');
});

Sparky.task('set-production-env', () => production = true);
Sparky.task('dist', ['clean', 'set-production-env', 'build', 'make-html'], () => {});
