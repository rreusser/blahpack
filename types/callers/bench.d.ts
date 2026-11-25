// @stdlib/bench, for tsconfig.callers.json (ticket 0094). stdlib's benchmark
// convention documents `createBenchmark` as `@returns {Function}`, which its
// own declaration of `bench( name, fn )` rejects. The harness is not what this
// check is for: it checks each benchmark's calls into lib/.
declare function bench( name: string, ...args: Array<any> ): any;

export = bench;
