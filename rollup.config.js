import esbuild from "rollup-plugin-esbuild";
import terser from "@rollup/plugin-terser";

const bundle = (config) => ({
  ...config,
  input: "src/preferences.ts",
  external: (id) => !/^[./]/.test(id),
});

const nth_identifier = (() => {
  const base54 = {
    chars: "jmsprefdghiklnoqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$_".split(""),
    get: function (num) {
      var ret = "",
        base = 52;
      num++;
      do {
        num--;
        ret += this.chars[num % base];
        num = Math.floor(num / base);
        base = 64
      } while (num > 0);

      return ret;
    },
  };

  return base54;
})();

export default [
  bundle({
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
        plugins: [
          terser({
            mangle: {
              nth_identifier,
            },
          }),
        ],
      },
    ],
  }),
];
