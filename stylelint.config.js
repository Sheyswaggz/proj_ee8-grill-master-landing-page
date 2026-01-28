export default {
  extends: ['stylelint-config-standard'],
  
  ignoreFiles: [
    'dist/**/*',
    'node_modules/**/*',
    'build/**/*',
    'coverage/**/*'
  ],
  
  rules: {
    // Modern CSS features
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
          'layer'
        ]
      }
    ],
    
    // CSS Grid
    'property-no-unknown': [
      true,
      {
        ignoreProperties: [
          'grid-template-areas',
          'grid-template-columns',
          'grid-template-rows',
          'grid-auto-columns',
          'grid-auto-rows',
          'grid-auto-flow',
          'grid-column',
          'grid-row',
          'grid-area',
          'grid-column-start',
          'grid-column-end',
          'grid-row-start',
          'grid-row-end',
          'grid-gap',
          'grid-column-gap',
          'grid-row-gap'
        ]
      }
    ],
    
    // Flexbox
    'declaration-block-no-duplicate-properties': [
      true,
      {
        ignore: ['consecutive-duplicates-with-different-values']
      }
    ],
    
    // Custom properties (CSS variables)
    'custom-property-empty-line-before': [
      'always',
      {
        except: ['after-custom-property', 'first-nested'],
        ignore: ['after-comment', 'inside-single-line-block']
      }
    ],
    'custom-property-pattern': null,
    
    // Color formats
    'color-function-notation': 'modern',
    'alpha-value-notation': 'number',
    'color-hex-length': 'short',
    'color-named': 'never',
    
    // Font weights
    'font-weight-notation': 'numeric',
    
    // Selector patterns
    'selector-class-pattern': null,
    'selector-id-pattern': null,
    'keyframes-name-pattern': null,
    
    // Units
    'length-zero-no-unit': true,
    'unit-allowed-list': null,
    
    // Vendor prefixes
    'property-no-vendor-prefix': null,
    'value-no-vendor-prefix': null,
    'selector-no-vendor-prefix': null,
    'media-feature-name-no-vendor-prefix': true,
    'at-rule-no-vendor-prefix': true,
    
    // Specificity
    'selector-max-id': 1,
    'selector-max-universal': 1,
    'selector-max-type': 3,
    'selector-max-class': null,
    'selector-max-attribute': null,
    'selector-max-pseudo-class': null,
    'selector-max-combinators': null,
    'selector-max-compound-selectors': null,
    'selector-max-specificity': null,
    
    // Nesting
    'max-nesting-depth': null,
    
    // Comments
    'comment-empty-line-before': [
      'always',
      {
        except: ['first-nested'],
        ignore: ['stylelint-commands']
      }
    ],
    'comment-whitespace-inside': 'always',
    
    // Formatting
    'indentation': 2,
    'max-empty-lines': 2,
    'no-eol-whitespace': true,
    'no-missing-end-of-source-newline': true,
    'no-empty-first-line': true,
    
    // Declaration blocks
    'declaration-empty-line-before': [
      'always',
      {
        except: ['after-declaration', 'first-nested'],
        ignore: ['after-comment', 'inside-single-line-block']
      }
    ],
    'declaration-block-single-line-max-declarations': 1,
    
    // Rules
    'rule-empty-line-before': [
      'always-multi-line',
      {
        except: ['first-nested'],
        ignore: ['after-comment']
      }
    ],
    
    // At-rules
    'at-rule-empty-line-before': [
      'always',
      {
        except: ['blockless-after-same-name-blockless', 'first-nested'],
        ignore: ['after-comment'],
        ignoreAtRules: ['else']
      }
    ],
    
    // Strings
    'string-quotes': 'single',
    
    // Numbers
    'number-leading-zero': 'always',
    'number-no-trailing-zeros': true,
    
    // Functions
    'function-url-quotes': 'always',
    'function-name-case': 'lower',
    
    // Selectors
    'selector-pseudo-element-colon-notation': 'double',
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global', 'local', 'export', 'import']
      }
    ],
    'selector-type-case': 'lower',
    
    // Media queries
    'media-feature-name-no-unknown': true,
    'media-feature-range-notation': 'context',
    
    // Values
    'value-keyword-case': 'lower',
    
    // Properties
    'property-case': 'lower',
    
    // Declaration blocks
    'declaration-colon-space-after': 'always',
    'declaration-colon-space-before': 'never',
    'declaration-block-semicolon-newline-after': 'always',
    'declaration-block-semicolon-space-before': 'never',
    'declaration-block-trailing-semicolon': 'always',
    
    // Blocks
    'block-closing-brace-empty-line-before': 'never',
    'block-closing-brace-newline-after': 'always',
    'block-closing-brace-newline-before': 'always',
    'block-opening-brace-newline-after': 'always',
    'block-opening-brace-space-before': 'always',
    
    // Selectors
    'selector-attribute-brackets-space-inside': 'never',
    'selector-attribute-operator-space-after': 'never',
    'selector-attribute-operator-space-before': 'never',
    'selector-combinator-space-after': 'always',
    'selector-combinator-space-before': 'always',
    'selector-descendant-combinator-no-non-space': true,
    'selector-list-comma-newline-after': 'always',
    'selector-list-comma-space-before': 'never',
    'selector-pseudo-class-case': 'lower',
    'selector-pseudo-class-parentheses-space-inside': 'never',
    'selector-pseudo-element-case': 'lower',
    
    // Media features
    'media-feature-colon-space-after': 'always',
    'media-feature-colon-space-before': 'never',
    'media-feature-name-case': 'lower',
    'media-feature-parentheses-space-inside': 'never',
    'media-feature-range-operator-space-after': 'always',
    'media-feature-range-operator-space-before': 'always',
    'media-query-list-comma-newline-after': 'always-multi-line',
    'media-query-list-comma-space-after': 'always-single-line',
    'media-query-list-comma-space-before': 'never',
    
    // At-rules
    'at-rule-name-case': 'lower',
    'at-rule-name-space-after': 'always',
    'at-rule-semicolon-newline-after': 'always',
    'at-rule-semicolon-space-before': 'never',
    
    // General
    'no-duplicate-selectors': true,
    'no-extra-semicolons': true,
    'no-invalid-double-slash-comments': true,
    'no-irregular-whitespace': true
  }
};