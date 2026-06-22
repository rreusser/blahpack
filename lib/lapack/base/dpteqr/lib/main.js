
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dpteqr from './dpteqr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dpteqr, 'ndarray', ndarray );


// EXPORTS //

export default dpteqr;
