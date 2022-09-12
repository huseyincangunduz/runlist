import { RunMode } from "./run-mode";
import * as ChildProcess from "child_process";

export interface RunModel {
  alias?: string;
  _process?: ChildProcess.ChildProcessWithoutNullStreams;
  cmd: string[];
  afterLaunch?: RunMode;
  waitBeforeExit?: boolean;
  startAfterThis?: RunModel[];
}
