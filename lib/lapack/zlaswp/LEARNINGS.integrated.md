# zlaswp: Translation Learnings

## Translation pitfalls

- Complex element swap requires swapping TWO doubles (real + imaginary) instead of one. Easy to forget the `+1` index for the imaginary part.
- The `reinterpret(A, 0)` call returns a Float64Array view. All offsets/strides from the API boundary (in complex elements) must be multiplied by 2 for Float64 indexing.
- The block-tiling loop (`BLOCK_SIZE=32`) works identically to the real version -- just swap 2 values per element instead of 1.

## Dependency interface surprises

- N/A -- zlaswp has no external dependencies besides `reinterpret`.

## Automation opportunities

- The dlaswp-to-zlaswp translation is mechanical: (1) add `reinterpret`, (2) multiply offsets/strides by 2, (3) swap pairs instead of singles. This pattern should be captured as a "complexify" transform.

## Coverage gaps

- All code paths covered (100% line and branch coverage). The block-tiled path (N>=32) and remainder path (N<32) are both exercised.

## Complex number handling

- No complex arithmetic needed -- only swaps of interleaved real/imaginary pairs. No cmplx.js usage required.
- Used `reinterpret()` at function entry per convention, with `*2` conversion for all strides/offsets.
