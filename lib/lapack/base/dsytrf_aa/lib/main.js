
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsytrfAa from './dsytrf_aa.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsytrfAa, 'ndarray', ndarray );


// EXPORTS //

export default dsytrfAa;
