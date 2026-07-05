program test_dsortr
  use test_utils
  implicit none
  double precision :: x1(5), x2(5)
  double precision :: y1(6), y2(6)

  ! ------------------------------------------------------------------
  ! Case 1: 'LA' (largest algebraic first), apply=.true. — permute x2 alongside.
  x1 = [ 3.0d0, -1.0d0, 4.0d0, -1.5d0, 2.0d0 ]
  x2 = [ 10.0d0, 20.0d0, 30.0d0, 40.0d0, 50.0d0 ]
  call dsortr('LA', .true., 5, x1, x2)
  call begin_test('LA_apply_n5')
  call print_array('x1', x1, 5)
  call print_array('x2', x2, 5)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 2: 'SA' (smallest algebraic first), apply=.true.
  x1 = [ 3.0d0, -1.0d0, 4.0d0, -1.5d0, 2.0d0 ]
  x2 = [ 10.0d0, 20.0d0, 30.0d0, 40.0d0, 50.0d0 ]
  call dsortr('SA', .true., 5, x1, x2)
  call begin_test('SA_apply_n5')
  call print_array('x1', x1, 5)
  call print_array('x2', x2, 5)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 3: 'LM' (largest magnitude first), apply=.false. — x2 untouched.
  x1 = [ 3.0d0, -1.0d0, 4.0d0, -1.5d0, 2.0d0 ]
  x2 = [ 10.0d0, 20.0d0, 30.0d0, 40.0d0, 50.0d0 ]
  call dsortr('LM', .false., 5, x1, x2)
  call begin_test('LM_noapply_n5')
  call print_array('x1', x1, 5)
  call print_array('x2', x2, 5)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 4: 'SM' (smallest magnitude first), apply=.true., n=6 with a tie.
  y1 = [ -2.0d0, 2.0d0, 5.0d0, -0.5d0, 0.5d0, -5.0d0 ]
  y2 = [ 1.0d0, 2.0d0, 3.0d0, 4.0d0, 5.0d0, 6.0d0 ]
  call dsortr('SM', .true., 6, y1, y2)
  call begin_test('SM_apply_n6')
  call print_array('x1', y1, 6)
  call print_array('x2', y2, 6)
  call end_test()

end program test_dsortr
