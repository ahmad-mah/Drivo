import logicalToPhysical from "./plugins/postcss-logical-to-physical.mjs";

export default {
  plugins: [
    "@tailwindcss/postcss",
    logicalToPhysical,
  ],
};
