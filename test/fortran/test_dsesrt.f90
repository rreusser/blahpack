program test_dsesrt
  use test_utils
  implicit none
  double precision :: x(4), a(3, 4)
  integer :: i, j

  ! Column j of `a` is [ 10*j+1, 10*j+2, 10*j+3 ] so permutations are visible.
  ! ------------------------------------------------------------------
  ! Case 1: 'LA', apply=.true., na=3 (all rows).
  x = [ 3.0d0, 1.0d0, 4.0d0, 2.0d0 ]
  do j = 1, 4
    do i = 1, 3
      a(i, j) = ( 10.0d0 * dble(j) ) + dble(i)
    end do
  end do
  call dsesrt('LA', .true., 4, x, 3, a, 3)
  call begin_test('LA_apply_n4_na3')
  call print_array('x', x, 4)
  call print_matrix('a', a, 3, 3, 4)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 2: 'SM', apply=.true., na=2 (only first two rows swapped).
  x = [ -3.0d0, 1.0d0, -4.0d0, 2.0d0 ]
  do j = 1, 4
    do i = 1, 3
      a(i, j) = ( 10.0d0 * dble(j) ) + dble(i)
    end do
  end do
  call dsesrt('SM', .true., 4, x, 2, a, 3)
  call begin_test('SM_apply_n4_na2')
  call print_array('x', x, 4)
  call print_matrix('a', a, 3, 3, 4)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 3: 'SA', apply=.false. — `a` untouched.
  x = [ 3.0d0, 1.0d0, 4.0d0, 2.0d0 ]
  do j = 1, 4
    do i = 1, 3
      a(i, j) = ( 10.0d0 * dble(j) ) + dble(i)
    end do
  end do
  call dsesrt('SA', .false., 4, x, 3, a, 3)
  call begin_test('SA_noapply_n4')
  call print_array('x', x, 4)
  call print_matrix('a', a, 3, 3, 4)
  call end_test()

end program test_dsesrt
