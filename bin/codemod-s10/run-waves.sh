#!/bin/bash
# Re-run every S10 wave in waves.txt, in order, from a tree where none has
# been applied (`git checkout <base> -- lib` first). Stops at the first wave
# the codemod refuses.
#
# Usage: bin/codemod-s10/run-waves.sh
cd "$(dirname "$0")/../.." || exit 2
grep -v '^#' bin/codemod-s10/waves.txt | while read -r wave; do
	[ -z "$wave" ] && continue
	echo "## $wave"
	# shellcheck disable=SC2086
	node bin/codemod-s10/run.mjs $wave 2>&1 | grep -v '^  lib\|^WARNINGS' || true
done
