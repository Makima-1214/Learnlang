/**
 * Babel configuration for Jest transformations
 * Allows Jest to understand ES modules and JSX
 */

module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    ["@babel/preset-react", { runtime: "automatic" }],
  ],
};
