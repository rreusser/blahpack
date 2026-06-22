// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhseqr from './zhseqr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhseqr, 'ndarray', ndarray );


// EXPORTS //

export default zhseqr;
