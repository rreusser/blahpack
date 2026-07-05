#!/bin/bash
set -euo pipefail

# Usage: ./test/run_fortran.sh <package> <routine> [--source <file>] [--output <file>]
# Example: ./test/run_fortran.sh blas daxpy
#          ./test/run_fortran.sh lapack dpotf2
#          ./test/run_fortran.sh lapack dpotf2 --source pipeline/dpotf2/step1.f

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

PACKAGE="$1"; shift
ROUTINE="$1"; shift

SOURCE_OVERRIDE=""
OUTPUT_OVERRIDE=""
while [[ $# -gt 0 ]]; do
  case $1 in
    --source) SOURCE_OVERRIDE="$2"; shift 2 ;;
    --output) OUTPUT_OVERRIDE="$2"; shift 2 ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

TEST_SRC="$SCRIPT_DIR/fortran/test_${ROUTINE}.f90"
UTILS_SRC="$SCRIPT_DIR/fortran/test_utils.f90"
FIXTURE_OUT="${OUTPUT_OVERRIDE:-$SCRIPT_DIR/fixtures/${ROUTINE}.jsonl}"
# Per-routine build directory so parallel fixture builds don't clobber each
# other's object files or Fortran `.mod` module files (la_constants, la_xisnan).
BUILD_DIR="$SCRIPT_DIR/build/${ROUTINE}"

mkdir -p "$BUILD_DIR" "$(dirname "$FIXTURE_OUT")"

if [ ! -f "$TEST_SRC" ]; then
  echo "Error: Test source not found: $TEST_SRC" >&2
  exit 1
fi

# Determine the original source file for this routine
if [ "$PACKAGE" = "blas" ]; then
  ORIGINAL_SOURCE="$ROOT_DIR/data/BLAS-3.12.0/${ROUTINE}.f"
elif [ "$PACKAGE" = "lapack" ]; then
  ORIGINAL_SOURCE="$ROOT_DIR/data/lapack-3.12.0/SRC/${ROUTINE}.f"
elif [ "$PACKAGE" = "arpack" ]; then
  ORIGINAL_SOURCE="$ROOT_DIR/data/arpack-ng-3.9.1/SRC/${ROUTINE}.f"
  # dsband and the other example drivers live under EXAMPLES/BAND.
  [ -f "$ORIGINAL_SOURCE" ] || ORIGINAL_SOURCE="$ROOT_DIR/data/arpack-ng-3.9.1/EXAMPLES/BAND/${ROUTINE}.f"
else
  echo "Error: Unknown package '$PACKAGE'. Use 'blas', 'lapack', or 'arpack'." >&2
  exit 1
fi

# Extra include dirs (ARPACK routines include debug.h / stat.h).
INCLUDES=()
[ "$PACKAGE" = "arpack" ] && INCLUDES=("-I" "$ROOT_DIR/data/arpack-ng-3.9.1")

# Collect Fortran source files needed for linking
SOURCES=("$UTILS_SRC" "$TEST_SRC")

if [ "$PACKAGE" = "blas" ]; then
  BLAS_DIR="$ROOT_DIR/data/BLAS-3.12.0"
  for f in "$BLAS_DIR"/*.f "$BLAS_DIR"/*.f90; do
    [ ! -f "$f" ] && continue
    # If source override, skip the original file for this routine
    base=$(basename "$f" .f)
    base=$(basename "$base" .f90)
    if [ -n "$SOURCE_OVERRIDE" ] && [ "$base" = "$ROUTINE" ]; then
      continue
    fi
    SOURCES+=("$f")
  done
elif [ "$PACKAGE" = "lapack" ]; then
  BLAS_DIR="$ROOT_DIR/data/BLAS-3.12.0"
  LAPACK_DIR="$ROOT_DIR/data/lapack-3.12.0/SRC"
  for f in "$BLAS_DIR"/*.f; do
    SOURCES+=("$f")
  done
  # Only link specific LAPACK dependencies (not all of LAPACK, which has
  # .f90 module issues). The test program defines LAPACK_DEPS if needed.
  DEPS_FILE="$SCRIPT_DIR/fortran/deps_${ROUTINE}.txt"
  if [ -f "$DEPS_FILE" ]; then
    while IFS= read -r dep; do
      dep=$(echo "$dep" | xargs)  # trim whitespace
      [ -z "$dep" ] && continue
      [[ "$dep" == \#* ]] && continue
      DEP_FILE="$LAPACK_DIR/${dep}.f"
      if [ -n "$SOURCE_OVERRIDE" ] && [ "$dep" = "$ROUTINE" ]; then
        continue
      fi
      if [ -f "$DEP_FILE" ]; then
        SOURCES+=("$DEP_FILE")
      else
        # Try .f90 extension
        DEP_FILE_F90="$LAPACK_DIR/${dep}.f90"
        if [ -f "$DEP_FILE_F90" ]; then
          SOURCES+=("$DEP_FILE_F90")
        else
          # Try .F extension (preprocessed fixed-form Fortran)
          DEP_FILE_F_UPPER="$LAPACK_DIR/${dep}.F"
          if [ -f "$DEP_FILE_F_UPPER" ]; then
            SOURCES+=("$DEP_FILE_F_UPPER")
          else
            # Try .F90 extension (preprocessed Fortran)
            DEP_FILE_F90U="$LAPACK_DIR/${dep}.F90"
            if [ -f "$DEP_FILE_F90U" ]; then
              SOURCES+=("$DEP_FILE_F90U")
            else
              # Also check INSTALL directory (e.g. dlamch)
              INSTALL_FILE="$ROOT_DIR/data/lapack-3.12.0/INSTALL/${dep}.f"
              if [ -f "$INSTALL_FILE" ]; then
                SOURCES+=("$INSTALL_FILE")
              else
                echo "Warning: dependency $dep not found at $DEP_FILE" >&2
              fi
            fi
          fi
        fi
      fi
    done < "$DEPS_FILE"
  else
    echo "Warning: No deps file ($DEPS_FILE). Only linking BLAS." >&2
  fi
  for f in "$BLAS_DIR"/*.f90; do
    [ -f "$f" ] && SOURCES+=("$f")
  done
elif [ "$PACKAGE" = "arpack" ]; then
  # ARPACK routines call BLAS, LAPACK, other ARPACK routines, and ARPACK
  # UTIL helpers (arscnd, dvout, ...). Link all of BLAS, then resolve each
  # dependency in deps_<routine>.txt against arpack SRC/UTIL, then lapack
  # SRC/INSTALL. deps_<routine>.txt lists every non-BLAS routine needed.
  BLAS_DIR="$ROOT_DIR/data/BLAS-3.12.0"
  ARPACK_SRC="$ROOT_DIR/data/arpack-ng-3.9.1/SRC"
  ARPACK_UTIL="$ROOT_DIR/data/arpack-ng-3.9.1/UTIL"
  LAPACK_DIR="$ROOT_DIR/data/lapack-3.12.0/SRC"
  LAPACK_INSTALL="$ROOT_DIR/data/lapack-3.12.0/INSTALL"
  for f in "$BLAS_DIR"/*.f; do
    SOURCES+=("$f")
  done
  # The routine under test itself (unless replaced by a --source override).
  [ -z "$SOURCE_OVERRIDE" ] && SOURCES+=("$ORIGINAL_SOURCE")
  DEPS_FILE="$SCRIPT_DIR/fortran/deps_${ROUTINE}.txt"
  if [ -f "$DEPS_FILE" ]; then
    while IFS= read -r dep; do
      dep=$(echo "$dep" | xargs)
      [ -z "$dep" ] && continue
      [[ "$dep" == \#* ]] && continue
      if [ "$dep" = "$ROUTINE" ]; then
        continue  # already added as ORIGINAL_SOURCE (or via --source)
      fi
      DEP_FILE=""
      for cand in "$ARPACK_SRC/${dep}.f" "$ARPACK_UTIL/${dep}.f" "$LAPACK_DIR/${dep}.f" "$LAPACK_DIR/${dep}.f90" "$LAPACK_DIR/${dep}.F90" "$LAPACK_DIR/${dep}.F" "$LAPACK_INSTALL/${dep}.f"; do
        [ -f "$cand" ] && { DEP_FILE="$cand"; break; }
      done
      if [ -n "$DEP_FILE" ]; then
        SOURCES+=("$DEP_FILE")
      else
        echo "Warning: dependency $dep not found for $ROUTINE" >&2
      fi
    done < "$DEPS_FILE"
  else
    echo "Warning: No deps file ($DEPS_FILE). Only linking BLAS." >&2
  fi
fi

# Add source override if provided
if [ -n "$SOURCE_OVERRIDE" ]; then
  if [ ! -f "$SOURCE_OVERRIDE" ]; then
    echo "Error: Source override not found: $SOURCE_OVERRIDE" >&2
    exit 1
  fi
  SOURCES+=("$SOURCE_OVERRIDE")
  echo "Using source override: $SOURCE_OVERRIDE" >&2
fi

BINARY="$BUILD_DIR/test_${ROUTINE}"

echo "Compiling test_${ROUTINE}..." >&2
# -J writes (and searches for) Fortran .mod files in the per-routine build
# directory, keeping parallel builds isolated.
gfortran -O2 -cpp -ffixed-line-length-none -J "$BUILD_DIR" ${INCLUDES[@]+"${INCLUDES[@]}"} -o "$BINARY" "${SOURCES[@]}" 2>&1 >&2

echo "Running test_${ROUTINE}..." >&2
"$BINARY" > "$FIXTURE_OUT"

echo "Fixture written to $FIXTURE_OUT" >&2
echo "Lines: $(wc -l < "$FIXTURE_OUT")" >&2
