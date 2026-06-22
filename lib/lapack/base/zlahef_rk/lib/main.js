
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlahefRk from './zlahef_rk.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlahefRk, 'ndarray', ndarray );


// EXPORTS //

export default zlahefRk;
