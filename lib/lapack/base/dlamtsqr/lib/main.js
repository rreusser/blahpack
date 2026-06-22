
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlamtsqr from './dlamtsqr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlamtsqr, 'ndarray', ndarray );


// EXPORTS //

export default dlamtsqr;
