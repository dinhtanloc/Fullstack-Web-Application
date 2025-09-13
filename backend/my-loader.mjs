import generateAliasesResolver from 'esm-module-alias';

const aliases = {
  "@db": "db",
  "@config": "db",
  "@graphql": "graphql",
  "@utils": "utils",
  "@middleware": "middleware",
  "@routes": "routes",
  "@models": "db/models",
  "@controllers": "controllers"
};

export const resolve = generateAliasesResolver(aliases);
