const { SPEC_OUTPUT_FILE_BEHAVIOR } = require("express-oas-generator");
const _ = require("lodash");

const swaggerConfig = {
  predefinedSpec: function (spec) {
    _.set(spec, "securityDefinitions.bearerAuth", {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description:
        "Please enter your token with 'Bearer ' prefix (e.g., 'Bearer your-token-here').",
    });
    _.set(spec, "security", [{ bearerAuth: [] }]);
    _.set(spec, "schemes", ["https", "http"]);
    return spec;
  },
  swaggerUiServePath: "v1/api-docs",
  specOutputPath: "src/docs/swagger_output.json",
  ignoredNodeEnvironments: ["production", "qa"],
  alwaysServeDocs: false,
  tags: ["items", "orders"],
  specOutputFileBehavior: SPEC_OUTPUT_FILE_BEHAVIOR.PRESERVE,
};

module.exports = swaggerConfig;
