import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const customTailwindPlugin = {
  rules: {
    "prefer-utility": {
      meta: {
        type: "suggestion",
        fixable: "code",
      },
      create(context) {
        return {
          JSXAttribute(node) {
            if (
              node.name.name === "className" &&
              node.value &&
              node.value.type === "Literal"
            ) {
              const value = node.value.value;
              const regex =
                /(h|w|gap|p|m|px|py|pl|pr|pt|pb|mx|my|ml|mr|mt|mb|min-w|min-h|max-w|max-h)-\[(\d+)px\]/g;
              if (regex.test(value)) {
                context.report({
                  node,
                  message:
                    "Use Tailwind utility class instead of arbitrary pixel value.",
                  fix(fixer) {
                    const newValue = value.replace(regex, (match, prefix, p1) => {
                      const px = parseInt(p1);
                      if (px % 4 === 0) {
                        return `${prefix}-${px / 4}`;
                      }
                      return match;
                    });
                    if (newValue !== value) {
                      return fixer.replaceText(node.value, `"${newValue}"`);
                    }
                  },
                });
              }
            }
          },
        };
      },
    },
  },
};

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      customTailwind: customTailwindPlugin,
    },
    rules: {
      "customTailwind/prefer-utility": "warn",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
