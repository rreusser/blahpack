// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsycon from './dsycon.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsycon, 'ndarray', ndarray );


// EXPORTS //

export default dsycon;
