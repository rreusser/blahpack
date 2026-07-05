program test_dsgets
  use test_utils
  implicit none
  double precision :: ritz(8), bounds(8), shifts(8)

  ! ------------------------------------------------------------------
  ! Case 1: which='LM', ishift=1, kev=3, np=2 (n=5). shifts computed.
  ritz(1:5)   = [ 3.0d0, -1.0d0, 4.0d0, -1.5d0, 2.0d0 ]
  bounds(1:5) = [ 0.10d0, 0.50d0, 0.02d0, 0.30d0, 0.05d0 ]
  shifts = 0.0d0
  call dsgets(1, 'LM', 3, 2, ritz, bounds, shifts)
  call begin_test('LM_ishift1_kev3_np2')
  call print_array('ritz', ritz, 5)
  call print_array('bounds', bounds, 5)
  call print_array('shifts', shifts, 2)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 2: which='BE', ishift=1, kev=4, np=2 (n=6). Exercises the swap.
  ritz(1:6)   = [ 3.0d0, -1.0d0, 4.0d0, -1.5d0, 2.0d0, -5.0d0 ]
  bounds(1:6) = [ 0.10d0, 0.50d0, 0.02d0, 0.30d0, 0.05d0, 0.40d0 ]
  shifts = 0.0d0
  call dsgets(1, 'BE', 4, 2, ritz, bounds, shifts)
  call begin_test('BE_ishift1_kev4_np2')
  call print_array('ritz', ritz, 6)
  call print_array('bounds', bounds, 6)
  call print_array('shifts', shifts, 2)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 3: which='SA', ishift=0, kev=3, np=2 (n=5). shifts untouched.
  ritz(1:5)   = [ 3.0d0, -1.0d0, 4.0d0, -1.5d0, 2.0d0 ]
  bounds(1:5) = [ 0.10d0, 0.50d0, 0.02d0, 0.30d0, 0.05d0 ]
  shifts = 0.0d0
  call dsgets(0, 'SA', 3, 2, ritz, bounds, shifts)
  call begin_test('SA_ishift0_kev3_np2')
  call print_array('ritz', ritz, 5)
  call print_array('bounds', bounds, 5)
  call print_array('shifts', shifts, 2)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 4: which='LA', ishift=1, kev=2, np=3 (n=5). shifts (np=3).
  ritz(1:5)   = [ -2.0d0, 5.0d0, 1.0d0, -3.0d0, 0.5d0 ]
  bounds(1:5) = [ 0.20d0, 0.01d0, 0.30d0, 0.04d0, 0.15d0 ]
  shifts = 0.0d0
  call dsgets(1, 'LA', 2, 3, ritz, bounds, shifts)
  call begin_test('LA_ishift1_kev2_np3')
  call print_array('ritz', ritz, 5)
  call print_array('bounds', bounds, 5)
  call print_array('shifts', shifts, 3)
  call end_test()

end program test_dsgets
