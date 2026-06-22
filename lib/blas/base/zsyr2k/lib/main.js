// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zsyr2k from './zsyr2k.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zsyr2k, 'ndarray', ndarray );


// EXPORTS //

export default zsyr2k;
