import { RunMode } from "./run-mode";

export interface RunModel {
  _process?: any;
  cmd: string[];
  runMode?: RunMode;
  waitBeforeExit?: boolean;
  startAfterThis?: RunModel[];
}
