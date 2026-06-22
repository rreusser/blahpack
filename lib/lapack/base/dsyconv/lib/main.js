// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsyconv from './dsyconv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsyconv, 'ndarray', ndarray );


// EXPORTS //

export default dsyconv;
