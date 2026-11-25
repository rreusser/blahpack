// target: lib/blas/base/ddot/lib/main.js
// expect: mainUntyped
// FAIL — main.js attaches ndarray but exports the routine untyped, so tsc cannot see `ddot.ndarray`.
import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ddot from './ddot.js';
import ndarray from './ndarray.js';
setReadOnly( ddot, 'ndarray', ndarray );
export default ddot;
