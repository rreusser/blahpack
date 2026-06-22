// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlapmt from './dlapmt.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlapmt, 'ndarray', ndarray );


// EXPORTS //

export default dlapmt;
