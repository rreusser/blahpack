
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgeqr2p from './zgeqr2p.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgeqr2p, 'ndarray', ndarray );


// EXPORTS //

export default zgeqr2p;
