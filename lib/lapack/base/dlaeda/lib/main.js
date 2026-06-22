
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaeda from './dlaeda.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaeda, 'ndarray', ndarray );


// EXPORTS //

export default dlaeda;
