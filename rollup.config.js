import resolve from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"
import dts from "rollup-plugin-dts"

import { version } from "./package.json"
const year = new Date().getFullYear()
const banner = `/*\nvivere ${version}\nCopyright © ${year} Tiniest Fox, LLC\n */`

export default [
  {
    input: "src/vivere.ts",
    output: [
      {
        name: "vivere",
        file: "dist/vivere.es6-umd.js",
        format: "umd",
        sourcemap: true,
        banner
      },
      {
        file: "dist/vivere.es6-esm.js",
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
    input: "dist/types/src/vivere.d.ts",
    output: [
      {
        file: "dist/types/vivere.d.ts",
        format: "es",
      },
    ],
    plugins: [
      dts(),
    ],
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
