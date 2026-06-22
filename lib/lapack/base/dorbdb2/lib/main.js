
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dorbdb2 from './dorbdb2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dorbdb2, 'ndarray', ndarray );


// EXPORTS //

export default dorbdb2;
