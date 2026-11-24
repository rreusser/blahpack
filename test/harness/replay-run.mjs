/**
* Child-process entry for one module's wrapper replay: prints the report as
* JSON. Run with `--import=test/harness/replay-offsets.mjs` and
* `REPLAY_WRAPPER` set (see `runReplay` in test/harness/replay.js), so that
* a module that hangs (an iterative routine fed NaN while probing) can be
* killed by a timeout without stopping the others.
*/

import { replayModule } from './replay.js';

const report = await replayModule( process.argv[ 2 ] );
process.stdout.write( JSON.stringify( report ) );
