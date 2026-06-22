
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zungtsqr from './zungtsqr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zungtsqr, 'ndarray', ndarray );


// EXPORTS //

export default zungtsqr;
