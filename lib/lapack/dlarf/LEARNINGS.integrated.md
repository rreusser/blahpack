# dlarf: Translation Learnings

## Translation pitfalls

- [x] The real version is simpler than zlarf: tau is a scalar (not a 2-element array), and no conjugation is needed.
- [x] Uses dgemv with 'T' (transpose) for left application, dger for the rank-1 update. The complex version uses 'C' (conjugate transpose) and zgerc.
- [x] The trailing zero scan in V uses a while loop that decrements lastv and ix simultaneously. Must ensure correct stride arithmetic.
- [x] iladlc/iladlr return 0-based values; must add 1 to convert to the 1-based lastc used internally.

## Dependency interface surprises

- [x] dgemv takes scalar alpha/beta (not arrays) for the real version. The complex zgemv takes Float64Array pairs.
- [x] dger signature is (M,N,alpha,x,sx,ox,y,sy,oy,A,sa1,sa2,oA) -- all real scalars.

## Automation opportunities

- [x] The real dlarf is a direct simplification of zlarf: remove complex arithmetic, change zgemv->dgemv, zgerc->dger, remove conjugate pairs.

## Coverage gaps

- [x] All paths covered: left application, right application, tau=0 (identity), non-square matrix.

## Complex number handling

- [x] N/A. Real-valued. Complex version zlarf already implemented.
