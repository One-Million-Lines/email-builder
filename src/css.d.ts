// Declare bare CSS side-effect imports so TypeScript 6+ does not emit
// TS2882 ("Cannot find module or type declarations for side-effect import").
// Vite handles these at build time; this file satisfies the type checker.
declare module "*.css" {}
