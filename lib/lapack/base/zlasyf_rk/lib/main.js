
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlasyfRk from './zlasyf_rk.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlasyfRk, 'ndarray', ndarray );


// EXPORTS //

export default zlasyfRk;
