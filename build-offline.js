/**
 * Builds offline DickKicker bundles (works from file:// — no server needed).
 * Run: node build-offline.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

const SOURCE_FILES = [
  'src/config/levels.js',
  'src/config/sprites.js',
  'src/utils/makePixelTexture.js',
  'src/audio/AudioEngine.js',
  'src/entities/FallObject.js',
  'src/entities/Player.js',
  'src/scenes/BootScene.js',
  'src/scenes/MenuScene.js',
  'src/scenes/GameScene.js',
  'src/scenes/GameOverScene.js',
];

function stripModules(code) {
  return code
    .replace(/^import .+;\s*$/gm, '')
    .replace(/^export default /gm, '')
    .replace(/^export function /gm, 'function ')
    .replace(/^export const /gm, 'const ')
    .replace(/^export let /gm, 'let ')
    .replace(/^export \{[^}]+\};?\s*$/gm, '');
}

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function buildGameBundle(footDataUrl, dickDataUrl) {
  const phaserGlobal = `const Phaser = window.Phaser;
if (!Phaser) {
  throw new Error('Phaser missing — open DickKicker-offline.html or use index-offline.html in this folder.');
}
`;

  const bootPatch = `
class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.image('foot-src', ${JSON.stringify(footDataUrl)});
    this.load.image('dick-src', ${JSON.stringify(dickDataUrl)});
  }

  create() {
    try {
      const foot = makePixelTexture(this, 'foot-src', 'foot', SOURCE_TARGETS.foot);
      const dick = makePixelTexture(this, 'dick-src', 'dick', SOURCE_TARGETS.dick);
      applySpriteMetrics({ foot, dick });
      this.textures.remove('foot-src');
      this.textures.remove('dick-src');
      this.scene.start('MenuScene');
    } catch (err) {
      console.error(err);
      const { width, height } = this.scale;
      this.add.text(width / 2, height / 2, 'LOAD ERROR\\n' + (err.message || err), {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#ffffff',
        align: 'center',
      }).setOrigin(0.5);
    }
  }
}
`;

  let bootIncluded = false;
  const parts = [phaserGlobal];

  for (const file of SOURCE_FILES) {
    if (file.endsWith('BootScene.js')) {
      parts.push(bootPatch);
      bootIncluded = true;
      continue;
    }
    parts.push(stripModules(read(file)));
  }

  if (!bootIncluded) {
    parts.push(bootPatch);
  }

  const main = stripModules(read('src/main.js'));
  parts.push(main);

  return `(function () {
'use strict';
${parts.join('\n\n')}
})();`;
}

function toDataUrl(filePath, mime) {
  const buf = fs.readFileSync(filePath);
  return `data:${mime};base64,${buf.toString('base64')}`;
}

function buildOfflineHtml(bundle, phaserJs, css) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="theme-color" content="#000000">
  <title>DickKicker (offline)</title>
  <style>${css}</style>
</head>
<body>
  <div id="game-container"></div>
  <div id="load-error" hidden></div>
  <div class="scanlines" aria-hidden="true"></div>
  <script>${phaserJs}<\/script>
  <script>${bundle}<\/script>
  <script>
    function showLoadError(message) {
      var box = document.getElementById('load-error');
      if (!box) return;
      box.hidden = false;
      box.textContent = 'Game failed to load: ' + message;
    }
    window.addEventListener('error', function (event) {
      showLoadError(event.message || 'unknown error');
    });
    window.addEventListener('unhandledrejection', function (event) {
      showLoadError(event.reason && event.reason.message ? event.reason.message : String(event.reason));
    });
  <\/script>
</body>
</html>`;
}

function buildFolderHtml(css) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="theme-color" content="#000000">
  <title>DickKicker (offline folder)</title>
  <link rel="stylesheet" href="styles.css">
  <style>
    body { font-family: Courier New, monospace; }
    ${css.includes('Press Start') ? '' : '* { font-family: "Courier New", monospace !important; }'}
  </style>
  <script src="lib/phaser.min.js"><\/script>
</head>
<body>
  <div id="game-container"></div>
  <div id="load-error" hidden></div>
  <div class="scanlines" aria-hidden="true"></div>
  <script src="game.bundle.js"><\/script>
  <script>
    function showLoadError(message) {
      var box = document.getElementById('load-error');
      if (!box) return;
      box.hidden = false;
      box.textContent = 'Game failed to load: ' + message;
    }
    window.addEventListener('error', function (event) {
      showLoadError(event.message || 'unknown error');
    });
    window.addEventListener('unhandledrejection', function (event) {
      showLoadError(event.reason && event.reason.message ? event.reason.message : String(event.reason));
    });
  <\/script>
</body>
</html>`;
}

// --- run ---
const footDataUrl = toDataUrl(path.join(ROOT, 'assets/foot.png'), 'image/png');
const dickDataUrl = toDataUrl(path.join(ROOT, 'assets/dick.jpg'), 'image/jpeg');
const css = read('styles.css').replace(/Press Start 2P/g, 'Courier New');
const phaserJs = read('lib/phaser.min.js');
const bundle = buildGameBundle(footDataUrl, dickDataUrl);

fs.writeFileSync(path.join(ROOT, 'game.bundle.js'), bundle);
fs.writeFileSync(path.join(ROOT, 'index-offline.html'), buildFolderHtml(css));

const singleHtml = buildOfflineHtml(bundle, phaserJs, css);
fs.writeFileSync(path.join(ROOT, 'DickKicker-offline.html'), singleHtml);

console.log('Built:');
console.log('  game.bundle.js');
console.log('  index-offline.html  (open this folder offline — double-click)');
console.log('  DickKicker-offline.html  (single shareable file — double-click)');
