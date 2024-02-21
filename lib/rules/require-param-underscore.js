/**
 * @fileoverview Enforce underscore prefix or suffix in function parameter names.
 * @author pmcrockett
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce underscore prefix or suffix in function parameter names.",
      recommended: false,
      url: "https://github.com/pmcrockett/require-param-underscore",
    },
    fixable: "code",
    schema: [
      {
        enum: ["pre", "post"],
      },
    ],
  },
  create(_context) {
    const optPre = "pre";
    const option = _context.options[0];
    const underscorePosition = typeof option !== "undefined" ? option : optPre;
    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    function hasUnderscorePrefix(_identifier) {
      return _identifier !== "_" && _identifier[0] === "_";
    }

    function hasUnderscoreSuffix(_identifier) {
      return _identifier !== "_" && _identifier[_identifier.length - 1] === "_";
    }

    function checkForUnderscoreInFunctionParameters(_node) {
      _node.params.forEach((_param) => {
        const { type } = _param;
        let underscoreNode;

        if (type === "RestElement") {
          underscoreNode = _param.argument;
        } else if (type === "AssignmentPattern") {
          underscoreNode = _param.left;
        } else {
          underscoreNode = _param;
        }

        if (underscoreNode.type === "Identifier") {
          const id = underscoreNode.name;

          if (underscorePosition === optPre) {
            if (!hasUnderscorePrefix(id)) {
              _context.report({
                node: underscoreNode,
                message:
                  "Function parameter name '{{identifier}}' doesn't begin with '_'.",
                data: {
                  identifier: id,
                },
              });
            }
          } else if (!hasUnderscoreSuffix(id)) {
            _context.report({
              node: underscoreNode,
              message:
                "Function parameter name '{{identifier}}' doesn't end with '_'.",
              data: {
                identifier: id,
              },
            });
          }
        }
      });
    }
    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      FunctionDeclaration: checkForUnderscoreInFunctionParameters,
      FunctionExpression: checkForUnderscoreInFunctionParameters,
      ArrowFunctionExpression: checkForUnderscoreInFunctionParameters,
    };
  },
};
