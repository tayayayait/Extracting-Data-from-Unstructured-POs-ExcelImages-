var eventSwiper = undefined;

function blockList() {
	var screenWidth = $(window).width();

	if( $('.block-list').length > 0 ){
		if(screenWidth < 1025 && eventSwiper == undefined) {
			eventSwiper = new Swiper('.block-list', {
				slidesPerView : 1,
				speed: 400,
				spaceBetween: 0,
				pagination: {
					el: '.block-list-pagination'
				},
			});
		}
		else if (screenWidth > 1024 && eventSwiper != undefined) {
			eventSwiper.destroy();
			eventSwiper = undefined;

			$('.block-list .swiper-wrapper').removeAttr('style');
			$('.block-list .swiper-slide').removeAttr('style');
			$('.block-list .block-list-pagination').remove();
		}
	}
}

// 데이터 찾기 - 목록
function dataConditionChk() {
	var _w = $(window).width();

	if( $('.data-condition-chk').length > 0 ){
		if(_w < 1025 ) {
			$('.data-condition-chk .list').addClass('off');
			$('.data-condition-chk .toggle .btn').off('click');
			$('.data-condition-chk .tit .btn').prop('disabled', false);
			
			$('.data-condition-chk .tit .btn').on('click', function(){
				if( $(this).closest('.condition').find('.list').hasClass('off') ){
					$(this).closest('.condition').find('.list').removeClass('off');
					$(this).closest('.condition').siblings('.condition').find('.list').addClass('off');
				}
				else {
					$(this).closest('.condition').find('.list').addClass('off');
				}
			});
		}
		else if (_w > 1024 ) {
			$('.data-condition-chk .list').removeClass('off');
			$('.data-condition-chk .tit .btn').prop('disabled', true);
			$('.data-condition-chk .tit .btn').off('click');
			
			$('.data-condition-chk .toggle .btn').on('click', function(){
				if( $('.data-condition-chk .list').hasClass('off') ){
					$(this).closest('.data-condition-chk').find('.list').removeClass('off');
					$(this).removeClass('off').find('span').text('조건접기');
				}
				else {
					$(this).closest('.data-condition-chk').find('.list').addClass('off');
					$(this).addClass('off').find('span').text('조건열기');
				}
			});
		}
	}
}


function tableCaption() {
	if( $('.col-table').length > 0 ){
		var _w = $(window).width();
		
		if(_w < 1025 ) {
			$('.col-table').each(function(){
				var captionArry = [];
			
				$(this).find("thead th:not(.just-pc)").each(function(){
					captionArry.push($(this).text());
				});

				$(this).find("caption").text(captionArry+" 항목을 가진 " + $(this).find(".tit-hide").text() +"표 입니다.")
			});
		}
		else if (_w > 1024 ) {
			$('.col-table').each(function(){
				var captionArry = [];
			
				$(this).find("thead th").each(function(){
					captionArry.push($(this).text());
				});

				$(this).find("caption").text(captionArry+" 항목을 가진 " + $(this).find(".tit-hide").text() +"표 입니다.")
			});
		}
	}
	
	if( $('.row-table').length > 0 ){
		$('.row-table').each(function(){
			var captionArry = [];
		
			$(this).find("tbody th .label").each(function(){
				captionArry.push($(this).text());
			});

			$(this).find("caption").text(captionArry+" 항목을 가진 " + $(this).find(".tit-hide").text() +"표 입니다.")
		});
	}

	if( $('.table-area').length > 0 ){
		$('.table-area').each(function(){
			var captionArry = [];
			$(this).find(".map tbody th").each(function(){
				captionArry.push($(this).text());
			});

			$(this).find("caption").text(captionArry+" 항목을 가진 " + $(this).find(".tit em").text() +"표 입니다.")
		});
	}
	
	if( $('.data-table').length > 0 ){
		$('.data-table').each(function(){
			var captionArry = [];
		
			$(this).find("th").each(function(){
				captionArry.push($(this).text());
			});

			$(this).find("caption").text(captionArry+" 항목을 가진 " + $(this).find(".tit-hide").text() +"표 입니다.")
		});
	}
	
	if( $('.bg-inner-table').length > 0 ){
		$('.bg-inner-table').each(function(){
			var captionArry = [];
		
			$(this).find("th").each(function(){
				captionArry.push($(this).text());
			});

			$(this).find("caption").text(captionArry+" 항목을 가진 " + $(this).find(".tit-hide").text() +"표 입니다.")
		});
	}
}


$(function(){
	// 스킵 네비게이션
	$('.skip a').on({
		focus : function(){
			$('.skip').addClass('on');
		},
		blur : function(){
			$('.skip').removeClass('on');
		}
	});
	
	// .button disabled class 이벤트 막음
	$(document).on('click', '.button.disabled', function(e){
		e.preventDefault();
	});
	
	// .pagination disabled class 이벤트 막음
	$(document).on('click', '.pagination .control.disabled', function(e){
		e.preventDefault();
	});
	
	// chk-util
	$('.chk-util').find('[type="checkbox"]').change(function(){
		$leng1 = $(this).closest('.chk-util').find('[type="checkbox"].one-chk').not(':disabled').length;
		$leng2 = $(this).closest('.chk-util').find('[type="checkbox"].one-chk:checked').not(':disabled').length;
		
		if( $(this).hasClass('all-chk') ){
			$(this).closest('.chk-util').find('[type="checkbox"]').not(':disabled').prop('checked', $(this).prop('checked'));
		}
		else {
			if( $leng1 == $leng2 ){
				$(this).closest('.chk-util').find('[type="checkbox"].all-chk').prop('checked', true);
				
			}
			else {
				$(this).closest('.chk-util').find('[type="checkbox"].all-chk').prop('checked', false);
			}
		}
	});
	
	$(window).on('load', function(){
		$('.chk-util').each(function(){
			_this = $(this).find('[type="checkbox"]');
			
			$leng1 = _this.closest('.chk-util').find('[type="checkbox"].one-chk').not(':disabled').length;
			$leng2 = _this.closest('.chk-util').find('[type="checkbox"].one-chk:checked').not(':disabled').length;
			
			if( $leng1 == 0 && $leng2 == 0 ){return false;}
			
			else if( $leng1 == $leng2 ){
				_this.closest('.chk-util').find('[type="checkbox"].all-chk').prop('checked', true);
			}
			else {
				_this.closest('.chk-util').find('[type="checkbox"].all-chk').prop('checked', false);
			}
		})
	});
	
	// 별점주기
	// 2020-03-10 : 웹 접근성 수정
	$(document).on('click', '.score-form .btn-score-star', function(){
		$(this).addClass('on').find('em').text('선택됨');
		$(this).prevAll('.btn-score-star').addClass('on').find('em').text('');
		$(this).nextAll('.btn-score-star').removeClass('on').find('em').text('');
	});
	
	// datepicker
	$.datepicker.setDefaults({
		showOn: 'button',
		buttonText: '날짜 선택',
		//buttonImageOnly: false,
		//showButtonPanel: true,
		currentText: '오늘',
		closeText: '창닫기',
		dateFormat: 'yy-mm-dd',
		prevText: '이전 달',
		nextText: '다음 달',
		monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
		monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
		dayNames: ['일', '월', '화', '수', '목', '금', '토'],
		dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
		dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
		showMonthAfterYear: true,
		yearSuffix: '년',
		changeYear: true,
		changeMonth : true
	});
	$('.datepicker input').datepicker();
	$('.datepicker input:disabled').datepicker( 'option', 'disabled', true );
	//$('.datepicker input').datepicker().datepicker('setDate', new Date()); // 데이터 세팅
	
	// 기간 설정 버튼
	$(document).on('click', '.date-period .btn-date', function(){
		$(this).addClass('on').siblings('.btn-date').removeClass('on');
		
		//https://github.com/iamkun/dayjs/blob/dev/README.md
		var curretDate = dayjs(new Date());
		
		$(this).closest('.date-period').find('.date-to').datepicker('setDate', 'today');
		
		if( $(this).data("period") == "-1M"){
			$(this).closest('.date-period').find('.date-from').datepicker('setDate', curretDate.subtract(1, 'month').add(1,'day').format('YYYY-MM-DD'));
			
		}else if( $(this).data("period") == "-3M"){
			$(this).closest('.date-period').find('.date-from').datepicker('setDate', curretDate.subtract(3, 'month').add(1,'day').format('YYYY-MM-DD'));
		}else{
			$(this).closest('.date-period').find('.date-from').datepicker('setDate', curretDate.subtract(1, 'year').add(1,'day').format('YYYY-MM-DD'));
		}
	});
	// dayjs 샘플
	/*
		// 오늘
		var curretDate = dayjs(new Date());
		console.log(curretDate.format('YYYY-MM-DD'));

		// 한달전
		var month = curretDate.subtract(1, 'month');

		console.log(month.format('YYYY-MM-DD'));

		// 한달 후
		var year = curretDate.subtract(1, 'year');

		console.log(year.format('YYYY-MM-DD'));
	*/
	
	// 툴팁 - 공통
	if( $('.tool-tip').length > 0 ){
		$(document).on('click', 'a.tool-tip', function(e){
			e.preventDefault();
		});
		
		$('.tool-tip').tooltipster({
			trigger: 'click'
		});
	}

/* ==========================================================================
	header
========================================================================== */
	// pc gnb
	$('#gnb > ul.gnb-pc > li > a').on({
		/* 2020-03-10 : nia 이벤트 변경 요청 */
		click : function(e){
			e.preventDefault();
			$(this).closest('li').addClass('on').siblings('li').removeClass('on');
		}
		/*
		focus : function(){
			$(this).closest('li').addClass('on').siblings('li').removeClass('on');
		}
		*/
	});
	
	$(document).on('click', function(e) {
		var activeMenu = $("#header");

		if (activeMenu.find(e.target).length === 0) {
			//activeMenu.find('.on').removeClass('on')
		}
	});
	
	// 모바일 gnb
	//depth2
	$('#gnb > ul.gnb-mb > li.active').find('.depth2').stop().slideDown(0, 'easeInOutExpo');
	
	$(document).on('click', '#gnb > ul.gnb-mb > li > a', function(e){
		if( $(this).next('.depth2').length > 0 ){
			e.preventDefault();
			
			if( $(this).closest('li').hasClass('active') ){
				$(this).closest('li').find('.depth2').stop().slideUp(300, 'easeInOutExpo', function(){
					$(this).closest('li').removeClass('active');
				});
			}
			else {
				$(this).closest('li').find('.depth2').stop().slideDown(300, 'easeInOutExpo');
				$(this).closest('li').siblings('li').find('.depth2').stop().slideUp(300, 'easeInOutExpo');
				$(this).closest('li').addClass('active').siblings('li').removeClass('active');
			}
			
			// $(this).closest('li').siblings('li').find('ul li').removeClass('active');
		}
		else {
			// no event
		}
	});
	//depth3
	$(document).on('click', '#gnb > ul.gnb-mb .arrow > ul > li > a', function(e){
		const btn = $(this).parent();
		if( btn.next('.depth3').length > 0 ){
			e.preventDefault();
			if(btn.hasClass('active')){
				btn.next('.depth3').stop().slideUp(300, 'easeInOutExpo');
				btn.removeClass('active');
			}else{
				btn.next('.depth3').stop().slideDown(300, 'easeInOutExpo');
				btn.next('.depth3').siblings('.depth3').stop().slideUp(300, 'easeInOutExpo');
				btn.addClass('active').siblings('li').removeClass('active');
			}

			// $(this).parent().closest('li').siblings('li').find('ul li').removeClass('active');
		}
		else{
			// no event
		}
	});

	//depth4
	$(document).on('click', '#gnb > ul.gnb-mb .arrow .depth3 > ul > li > a', function(e){
		const btn = $(this).parent();
		if( btn.next('.depth4').length > 0 ){
			e.preventDefault();
			if(btn.hasClass('active')){
				btn.next('.depth4').stop().slideUp(300, 'easeInOutExpo');
				btn.removeClass('active');
			}else{
				btn.next('.depth4').stop().slideDown(300, 'easeInOutExpo');
				btn.next('.depth4').siblings('.depth4').stop().slideUp(300, 'easeInOutExpo');
				btn.addClass('active').siblings('li').removeClass('active');
			}

			// $(this).parent().closest('li').siblings('li').find('ul li').removeClass('active');
		}
		else{
			// no event
		}
	});
	
	// 모바일 gnb 보기
	$(document).on('click', '.btn-open-gnb', function(){
		$('.header-wrap').addClass('on');
		$('body').addClass('no-scroll');
	});
	
	// 모바일 gnb 닫기
	$(document).on('click', '.btn-close-gnb', function(){
		$('.header-wrap').removeClass('on');
		$('body').removeClass('no-scroll');
	});

	// 모바일 페이지 이동
	$(document).on('click', '.page-move .now', function(){
		$(this).closest('.page-move').toggleClass('on');
		$('body').toggleClass('no-scroll');
	});
	

	
/* ==========================================================================
	lnb
========================================================================== */

	/* lnb */
	$('#lnb > ul > li.active').find('ul').stop().slideDown(0, 'easeInOutExpo');

	$(document).on('click', '#lnb .list > li > a , .ulLowerMenu > li > a, .ulLastMenu > li > a', function(e){
		if( $(this).next('ul').length > 0 ){
			e.preventDefault();
			if( $(this).closest('li').hasClass('active')){
				$(this).closest('li').find('ul').stop().slideUp(200, 'easeInOutExpo', function(e){
					// e.preventDefault();
					$(this).closest('li').removeClass('active');
				});
			}
			else {
				if($(this).parent().parent().hasClass('list')){
					$(this).closest('li').find('.ulLowerMenu').stop().slideDown(200, 'easeInOutExpo');
					$(this).closest('li').siblings('li').find('.ulLowerMenu').stop().slideUp(200, 'easeInOutExpo');
					$(this).closest('li').addClass('active').siblings('li').removeClass('active');
				}
				else{
					$(this).closest('li').find('ul').stop().slideDown(200, 'easeInOutExpo');
					$(this).closest('li').siblings('li').find('ul').stop().slideUp(200, 'easeInOutExpo');
					$(this).closest('li').addClass('active').siblings('li').removeClass('active');
				}
			}
		}
		else {
			// no event
		}
	});
	
	
/* ==========================================================================
	상단가기
========================================================================== */
	$(document).on('click', '.btn-go-top', function(e){
		e.preventDefault();
		$('html, body').stop(true,true).animate({scrollTop : 0}, 200, 'easeInOutExpo');
		// 2020-03-10 : 웹 접근성 수정
		if( $('#header').length > 0 ){
			$('#header').find('a, button').first().focus();// 2020-03-10 : 웹 접근성 수정
		}
		
	});
	
	
	
/* ==========================================================================
	데이터 찾기
========================================================================== */
	/* 데이터 찾기 - 상세 */
	blockList();

	
	// 국가데이터맵 - tab filter 클릭
	if( $('.tab-filter').length > 0 ){
		$(document).on('click', '.tab-filter li a', function(e){
			e.preventDefault();
			
			$(this).closest('li').addClass('on').siblings().removeClass('on');
		});
	}
	
	// 국가데이터맵 - 필터영역 보이고 안보이기
	$(document).on('click', '.map-area .filter-section .btn-move', function(){
		$(this).closest('.filter-section').toggleClass('off');
		
		if( $(this).closest('.filter-section').hasClass('off') ){
			$(this).text('필터기능 보기');
			
			$(this).closest('.map-area').find('.graph-section').addClass('large');
		}
		else {
			$(this).text('필터기능 안보기');
			$(this).closest('.map-area').find('.graph-section').removeClass('large');
		}
	});
	
	// 국가데이터맵 - 상세영역 열기
	$(document).on('click', '.map-area .btn-open-detail-section', function(e){
		e.preventDefault();

		$(this).addClass('on');
		
		$(this).closest('.map-area').find('.detail-section').addClass('on');
	});
	
	// 국가데이터맵 - 상세영역 닫기
	$(document).on('click', '.map-area .btn-close-detail-section', function(e){
		e.preventDefault();
	
		$('.map-area .btn-open-detail-section').removeClass('on');

		$(this).closest('.map-area').find('.detail-section').removeClass('on');
	});
	
	// 트리메뉴 목록
	$(".tree-list > ul > li > a").click(function(e){
		e.preventDefault();
		$(this).next().slideToggle();
	});

	// 데이터 정보 열기 닫기
	$(".table-control a").click(function(e){
		e.preventDefault();

		$(this).toggleClass("open");
		if (! $(this).hasClass("open"))
		{
			$(this).text("상세정보 보기");
		}else{
			$(this).text("상세정보 닫기");
		}
		$(this).closest(".table-area").find(".row-table").slideToggle();
	});

	// 국가데이터맵 검색
	searchResult();
	function searchResult(){
		var schResult = $('.search-result')
			, title = schResult.find('.title-area')
			, content = schResult.find('.cont-area');

		title.each(function() {
			var trigger = $(this)
				, answer = trigger.next('.cont-area');

			trigger.on('click', function(){
				if ( trigger.hasClass('on') ) {
					trigger.removeClass('on');
					answer.stop().slideUp(200);
				} else {
					title.not(trigger).removeClass('on');
					trigger.addClass('on');

					content.not(answer).stop().slideUp(200);
					answer.stop().slideDown(200);
				}
			});
		});
		$('.sch-word').click();
	};
	
	
	
	
/* ==========================================================================
	데이터 활용
========================================================================== */
	/* 데이터 시각화 - 그래프 선택 */
	$(document).on('click', '.chart-type-choice .type .toggle button', function(){
		$type = $(this).closest('.type');
		
		if( $type.hasClass('on') ){
			$(this).closest('.type').removeClass('on');
		}
		else {
			$(this).closest('.type').addClass('on').siblings('.type').removeClass('on');
		}
	});
	
	$(document).on('click', '.chart-type-choice .type .col button', function(){
		$(this).closest('.col').addClass('on').siblings('.col').removeClass('on');
	});
	
	/* 국민참여지도, 위치정보 시각화 */
	$('.portal-map-area .btn-toggle-info').on('click', function(){
		$(this).closest('.portal-map-area').toggleClass('off');
	});
	
	/* 샘플 영역 보기 , 닫기 */
	$('.open-thum-sample-view').on('click', function(e){
		e.preventDefault();
		_sample = $(this).closest('.portal-map-area').find('.thum-sample-view');
		
		_sample.show(0, function(){
			_sample.stop(true, true).animate({ left : 399 }, 100, 'easeInOutExpo');
			$(this).closest('.portal-map-area').find('.left-section').addClass('on');
			$(this).closest('.portal-map-area').find('.btn-toggle-info').prop('disabled', true).css('cursor', 'default');
		});
	});
	
	$('.btn-close-thum-sample-view').on('click', function(){
		_sample = $(this).closest('.thum-sample-view');
		
		_sample.stop(true, true).animate({ left : 179 }, 100, 'easeInOutExpo', function(){
			$(this).closest('.portal-map-area').find('.left-section').removeClass('on');
			_sample.css('display', 'none');
			$(this).closest('.portal-map-area').find('.btn-toggle-info').prop('disabled', false).css('cursor', 'pointer');
		});
	});
	
	_map_reply = $('.portal-map-area').find('.map-reply-list');
	_map_topic = $('.portal-map-area').find('.layer-topic-add');
	
	function mapReplyShow() {
		_map_reply.show(0, function(){
			_map_reply.stop(true, true).animate({ left : 399 }, 100, 'easeInOutExpo');
		});
	}
	
	function mapReplyHide() {
		_map_reply.stop(true, true).animate({ left : 179 }, 100, 'easeInOutExpo', function(){
			_map_reply.css('display', 'none');
		});
	}
	
	function mapTopicShow() {
		_map_topic.show(0, function(){
			_map_topic.stop(true, true).animate({ left : 399 }, 200, 'easeInOutExpo');
		});
	}
	
	function mapTopicHide() {
		_map_topic.stop(true, true).animate({ left : -541 }, 200, 'easeInOutExpo', function(){
			_map_topic.css('display', 'none');
		});
	}
	
	// 댓글영역 열기 닫기
	$('.open-view-reply').on('click', function(e){
		e.preventDefault();
		
		mapTopicHide();
		mapReplyShow();
		
		$('.portal-map-area').find('.left-section').addClass('on');
		$('.portal-map-area').find('.btn-toggle-info').prop('disabled', true).css('cursor', 'default');
	});
	
	$('.btn-close-map-reply-list').on('click', function(){
		
		mapReplyHide();
		
		$('.portal-map-area').find('.left-section').removeClass('on');
		$('.portal-map-area').find('.btn-toggle-info').prop('disabled', false).css('cursor', 'pointer');
	});
	
	// 토픽영역 열기, 닫기
	$('.btn-topic-add').on('click', function(e){
		e.preventDefault();
		
		mapReplyHide();
		mapTopicShow();
		
		$('.portal-map-area').find('.left-section').addClass('on');
		$('.portal-map-area').find('.btn-toggle-info').prop('disabled', true).css('cursor', 'default');
	});
	
	$('.btn-close-layer-topic-add').on('click', function(){
		
		mapTopicHide();
		
		$('.portal-map-area').find('.left-section').removeClass('on');
		$('.portal-map-area').find('.btn-toggle-info').prop('disabled', false).css('cursor', 'pointer');
	});



/* ==========================================================================
	활용지원
========================================================================== */
	// 공공데이터 이용가이드
	if( $('.use-guide-swiper').length > 0 ){
		useGuideSwiper = new Swiper('.use-guide-swiper', {
			observer : true,
			observeParents : true,
			simulateTouch : false,
			speed: 300,
			spaceBetween: 0,
			autoHeight: true,
			navigation: {
				prevEl: '.btn-prev',
				nextEl: '.btn-next',
			},
			a11y: {
				prevSlideMessage: '이전 슬라이드',
				nextSlideMessage: '다음 슬라이드',
				firstSlideMessage : '처음 슬라이드 입니다',
				lastSlideMessage : '마지막 슬라이드 입니다',
			},
		});
		
		useGuideSwiper.on('slideChange', function () {
			active_step = useGuideSwiper.activeIndex;
			$('.use-guide-page .step-list-v2 li').eq(active_step).addClass('on').siblings('li').removeClass('on');
		});
	}
	
	if( $('.use-guide-swiper-dataset').length > 0 ){
		useGuideSwiper = new Swiper('.use-guide-swiper-dataset', {
			observer : true,
			observeParents : true,
			simulateTouch : false,
			speed: 300,
			spaceBetween: 0,
			autoHeight: true,
			navigation: {
				prevEl: '.btn-prev',
				nextEl: '.btn-next',
			},
			a11y: {
				prevSlideMessage: '이전 슬라이드',
				nextSlideMessage: '다음 슬라이드',
				firstSlideMessage : '처음 슬라이드 입니다',
				lastSlideMessage : '마지막 슬라이드 입니다',
			},
		});
		
		useGuideSwiper.on('slideChange', function () {
			active_step = useGuideSwiper.activeIndex;
			
			if( active_step == 0 ){
				$('.use-guide-page .step-list-v2 li').eq(0).addClass('on').siblings('li').removeClass('on');
			}
			else if( active_step == 1 ){
				$('.use-guide-page .step-list-v2 li').eq(1).addClass('on').siblings('li').removeClass('on');
			}
			else if( active_step == 2 || active_step == 3 || active_step == 4 ){
				$('.use-guide-page .step-list-v2 li').eq(2).addClass('on').siblings('li').removeClass('on');
			}
		});
	}
	
	if( $('.use-guide-swiper-map').length > 0 ){
		useGuideSwiper = new Swiper('.use-guide-swiper-map', {
			observer : true,
			observeParents : true,
			simulateTouch : false,
			speed: 300,
			spaceBetween: 0,
			autoHeight: true,
			navigation: {
				prevEl: '.btn-prev',
				nextEl: '.btn-next',
			},
			a11y: {
				prevSlideMessage: '이전 슬라이드',
				nextSlideMessage: '다음 슬라이드',
				firstSlideMessage : '처음 슬라이드 입니다',
				lastSlideMessage : '마지막 슬라이드 입니다',
			},
		});
		
		useGuideSwiper.on('slideChange', function () {
			active_step = useGuideSwiper.activeIndex;
			
			if( active_step == 0 ){
				$('.use-guide-page .step-list-v2 li').eq(0).addClass('on').siblings('li').removeClass('on');
			}
			else if( active_step == 1 || active_step == 2 ){
				$('.use-guide-page .step-list-v2 li').eq(1).addClass('on').siblings('li').removeClass('on');
			}
			else if( active_step == 3 || active_step == 4 || active_step == 5 ){
				$('.use-guide-page .step-list-v2 li').eq(2).addClass('on').siblings('li').removeClass('on');
			}
		});
	}

	if( $('.use-guide-swiper-api').length > 0 ){
		useGuideSwiper = new Swiper('.use-guide-swiper-api', {
			observer : true,
			observeParents : true,
			simulateTouch : false,
			speed: 300,
			spaceBetween: 0,
			autoHeight: true,
			navigation: {
				prevEl: '.btn-prev',
				nextEl: '.btn-next',
			},
			a11y: {
				prevSlideMessage: '이전 슬라이드',
				nextSlideMessage: '다음 슬라이드',
				firstSlideMessage : '처음 슬라이드 입니다',
				lastSlideMessage : '마지막 슬라이드 입니다',
			},
		});
		
		useGuideSwiper.on('slideChange', function () {
			active_step = useGuideSwiper.activeIndex;
			
			if( active_step == 0 ){
				$('.use-guide-page .step-list-v2 li').eq(0).addClass('on').siblings('li').removeClass('on');
			}
			else if( active_step == 1 || active_step == 2 ){
				$('.use-guide-page .step-list-v2 li').eq(1).addClass('on').siblings('li').removeClass('on');
			}
			else if( active_step == 3 ){
				$('.use-guide-page .step-list-v2 li').eq(2).addClass('on').siblings('li').removeClass('on');
			}
			else if( active_step == 4 ){
				$('.use-guide-page .step-list-v2 li').eq(3).addClass('on').siblings('li').removeClass('on');
			}
		});
	}
	
	/* 자주하는 질문 or 목록 toggle */
	$(document).on('click', '.col-table.view-toggle .open-view', function(e){
		e.preventDefault();
		
		if( $(this).closest('tr').next('tr').hasClass('on') ){
			$(this).closest('tbody').find('.open-view').removeClass('on');

			$(this).closest('tbody').find('tr.tr-view').removeClass('on');
		}
		else {
			$(this).closest('tbody').find('.open-view').removeClass('on');
			$(this).addClass('on');
			
			$(this).closest('tbody').find('tr.tr-view').removeClass('on');
			$(this).closest('tr').next('tr.tr-view').addClass('on');
		}
	});

	$(document).on('click', '.col-table.view-toggle .close-view', function(e){
		e.preventDefault();

		$(this).closest('tr.tr-view').removeClass('on');
		$(this).closest('tr').prev('tr').find('.open-view').removeClass('on');
		
	});

/* ==========================================================================
	이용안내
========================================================================== */
	/* 이용약관, 개인정보 처리방침 */
	$(document).on('click', '.policy-wrap ul > li > .title', function(e){
		if( $(this).closest('li').hasClass('on') ){
			$(this).closest('li').removeClass('on');
		}
		else {
			$(this).closest('li').addClass('on');
			$('.policy-wrap ul > li').not($(this).closest('li')).removeClass('on');
		}
	});

	$(document).on('click', '.cnt_list > li', function(e){
		console.log($(`#${$(this).data('policy')}`).closest('.policy-text'));
		$(`#${$(this).data('policy')}`).click();
		$(`#${$(this).data('policy')}`).next().focus();
	});


/* ==========================================================================
	resize 이벤트
========================================================================== */
	$(window).resize(function(){
		dataConditionChk();
		blockList();
		tableCaption();
	}).resize();
	
	
	
/* ==========================================================================
	탭
========================================================================== */
	// tab layer
	$(document).on('click', '.tab-layer a', function(e){
		e.preventDefault();




		_hrefLeng = $($(this).attr('href')).length;
		$(this).closest('li').addClass('on').siblings('li').removeClass('on');

		if( _hrefLeng > 0 ){
			$($(this).attr('href')).closest('.tab-wrap').find('.tab-cont').removeClass('on');
			$($(this).attr('href')).addClass('on');
			$(this).closest('.tab-layer').find('a').removeAttr('title');
			// $('.tab-layer a').removeAttr('title');
			$(this).prop("title","선택됨");

			$($(this).attr('href')).find('.ir').text($(this).text()+' 탭 화면 입니다.');
		}
	});
	
	// tab list sorting
	$(document).on('click', '.tab-list.sort a', function(e){
		if( $(this).closest('li').hasClass('link') ){
			// 이벤트없음 
		}
		else {
			e.preventDefault();
			$(this).closest('li').addClass('on').siblings('li').removeClass('on');
		}
	});


/* ==========================================================================
	데이터 요청
========================================================================== */
	/* 데이터 1번가 - 개방 요청하기 플로팅 버튼 */
	if ($('.request-float-btn').length > 0){
		requestFloatBtn();

		function requestFloatBtn() {
			if($(window).scrollTop() + $(window).height() >= $("#application-btn").offset().top) {
				$(".request-float-btn").addClass("off");
			} else {
				$(".request-float-btn").removeClass("off");
			}
		}
		$(window).scroll(function() {
			requestFloatBtn();
		});
	}
	
	
	/* 기관검색 리스트 */
	$(document).on('click', '.list-agency .title-area .arr', function(e){
		if( $(this).closest('.title-area').hasClass('no-detail') ){
			// 이벤트없음 
		}
		else {
			e.preventDefault();

			if( $(this).closest('.title-area').hasClass('on') ){
				$(this).closest('li').find('.title-area').removeClass('on');

				$(this).closest('li').find('.detail-area').removeClass('on');
			}
			else {
				$('.list-agency').find('.title-area').removeClass('on');
				$(this).closest('.title-area').addClass('on');

				$('.list-agency').find('.detail-area').removeClass('on');
				$(this).closest('.title-area').next('.detail-area').addClass('on');
			}
		}
	});
	
	if ($('.data-slider').length > 0)
	{
		var handle = $('.custom-handle' );
		
		$( '.data-slider' ).slider({
			create: function() {
				// handle.text( $( this ).slider('value') ); 2020-02-26 고객요청으로 인한 삭제
			},
			slide: function( event, ui ) {
				// handle.text( ui.value ); 2020-02-26 고객요청으로 인한 삭제
			},
			range: 'min',
			min: 0.000,
			max: 1.000,
			step: 0.001,
			value: 0.675
		});
	}
});






































// 김슬비작업

//리스트 카테고리
$(function(){
	$('.btn-toggle').click(function(e){
	    e.preventDefault();
		$('.toggle-slide-area').slideToggle();
	    $(this).toggleClass( 'open' );

		if( $(this).hasClass('btn-detail') ){
			$(this).find('span').text( $(this).find('span').text() == '상세검색 닫기' ? "상세검색 열기" : "상세검색 닫기");
		}else{
			$(this).find('span').text( $(this).find('span').text() == '카테고리 닫기' ? "카테고리 열기" : "카테고리 닫기");
		}
	   
	});
	
	$('.list-cate-area button').on('click', function(){
		$(this).toggleClass( 'on' );
	});
	
	$('.list-cate-wrap .btn-all-chk').on('click', function(){
		$('.list-cate-area button').addClass('on');
	});
	
	$('.list-cate-wrap .btn-reset').on('click', function(){
		$('.list-cate-area button').removeClass('on');
	});
	
	$('a.t-close').on('click',function(e){
		e.preventDefault();
		//console.log('dd');
		$(this).parents('.t-popup').css({display:"none"});
	})//click  t-popup close 
	
	/*drag*/
	
	/*20200413*/
	setDrag('.t-popup.t-0');/*드래그 창 부모*/
	setDrag('.t-popup.t-1');/*드래그 창 부모*/
	setDrag('.t-popup.t-2');/*드래그 창 부모*/
	setDrag('.t-popup.t-3');/*드래그 창 부모*/
	
	function setDrag(selector) {
    var startX = 0;
    var startY = 0;
    var delX = 0;
    var delY = 0;
    var offsetX = 0;
    var offsetY = 0;
    var isClickAllowed = true;

    $(selector).on('mousedown', function(e) {
        startX = e.clientX;
        startY = e.clientY;
        offsetX = $(selector).position().left;
        offsetY = $(selector).position().top;
        $(document).on('mousemove', function(e) {
            e.preventDefault();
            delX = e.clientX - startX;
            delY = e.clientY - startY;
            $(selector).css({'left': (offsetX + delX) + 'px', 'top': (offsetY + delY) + 'px'});
            if (Math.abs(delX) > 10 || Math.abs(delY) > 10) isClickAllowed = false;
        });
        $(document).on('mouseup', function(e) {
            $(document).off('mousemove mouseup');
        });
	    }).on('click', function(e) {
	        if (isClickAllowed === false) {
	            e.preventDefault();
	            isClickAllowed = true;
	        }
	    });
	}

});
	







