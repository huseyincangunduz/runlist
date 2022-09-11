import { RunModel } from "./run-model";
import * as ChildProcess from "child_process";
import path from "path";

export const OperatorStatus = "";
export class Operator {
  waitFor: RunModel[] = [];

  operate(runModels: RunModel[]) {
    runModels.forEach((model) => {
      if (model.runMode == "continue-after-start") {
        this.launchAndContinue(model);
      } else {
        if (model.waitBeforeExit) {
          this.waitFor.push(model);
        }

        this.launchWait(model);
      }
    });
  }

  private continue(startAfterThis: RunModel[]) {
    if (startAfterThis?.length) this.operate(startAfterThis);
  }

  private flatParameters(model: RunModel) {
    const workingPath = process.cwd();
    let args = model.cmd.length > 1 ? model.cmd.slice(1) : [];
    args = args.map((str) => {
      // if (
      //   str.startsWith("./") ||
      //   str.startsWith(".\\") ||
      //   str.startsWith("../") ||
      //   str.startsWith("..\\")
      // ) {
      //   console.info("PARAMETER : " + path.resolve(workingPath, str));
      //   return path.resolve(workingPath, str);
      // } else if (str.startsWith("/") || str.startsWith("\\")) {
      //   return path.resolve(str);
      // }
      // console.info("PARAMETER : " + str);

      return str;
    });
    return args;
  }

  private launchAndContinue(model: RunModel) {
    const command = model.cmd[0],
      params = this.flatParameters(model);
    ChildProcess.spawn(command, params);
    this.continue(model.startAfterThis);
  }

  private launchWait(model: RunModel) {
    const command = model.cmd[0],
      params = this.flatParameters(model);
    const proccess = ChildProcess.spawnSync(command, params, {});
    model._process = proccess;
    const exception = proccess.error,
      processFinishError = proccess.stderr;

    if (exception) console.error(exception);
    if (processFinishError) console.error(processFinishError);
    const modelIndex = this.waitFor.indexOf(model);
    if (modelIndex > -1) this.waitFor.splice(modelIndex, 1);
    this.continue(model.startAfterThis);
  }
}
