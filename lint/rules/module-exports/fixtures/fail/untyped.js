// expect: untyped
// FAIL — index.js attaches strided but exports the routine untyped, so tsc cannot see `ddot.strided`.
import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ddot from './ddot.js';
import strided from './strided.js';

setReadOnly( ddot, 'strided', strided );

export default ddot;
export { strided };
