
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlamtsqr from './zlamtsqr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlamtsqr, 'ndarray', ndarray );


// EXPORTS //

export default zlamtsqr;
