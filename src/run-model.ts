import { RunMode } from "./run-mode";

export interface RunModel {
  alias?: string;
  _process?: any;
  cmd: string[];
  afterLaunch?: RunMode;
  waitBeforeExit?: boolean;
  startAfterThis?: RunModel[];
}
