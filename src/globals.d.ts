declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
//
// declare module 'topojson-client' {
//   const classes: {
//     readonly feature: () => {
//       features: any;
//     };
//   };
//   export default classes;
// }
