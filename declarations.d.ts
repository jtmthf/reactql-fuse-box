interface Window {
  __STATE__: any;
  __REDUX_DEVTOOLS_EXTENSION__(): any;
}

declare module '*.svg' {
  const _: string;
  export default _;
}

declare module '*.css' {
  const _: any;
  export default _;
}

declare module '*.less' {
  const _: any;
  export default _;
}

declare module '*.scss' {
  const _: any;
  export default _;
}

declare module 'postcss-nested' {
  const _: (_?: any) => () => any;
  export = _;
}

declare module 'postcss-cssnext' {
  const _: (_?: any) => () => any;
  export = _;
}

declare module 'cssnano' {
  const _: (_?: any) => () => any;
  export = _;
}
