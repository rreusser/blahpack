
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dorbdb4 from './dorbdb4.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dorbdb4, 'ndarray', ndarray );


// EXPORTS //

export default dorbdb4;
