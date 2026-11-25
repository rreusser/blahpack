// Declarations for the code that calls the library (benchmarks, examples),
// checked by tsconfig.callers.json (ticket 0094).

// @stdlib/bench's harness declares its Benchmark interface without exporting
// it. A benchmark's `b` is used only through the harness, which this check
// does not cover (see bench.d.ts).
type Benchmark = any;
