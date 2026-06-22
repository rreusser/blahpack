
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsptri from './dsptri.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsptri, 'ndarray', ndarray );


// EXPORTS //

export default dsptri;
