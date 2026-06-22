
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsptrd from './dsptrd.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsptrd, 'ndarray', ndarray );


// EXPORTS //

export default dsptrd;
