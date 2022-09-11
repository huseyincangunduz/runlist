import { Operator } from "./run-operator";

const fs = require("fs");

const proccessMapStr = fs.readFileSync("runlist.json");
const obj = JSON.parse(proccessMapStr);
const operator = new Operator();

operator.operate(obj);
