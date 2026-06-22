// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsygst from './dsygst.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsygst, 'ndarray', ndarray );


// EXPORTS //

export default dsygst;
