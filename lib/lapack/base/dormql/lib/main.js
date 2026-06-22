// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dormql from './dormql.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dormql, 'ndarray', ndarray );


// EXPORTS //

export default dormql;
