import {samplePage} from './sample-page.config.ts';

// MUI and the skin import React: preact/compat takes its place
export default {
  ...samplePage,
  resolve: {
    alias: {
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
      react: 'preact/compat'
    }
  }
};
