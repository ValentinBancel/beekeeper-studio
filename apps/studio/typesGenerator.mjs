/* eslint-disable @typescript-eslint/no-var-requires */

import fs from "fs";
import dtsGen from "dts-gen";
import path from "path";
import ini from "ini";
import _ from "lodash";

function resolveRootPath() {
  const __dirname = path.resolve();
  const dirpath = path.resolve(__dirname);
  if (dirpath.includes("node_modules")) {
    return dirpath.split("node_modules")[0];
  }
  return path.resolve(dirpath, "../..");
}

// https://stackoverflow.com/a/175787/10012118
function isNumeric(str) {
  if (typeof str != "string") return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
}

export function parseIni(text) {
  const obj = ini.parse(text);
  return _.cloneDeepWith(obj, (value) => {
    if (isNumeric(value)) {
      return _.toNumber(value);
    }
  });
}

export function generateConfigTypes() {
  const rootPath = resolveRootPath();

  const rawConfig = fs.readFileSync(
    path.join(rootPath, "default.config.ini"),
    "utf-8"
  );

  const config = parseIni(rawConfig);

  const result =
    "// THIS FILE IS AUTOGENERATED BY typesGenerator.js\n" +
    dtsGen
      .generateIdentifierDeclarationFile("IBkConfig", config)
      .replace("declare const IBkConfig:", "declare interface IBkConfig");

  fs.writeFileSync(
    path.join(rootPath, "apps/studio/src/typings/bkConfig.d.ts"),
    result
  );
}

if (process.env.CLI_MODE) {
  generateConfigTypes();
}