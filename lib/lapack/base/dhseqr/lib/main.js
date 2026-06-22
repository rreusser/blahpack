// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dhseqr from './dhseqr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dhseqr, 'ndarray', ndarray );


// EXPORTS //

export default dhseqr;
