import { RunModel } from "./run-model";
import * as ChildProcess from "child_process";

export const OperatorStatus = "";
export class Operator {
  waitFor: RunModel[] = [];

  operate(runModels: RunModel[]) {
    runModels.forEach((model) => {
      const command = model.cmd[0],
        params = model.cmd.length > 2 ? model.cmd.slice(1) : [];

      let proccess;
      if (model.runMode == "continue-after-start") {
        proccess = ChildProcess.execFile(command, params);
        model._process = proccess;
        this.continue(model.startAfterThis);
      } else {
        if (model.waitBeforeExit) {
          this.waitFor.push(model);
        }

        proccess = ChildProcess.execFile(
          command,
          params,
          {},
          (exception, output, processFinishError) => {
            if (exception) console.error(exception);
            if (processFinishError) console.error(processFinishError);
            const modelIndex = this.waitFor.indexOf(model);
            if (modelIndex > -1) this.waitFor.splice(modelIndex, 1);
            this.continue(model.startAfterThis);
          }
        );
        model._process = proccess;
      }
    });
  }

  continue(startAfterThis: RunModel[]) {
    if (startAfterThis?.length) this.operate(startAfterThis);
  }
}
