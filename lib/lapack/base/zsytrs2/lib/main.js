// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zsytrs2 from './zsytrs2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zsytrs2, 'ndarray', ndarray );


// EXPORTS //

export default zsytrs2;
