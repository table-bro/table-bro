// The stylelint settings of Table, Bro for the SCSS of the packages, with the order of the properties by the Yandex
// preset of CSSComb. `npm run lint:styles` checks them, `npm run lint:styles:fix` fixes them; the copies of the shared
// styles that the build of each skin writes are not sources and are not checked.

// Based on CSSComb's Yandex preset: positioning, layout, box model,
// typography, visual styles, animation, and misc interaction properties.
const CSSCOMB_YANDEX_PROPERTY_GROUPS = [
  {
    properties: ['content'],
    emptyLineBefore: 'always'
  },
  {
    properties: [
      'position',
      'z-index',
      'top',
      'right',
      'bottom',
      'left'
    ],
    emptyLineBefore: 'always'
  },
  {
    properties: [
      'display',
      'visibility',
      'float',
      'clear',
      'overflow',
      'overflow-x',
      'overflow-y',
      'clip'
    ],
    emptyLineBefore: 'always'
  },
  {
    properties: [
      'box-sizing',
      'width',
      'min-width',
      'max-width',
      'height',
      'min-height',
      'max-height',
      'margin',
      'margin-top',
      'margin-right',
      'margin-bottom',
      'margin-left',
      'padding',
      'padding-top',
      'padding-right',
      'padding-bottom',
      'padding-left'
    ],
    emptyLineBefore: 'always'
  },
  {
    properties: [
      'flex',
      'flex-flow',
      'flex-direction',
      'flex-wrap',
      'flex-grow',
      'flex-shrink',
      'flex-basis',
      'grid',
      'grid-template',
      'grid-template-rows',
      'grid-template-columns',
      'grid-auto-flow',
      'grid-auto-rows',
      'grid-auto-columns',
      'grid-row',
      'grid-column',
      'gap',
      'row-gap',
      'column-gap',
      'align-items',
      'align-self',
      'justify-items',
      'justify-self',
      'justify-content',
      'place-items',
      'place-content',
      'order'
    ],
    emptyLineBefore: 'always'
  },
  {
    properties: [
      'table-layout',
      'empty-cells',
      'caption-side',
      'border-spacing',
      'border-collapse',
      'list-style',
      'list-style-position',
      'list-style-type',
      'list-style-image'
    ],
    emptyLineBefore: 'always'
  },
  {
    properties: [
      'border',
      'border-width',
      'border-style',
      'border-color',
      'border-top',
      'border-top-width',
      'border-top-style',
      'border-top-color',
      'border-right',
      'border-right-width',
      'border-right-style',
      'border-right-color',
      'border-bottom',
      'border-bottom-width',
      'border-bottom-style',
      'border-bottom-color',
      'border-left',
      'border-left-width',
      'border-left-style',
      'border-left-color',
      'border-radius',
      'border-top-left-radius',
      'border-top-right-radius',
      'border-bottom-right-radius',
      'border-bottom-left-radius',
      'outline'
    ],
    emptyLineBefore: 'always'
  },
  {
    properties: [
      'font',
      'font-style',
      'font-variant',
      'font-weight',
      'font-stretch',
      'font-size',
      'line-height',
      'font-family',
      'letter-spacing',
      'text-align',
      'text-align-last',
      'text-decoration',
      'text-emphasis',
      'text-indent',
      'text-justify',
      'text-outline',
      'text-overflow',
      'text-overflow-ellipsis',
      'text-overflow-mode',
      'text-shadow',
      'text-transform',
      'white-space',
      'word-spacing',
      'word-wrap',
      'word-break',
      'overflow-wrap',
      'tab-size',
      'hyphens',
      'vertical-align'
    ],
    emptyLineBefore: 'always'
  },
  {
    properties: [
      'background',
      'background-color',
      'background-image',
      'background-position',
      'background-position-x',
      'background-position-y',
      'background-size',
      'background-repeat',
      'background-origin',
      'background-clip',
      'background-attachment',
      'background-blend-mode',
      'color',
      'box-shadow'
    ],
    emptyLineBefore: 'always'
  },
  {
    properties: [
      'opacity',
      'transform',
      'transform-origin',
      'filter',
      'backdrop-filter',
      'mix-blend-mode'
    ],
    emptyLineBefore: 'always'
  },
  {
    properties: [
      'transition',
      'transition-delay',
      'transition-timing-function',
      'transition-duration',
      'transition-property',
      'animation',
      'animation-name',
      'animation-duration',
      'animation-play-state',
      'animation-timing-function',
      'animation-delay',
      'animation-iteration-count',
      'animation-direction',
      'animation-fill-mode'
    ],
    emptyLineBefore: 'always'
  },
  {
    properties: [
      'cursor',
      'pointer-events',
      'resize',
      'user-select',
      'appearance'
    ],
    emptyLineBefore: 'always'
  }
];

// The names of the classes, the variables, the mixins, the functions and the placeholders: kebab-case, with the BEM
// parts after _ or __ and the modifiers after --, as $bro-toolbar_content-search or .mdc-tab-indicator__content--underline.
const BEM_KEBAB_CASE = '^[a-z][a-z0-9]*(-[a-z0-9]+)*((_{1,2}|--)[a-z0-9]+(-[a-z0-9]+)*)*$';

export default {
  customSyntax: 'postcss-scss',
  extends: ['stylelint-config-standard-scss'],
  plugins: ['stylelint-order'],
  ignoreFiles: ['**/dist/**', '**/node_modules/**', 'packages/skins/*/styles/skin/shared/**', 'packages/skins/*/styles/skin/vanilla-js/shared/**', 'packages/skins/*/styles/mixins/**', 'packages/skins/*/styles/_table-bro.api.scss'],
  rules: {
    'alpha-value-notation': 'number',
    'at-rule-empty-line-before': null,
    'block-no-empty': null,
    'color-function-alias-notation': null,
    'color-function-notation': null,
    'comment-empty-line-before': ['always', {
      except: ['first-nested'],
      ignore: ['after-comment', 'stylelint-commands']
    }],
    'custom-property-empty-line-before': null,
    'declaration-empty-line-before': null,
    'font-family-name-quotes': null,
    'font-family-no-missing-generic-family-keyword': null,
    'import-notation': null,
    'keyframes-name-pattern': null,
    'length-zero-no-unit': true,
    'max-nesting-depth': [4, {
      ignore: ['blockless-at-rules']
    }],
    'media-feature-range-notation': null,
    'no-descending-specificity': null,
    'no-empty-source': null,
    'order/order': null,
    'property-no-vendor-prefix': true,
    'rule-empty-line-before': ['always-multi-line', {
      except: ['first-nested'],
      ignore: ['after-comment']
    }],
    'scss/at-function-pattern': BEM_KEBAB_CASE,
    'scss/at-mixin-argumentless-call-parentheses': null,
    'scss/at-mixin-pattern': BEM_KEBAB_CASE,
    'scss/dollar-variable-empty-line-before': null,
    'scss/dollar-variable-pattern': BEM_KEBAB_CASE,
    'scss/percent-placeholder-pattern': BEM_KEBAB_CASE,
    'selector-class-pattern': BEM_KEBAB_CASE,
    'selector-pseudo-element-no-unknown': [true, {
      ignorePseudoElements: ['ng-deep']
    }],
    'value-keyword-case': ['lower', {
      camelCaseSvgKeywords: true
    }],
    'order/properties-order': [CSSCOMB_YANDEX_PROPERTY_GROUPS, {
      unspecified: 'bottomAlphabetical',
      emptyLineBeforeUnspecified: 'always'
    }]
  }
};
