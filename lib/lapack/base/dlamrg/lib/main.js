// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlamrg from './dlamrg.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlamrg, 'ndarray', ndarray );


// EXPORTS //

export default dlamrg;
