import path from "path";
import { Operator } from "./run-operator";
import fs from "fs";
let filename: string;
console.info("WORKING ON " + process.cwd());
const customArg = process.argv.findIndex((a) => a.includes("-c"));
if (customArg > -1) {
  filename = process.argv[customArg + 1];
} else {
  const pathArray = process.argv0.split(/[\\\\/]/g);
  let exeName = pathArray[pathArray.length - 1];
  exeName = exeName.slice(0, exeName.lastIndexOf("."));
  filename = path.resolve(process.cwd(), exeName + ".json");
}

const proccessMapStr = fs.readFileSync(filename) as any as string;
const obj = JSON.parse(proccessMapStr);
const operator = new Operator();

operator.operate(obj);
