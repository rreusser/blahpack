program test_iparmq
  ! Fixtures for IPARMQ.
  !
  ! 'nh_sweep_*': every NH from -2 to 700 (the NINT(LOG2(NH)) region from
  ! 150 to 590 exhaustively) and the thresholds above it, for the queries
  ! that depend on NH (13 INWIN, 15 ISHFTS, 16 IACC22), with ILO = 1 and
  ! with ILO = 7 (NH = IHI - ILO + 1).
  !
  ! 'name_*': every NAME that LAPACK 3.12 passes to ILAENV with
  ! 12 <= ISPEC <= 17 (data/lapack-3.12.0/SRC/[dz]*.f), plus names that
  ! reach IPARMQ's other IACC22 branches (xGGHRD, xTREXC/xTGEXC) and its
  ! case handling; each over ISPEC = 0..18 and NH crossing every threshold.
  use test_utils
  implicit none
  integer, parameter :: nnames = 23, nhs = 26, maxsw = 720
  character(len=8) :: names(nnames)
  character(len=2) :: opts(nnames)
  integer :: nhv(nhs)
  integer :: sw(maxsw), r13(maxsw), r15(maxsw), r16(maxsw)
  integer :: res(19*nhs)
  integer, parameter :: big(8) = (/ 1000, 2999, 3000, 3001, 5999, 6000, 6001, 10000 /)
  integer :: i, j, k, nsw, ilo, iparmq
  character(len=16) :: nm
  external iparmq

  names = (/ 'DGGHD3  ', 'DHSEQR  ', 'DLAQR0  ', 'DLAQR3  ', 'DLAQR4  ', &
             'DLAQZ0  ', 'ZGGHD3  ', 'ZHSEQR  ', 'ZLAQR0  ', 'ZLAQR3  ', &
             'ZLAQR4  ', 'ZLAQZ0  ', 'DGGHRD  ', 'ZGGHRD  ', 'DTREXC  ', &
             'ZTGEXC  ', 'dlaqr0  ', 'dLAQR0  ', 'Dlaqr0  ', 'dtrexc  ', &
             'DGEQRF  ', 'XLAQR5  ', '        ' /)
  opts = (/ '  ', 'SV', 'SV', 'SV', 'EN', 'SI', '  ', 'EV', 'SV', 'SV', &
            'EN', 'SI', '  ', '  ', '  ', '  ', 'SV', 'SV', 'SV', '  ', &
            '  ', 'SV', '  ' /)
  nhv = (/ -1, 0, 1, 13, 14, 15, 29, 30, 59, 60, 149, 150, 151, 181, 256, &
           300, 500, 501, 589, 590, 2999, 3000, 5999, 6000, 6001, 10000 /)

  nsw = 0
  do i = -2, 700
    nsw = nsw + 1
    sw(nsw) = i
  end do
  do i = 1, 8
    nsw = nsw + 1
    sw(nsw) = big(i)
  end do

  do k = 1, 2
    ilo = 1
    if (k == 2) ilo = 7
    do i = 1, nsw
      r13(i) = iparmq( 13, 'DLAQR0', 'SV', sw(i), ilo, ilo + sw(i) - 1, 1 )
      r15(i) = iparmq( 15, 'DLAQR0', 'SV', sw(i), ilo, ilo + sw(i) - 1, 1 )
      r16(i) = iparmq( 16, 'DLAQR0', 'SV', sw(i), ilo, ilo + sw(i) - 1, 1 )
    end do
    if (k == 1) then
      call begin_test('nh_sweep_ilo1')
    else
      call begin_test('nh_sweep_ilo7')
    end if
    call print_int('ilo', ilo)
    call print_int_array('nh', sw, nsw)
    call print_int_array('inwin', r13, nsw)
    call print_int_array('ishfts', r15, nsw)
    call print_int_array('iacc22', r16, nsw)
    call end_test()
  end do

  ! Per-name sweep: res( ispec*nhs + j ) for ispec = 0..18, NH = nhv(j), ILO = 1
  call begin_test('nh_grid')
  call print_int_array('nh', nhv, nhs)
  call end_test()
  do k = 1, nnames
    do i = 0, 18
      do j = 1, nhs
        res( i*nhs + j ) = iparmq( i, trim(names(k)), opts(k), nhv(j), 1, nhv(j), 1 )
      end do
    end do
    write(nm, '(A,I2.2)') 'name_', k
    call begin_test(trim(nm))
    call print_int('index', k)
    write(*, '(A,A,A)', advance='no') ',"routine":"', trim(names(k)), '"'
    write(*, '(A,A,A)', advance='no') ',"opts":"', opts(k), '"'
    call print_int_array('result', res, 19*nhs)
    call end_test()
  end do
end program
