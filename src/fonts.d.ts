// Fontsource subsets are imported for their CSS side effects (e.g.
// "@fontsource-variable/jost/wght"). TypeScript 6 checks side-effect imports,
// and these extensionless subpaths don't match the "*.css" module type.
declare module "@fontsource/*";
declare module "@fontsource-variable/*";
