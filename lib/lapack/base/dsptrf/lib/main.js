
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsptrf from './dsptrf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsptrf, 'ndarray', ndarray );


// EXPORTS //

export default dsptrf;
