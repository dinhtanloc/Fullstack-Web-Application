import { build } from 'esbuild';
import alias from 'esbuild-plugin-alias';

build({
  entryPoints: ['./index.js'], 
  bundle: true,
  platform: 'node',
  outfile: 'dist/index.js',
  plugins: [
    alias({
      '@config': './db',
      '@graphql': './graphql',
      '@utils': './utils',
      '@middleware': './middleware',
      '@routes': './routes',
      '@db': './db',
      '@controllers': './controllers'
    })
  ]
}).catch(() => process.exit(1));
