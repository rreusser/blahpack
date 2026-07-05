program test_dsconv
  use test_utils
  implicit none
  integer :: nconv
  double precision :: ritz5(5), bounds5(5)
  double precision :: ritz8(8), bounds8(8)

  ! ------------------------------------------------------------------
  ! Case 1: mixed magnitudes, tol=1e-6. Convergence test is
  !   bounds(i) <= tol*max(eps23, |ritz(i)|),  eps23 = eps**(2/3).
  ritz5   = [ 1.0d0, 2.0d0, 0.5d0, 3.0d0, 0.1d0 ]
  bounds5 = [ 1.0d-14, 5.0d-1, 1.0d-16, 2.0d-3, 1.0d-12 ]
  call dsconv(5, ritz5, bounds5, 1.0d-6, nconv)
  call begin_test('mixed_n5_tol1em6')
  call print_int('n', 5)
  call print_array('ritz', ritz5, 5)
  call print_array('bounds', bounds5, 5)
  call print_scalar('tol', 1.0d-6)
  call print_int('nconv', nconv)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 2: tiny Ritz values exercise the eps23 floor; loose tol.
  ritz8   = [ 1.0d-13, 3.0d-12, 5.0d0, -2.0d0, 1.0d-1, 7.0d-3, -4.0d-9, 9.0d0 ]
  bounds8 = [ 1.0d-13, 1.0d-6, 1.0d-3, 3.0d-1, 1.0d-8, 2.0d-2, 1.0d-14, 1.0d-9 ]
  call dsconv(8, ritz8, bounds8, 1.0d-4, nconv)
  call begin_test('eps23floor_n8_tol1em4')
  call print_int('n', 8)
  call print_array('ritz', ritz8, 8)
  call print_array('bounds', bounds8, 8)
  call print_scalar('tol', 1.0d-4)
  call print_int('nconv', nconv)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 3: all converged (tol very loose).
  call dsconv(5, ritz5, bounds5, 1.0d0, nconv)
  call begin_test('all_converged_n5')
  call print_int('n', 5)
  call print_array('ritz', ritz5, 5)
  call print_array('bounds', bounds5, 5)
  call print_scalar('tol', 1.0d0)
  call print_int('nconv', nconv)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 4: none converged (tol tiny).
  call dsconv(5, ritz5, bounds5, 1.0d-20, nconv)
  call begin_test('none_converged_n5')
  call print_int('n', 5)
  call print_array('ritz', ritz5, 5)
  call print_array('bounds', bounds5, 5)
  call print_scalar('tol', 1.0d-20)
  call print_int('nconv', nconv)
  call end_test()

end program test_dsconv
