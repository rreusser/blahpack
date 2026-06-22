// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zunmql from './zunmql.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zunmql, 'ndarray', ndarray );


// EXPORTS //

export default zunmql;
