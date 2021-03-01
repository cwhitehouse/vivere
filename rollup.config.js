import resolve from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"

import { version } from "./package.json"
const year = new Date().getFullYear()
const banner = `/*\nvivere ${version}\nCopyright © ${year} Tiniest Fox, LLC\n */`

export default [
  {
    input: "src/vivere.ts",
    output: [
      {
        name: "vivere",
        file: "dist/vivere.es5-umd.js",
        format: "umd",
        sourcemap: true,
        banner
      }
    ],
    plugins: [
      resolve(),
      typescript({
        target: "es5",
        downlevelIteration: true,
      }),
    ],
    watch: {
      include: "src/**"
    }
  },
  {
    input: "src/vivere.ts",
    output: [
      {
        name: "vivere",
        file: "dist/vivere.es2017-umd.js",
        format: "umd",
        sourcemap: true,
        banner
      },
      {
        file: "dist/vivere.es2017-esm.js",
        format: "es",
        sourcemap: true,
        banner
      }
    ],
    plugins: [
      resolve(),
      typescript(),
    ],
    watch: {
      include: "src/**"
    }
  },
  {
    input: "examples/main.ts",
    output: [
      {
        file: "tmp/main.js",
        format: "es",
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      typescript(),
    ],
    watch: {
      include: [
        "examples/**/*.js",
        "examples/**/*.ts",
        "dist/**/*.js",
        "src/**/*.ts",
      ]
    }
  },
]
