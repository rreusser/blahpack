program test_ieeeck
  ! Sweeps IEEECK over a grid of (ZERO, ONE) values, including signed
  ! zeros, infinities and NaN, so that every early return is reached.
  ! The grid is printed as value codes (JSON has no Inf/NaN); the JS test
  ! rebuilds the same values from the codes.
  use test_utils
  use, intrinsic :: ieee_arithmetic
  implicit none
  integer, parameter :: nv = 13
  real :: v(nv)
  integer :: res(nv*nv)
  integer :: ispecs(3)
  integer :: i, j, k, ieeeck
  external ieeeck
  character(len=16) :: nm

  ! Codes: 1:0 2:-0 3:1 4:-1 5:2 6:-2 7:0.5 8:-4 9:+Inf 10:-Inf 11:NaN 12:1e-30 13:3
  v(1) = 0.0
  v(2) = sign( 0.0, -1.0 )
  v(3) = 1.0
  v(4) = -1.0
  v(5) = 2.0
  v(6) = -2.0
  v(7) = 0.5
  v(8) = -4.0
  v(9) = ieee_value( v(1), ieee_positive_inf )
  v(10) = ieee_value( v(1), ieee_negative_inf )
  v(11) = ieee_value( v(1), ieee_quiet_nan )
  v(12) = 1.0e-30
  v(13) = 3.0
  ispecs = (/ 0, 1, 2 /)

  ! The canonical call: IEEECK( ISPEC, 0.0, 1.0 ), as ILAENV makes it
  call begin_test('canonical')
  call print_int('ispec0', ieeeck( 0, 0.0, 1.0 ))
  call print_int('ispec1', ieeeck( 1, 0.0, 1.0 ))
  call end_test()

  do k = 1, 3
    do i = 1, nv
      do j = 1, nv
        res( (i-1)*nv + j ) = ieeeck( ispecs(k), v(i), v(j) )
      end do
    end do
    write(nm, '(A,I0)') 'grid_ispec', ispecs(k)
    call begin_test(trim(nm))
    call print_int('ispec', ispecs(k))
    call print_int_array('result', res, nv*nv)
    call end_test()
  end do
end program
