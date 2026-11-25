
## Evidence 2026-11-25 (2): dstebz IBLOCK/ISPLIT

The ticket 0094 part-11 agent found that dstebz outputs 1-based IBLOCK and ISPLIT (IBLOCK = [1,1,1,1], ISPLIT = [4] for a 4×4 unsplit matrix). dstein's tests pass 1-based values too, but dstein/zstein's JSDoc calls them 0-based. S12 names `IBLOCK` explicitly as a 0-based public array.
