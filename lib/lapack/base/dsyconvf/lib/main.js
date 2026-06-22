
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsyconvf from './dsyconvf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsyconvf, 'ndarray', ndarray );


// EXPORTS //

export default dsyconvf;
