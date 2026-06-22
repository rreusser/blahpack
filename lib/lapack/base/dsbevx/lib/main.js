
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsbevx from './dsbevx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsbevx, 'ndarray', ndarray );


// EXPORTS //

export default dsbevx;
