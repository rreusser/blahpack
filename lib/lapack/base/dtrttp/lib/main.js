// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtrttp from './dtrttp.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtrttp, 'ndarray', ndarray );


// EXPORTS //

export default dtrttp;
