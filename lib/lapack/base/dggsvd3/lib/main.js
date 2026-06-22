// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dggsvd3 from './dggsvd3.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dggsvd3, 'ndarray', ndarray );


// EXPORTS //

export default dggsvd3;
