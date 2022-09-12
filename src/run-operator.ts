import { RunModel } from "./run-model";
import * as ChildProcess from "child_process";
import path from "path";
import { CONTINUE } from "./run-mode";
import { spy } from "./spy";

export const OperatorStatus = "";
export class Operator {
  waitFor: RunModel[] = [];
  allRuns: RunModel[] = [];
  constructor() {
    process.addListener("SIGINT", () => this.shutdownRespectfully()); // CTRL+C
    process.addListener("SIGQUIT", () => this.shutdownRespectfully()); // Keyboard quit
    process.addListener("SIGTERM", () => {
      console.info("GOD FINALLY -SPY");
      console.info(spy);
    }); // Keyboard quit
  }

  shutdownRespectfully(): void {
    console.info("BEGIN TO RESPECTFULLY SHUTDOWN");
    this.allRuns.forEach((proc) => {
      if (proc._process?.exitCode == null) {
        proc._process?.kill("SIGINT");
      }
    });
    console.info("BEGIN TO RESPECTFULLY COMPLETED");
  }

  operate(runModels: RunModel[]) {
    runModels.forEach((model) => {
      if (model.afterLaunch == CONTINUE) {
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

  private runProcess(model: RunModel) {
    const command = model.cmd[0],
      params = this.flatParameters(model);
    const proccess = ChildProcess.spawn(command, params);
    model._process = proccess;

    return proccess;
  }

  private launchAndContinue(model: RunModel) {
    const command = model.cmd[0];
    const alias = model.alias || command;

    console.info("RUNNING AND CONTINUED: " + alias);
    const proccess = this.runProcess(model);
    this.bindListeners(proccess, command, model, false);
  }

  private launchWait(model: RunModel) {
    const command = model.cmd[0];
    const alias = model.alias || command;
    console.info("RUNNING AND WAITED FOR: " + alias);
    const proccess = this.runProcess(model);
    this.bindListeners(proccess, command, model);
  }

  private bindListeners(
    proccess: ChildProcess.ChildProcessWithoutNullStreams,
    command: string,
    model: RunModel,
    sync = true
  ) {
    const alias = model.alias || command;

    if (sync) {
      this.waitFor.push(model);
    }
    this.allRuns.push(model);

    proccess.stdout.on("data", (data) =>
      console.info(`${alias} STDOUT ${data}`)
    );
    proccess.stderr.on("data", (data) =>
      console.warn(`${alias} STDERR ${data}`)
    );
    proccess.addListener("error", (e) =>
      console.error(`${alias} ERROR ${e.message}`)
    );
    proccess.addListener("message", (m) =>
      console.info(`${alias} MESSAGE ${m}`)
    );

    proccess.addListener("exit", (exitCode) => {
      console.info(`${alias} EXIT ${exitCode}`);
      if (sync) {
        const modelIndex = this.waitFor.indexOf(model);
        if (modelIndex > -1) this.waitFor.splice(modelIndex, 1);
        this.continue(model.startAfterThis);
      }
    });

    if (!sync) {
      this.continue(model.startAfterThis);
    }
  }
}
