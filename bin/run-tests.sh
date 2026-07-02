#!/bin/bash
# Run the full test suite, folding the node:test summary lines to the end
# of the output. pipefail preserves the test runner's exit code — without
# it the pipeline exits with awk's status and a failing suite exits 0.
set -o pipefail

node --test 'lib/**/test/test*.js' 'lib/*.test.js' 2>&1 | awk '/ℹ (tests|suites|pass|fail|cancelled|skipped|todo|duration)/{buf=buf $0 ORS; next} {print} END{printf buf}'
