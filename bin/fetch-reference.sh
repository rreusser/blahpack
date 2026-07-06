#!/bin/bash
#
# Fetch the reference BLAS and LAPACK Fortran sources into data/.
#
# These sources are the inputs to fixture generation
# (test/generate_fixtures.sh) and to the gate's workspace-family checks
# (bin/gate/util.js expects data/BLAS-3.12.0/*.f and
# data/lapack-3.12.0/SRC/*.f). They are gitignored because they are large
# and upstream-owned; run this once after cloning to make fixtures
# regenerable and the workspace checks active.
#
# Idempotent: skips a target that already exists. Pass --force to refetch.
#
# Usage:
#   bin/fetch-reference.sh [--force]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DATA_DIR="${SCRIPT_DIR}/../data"
FORCE=0
[ "${1:-}" = "--force" ] && FORCE=1

BLAS_VERSION="3.12.0"
LAPACK_VERSION="3.12.0"
ARPACK_VERSION="3.9.1"
BLAS_URL="https://www.netlib.org/blas/blas-${BLAS_VERSION}.tgz"
LAPACK_URL="https://github.com/Reference-LAPACK/lapack/archive/refs/tags/v${LAPACK_VERSION}.tar.gz"
ARPACK_URL="https://github.com/opencollab/arpack-ng/archive/refs/tags/${ARPACK_VERSION}.tar.gz"

mkdir -p "${DATA_DIR}"
cd "${DATA_DIR}"

fetch() {
	local url="$1"
	local out="$2"
	echo "Downloading ${url}"
	if command -v curl >/dev/null 2>&1; then
		curl -fsSL "${url}" -o "${out}"
	elif command -v wget >/dev/null 2>&1; then
		wget -q "${url}" -O "${out}"
	else
		echo "ERROR: need curl or wget to fetch reference sources." >&2
		exit 1
	fi
}

# --- BLAS -------------------------------------------------------------------
# The netlib tarball extracts to BLAS-${BLAS_VERSION}/ with the .f sources
# directly inside (ddot.f, dgemm.f, ...).
if [ "${FORCE}" -eq 0 ] && [ -d "BLAS-${BLAS_VERSION}" ]; then
	echo "BLAS-${BLAS_VERSION}/ already present; skipping (use --force to refetch)."
else
	rm -rf "BLAS-${BLAS_VERSION}"
	fetch "${BLAS_URL}" "blas.tgz"
	tar -xzf "blas.tgz"
	rm -f "blas.tgz"
	echo "Extracted BLAS-${BLAS_VERSION}/"
fi

# --- LAPACK -----------------------------------------------------------------
# The GitHub tag tarball extracts to lapack-${LAPACK_VERSION}/ with the
# routine sources under SRC/ (dpotf2.f, dgesvd.f, ...).
if [ "${FORCE}" -eq 0 ] && [ -d "lapack-${LAPACK_VERSION}/SRC" ]; then
	echo "lapack-${LAPACK_VERSION}/SRC already present; skipping (use --force to refetch)."
else
	rm -rf "lapack-${LAPACK_VERSION}"
	fetch "${LAPACK_URL}" "lapack.tar.gz"
	tar -xzf "lapack.tar.gz"
	rm -f "lapack.tar.gz"
	echo "Extracted lapack-${LAPACK_VERSION}/"
fi

# --- ARPACK -----------------------------------------------------------------
# The GitHub tag tarball extracts to arpack-ng-${ARPACK_VERSION}/ with the
# routine sources under SRC/ (dsaupd.f, dseupd.f, ...) and the banded driver
# under EXAMPLES/BAND/ (dsband.f). BSD-3-Clause (Rice); see docs/optimization-
# policy.md and docs/arpack-translation.md.
if [ "${FORCE}" -eq 0 ] && [ -d "arpack-ng-${ARPACK_VERSION}/SRC" ]; then
	echo "arpack-ng-${ARPACK_VERSION}/SRC already present; skipping (use --force to refetch)."
else
	rm -rf "arpack-ng-${ARPACK_VERSION}"
	fetch "${ARPACK_URL}" "arpack.tar.gz"
	tar -xzf "arpack.tar.gz"
	rm -f "arpack.tar.gz"
	echo "Extracted arpack-ng-${ARPACK_VERSION}/"
fi

# --- Verify -----------------------------------------------------------------
MISSING=0
[ -f "BLAS-${BLAS_VERSION}/ddot.f" ] || { echo "WARN: BLAS-${BLAS_VERSION}/ddot.f not found — layout may have changed." >&2; MISSING=1; }
[ -f "lapack-${LAPACK_VERSION}/SRC/dpotf2.f" ] || { echo "WARN: lapack-${LAPACK_VERSION}/SRC/dpotf2.f not found — layout may have changed." >&2; MISSING=1; }
[ -f "arpack-ng-${ARPACK_VERSION}/SRC/dsaupd.f" ] || { echo "WARN: arpack-ng-${ARPACK_VERSION}/SRC/dsaupd.f not found — layout may have changed." >&2; MISSING=1; }
if [ "${MISSING}" -eq 0 ]; then
	echo "Reference sources ready under data/."
fi
