
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgeqrt3 from './zgeqrt3.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgeqrt3, 'ndarray', ndarray );


// EXPORTS //

export default zgeqrt3;
