#!/usr/bin/env node
//
// build-three.js — bundles the slice of three.js the game actually uses into
// one classic <script> file at vendor/three.min.js.
//
//     npm i --no-save three@0.185.1 esbuild
//     node tools/build-three.js
//
// The output is committed, so nobody needs node to play or to serve the game.
//
// WHY A BUNDLE AND NOT THE SHIPPED FILES
// three has been ESM-only since r150 — there is no UMD build any more. Loading
// it with <script type="module"> would work on GitHub Pages but NOT from
// file://, because module scripts are fetched under CORS and file:// is always
// a null origin. Opening index.html straight off the disk is how this game gets
// played on a machine with no server, so that had to keep working.
//
// Bundling to an IIFE also lets esbuild tree-shake: the entry below names every
// export the game touches, and the rest of the library never ships.

const esbuild = require('esbuild');
const path    = require('path');
const fs      = require('fs');

const ROOT = path.join(__dirname, '..');
const OUT  = path.join(ROOT, 'vendor', 'three.min.js');

// Exactly what js/scene3d.js reaches for. Adding a class to the scene means
// adding it here and re-running.
const ENTRY = `
export {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, Points,
  BoxGeometry, CylinderGeometry, ConeGeometry, SphereGeometry,
  PlaneGeometry, CircleGeometry, CapsuleGeometry, BufferGeometry,
  MeshStandardMaterial, MeshBasicMaterial, PointsMaterial,
  Float32BufferAttribute, CanvasTexture, RepeatWrapping, SRGBColorSpace,
  DirectionalLight, HemisphereLight, PointLight,
  Color, Fog, AdditiveBlending,
} from 'three';
`;

async function main() {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });

  const result = await esbuild.build({
    stdin: { contents: ENTRY, resolveDir: process.cwd(), loader: 'js' },
    bundle: true,
    minify: true,
    format: 'iife',
    globalName: 'THREE',
    target: ['es2019'],
    legalComments: 'inline',   // keep the MIT notice in the shipped file
    outfile: OUT,
  });

  if (result.errors.length) { console.error(result.errors); process.exit(1); }

  const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
  console.log(`vendor/three.min.js  ${kb} KB`);
}

main().catch(err => { console.error(err); process.exit(1); });
