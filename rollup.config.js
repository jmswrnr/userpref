import esbuild from "rollup-plugin-esbuild";
import terser from "@rollup/plugin-terser";

const nth_identifier = (() => {
  const base54 = {
    chars:
      "jmsprefdghiklnoqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$_".split(
        ""
      ),
    get: function (num) {
      var ret = "",
        base = 52;
      num++;
      do {
        num--;
        ret += this.chars[num % base];
        num = Math.floor(num / base);
        base = 64;
      } while (num > 0);

      return ret;
    },
  };

  return base54;
})();

const terserPlugin = terser({
  mangle: {
    nth_identifier,
  },
});

export default [
  {
    input: "src/preferences.ts",
    external: (id) => !/^[./]/.test(id),
    plugins: [
      esbuild({
        minify: true,
        sourceMap: false,
      }),
    ],
    output: [
      {
        file: `dist/preferences.js`,
        format: "cjs",
        sourcemap: false,
        strict: false,
        plugins: [terserPlugin],
      },
      {
        file: "dist/index.js",
        format: "esm",
        sourcemap: false,
        strict: false,
        plugins: [
          terserPlugin,
          {
            name: "wrap-in-string",
            generateBundle(options, bundle) {
              for (const [fileName, chunk] of Object.entries(bundle)) {
                if (chunk.type === "chunk") {
                  chunk.code = `export const jmspref = '${chunk.code.replace(
                    /\n/g,
                    ""
                  )}';`;
                }
              }
            },
          },
        ],
      },
    ],
  },
];
