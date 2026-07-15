// Optimized zgeru: register-blocked, layout-adaptive complex rank-1 update.
// Shares one kernel with zgerc; the `conj` flag is resolved outside all loops.
import makeZger from './make-kernel.js';

export default makeZger( false );
