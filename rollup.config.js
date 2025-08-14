import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'es',
    sourcemap: !isProduction,
    banner: '#!/usr/bin/env node',
  },
  external: [
    // Node.js 内置模块
    'http',
    'https',
    'fs',
    'path',
    'url',
    'util',
    'events',
    'stream',
    'buffer',
    'crypto',
    'os',
    'net',
    'tls',
    'zlib',
    'querystring',

    // 应保持外部的依赖项
    'socket.io',
    'cors',
    'express',
  ],
  plugins: [
    json(),
    nodeResolve({
      preferBuiltins: true,
      exportConditions: ['node'],
    }),
    commonjs({
      ignoreDynamicRequires: true,
    }),
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: !isProduction,
      inlineSources: !isProduction,
      declaration: true,
      declarationDir: 'dist/types',
      rootDir: 'src',
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        'node_modules/**',
      ],
    }),
  ],
  onwarn(warning, warn) {
    // 抑制某些警告
    if (warning.code === 'THIS_IS_UNDEFINED') return;
    if (warning.code === 'MISSING_EXPORT') return;

    // 其他情况使用默认处理
    warn(warning);
  },
});
