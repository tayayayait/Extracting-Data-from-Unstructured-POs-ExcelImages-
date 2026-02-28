/**
 * 에러신고 처리 스크립트
 * 
 * @author kms
 * @since 2020.02.03
 *
 */

/**
 * 데이터개선 팝업 호출
 *
 * @param mberId : 회원ID
 * @param dpk : publicDataPK
 * @param ddpk : publicDataDetailPk
 */
function fn_callDataImproveReportPopup(mberId, dataTy, dpk, ddpk, adpk) {


	if(fn_empty(dataTy) || fn_empty(dpk) || fn_empty(ddpk))	return;

	//비로그인 사용자는 사용 불가능 기능
	if(fn_empty(mberId)){
		if(confirm("로그인이 필요한 기능입니다. 로그인 화면으로 이동하시겠습니까?")){
			location.href = "/uim/login/loginView.do";
			return;
		};
		return;
	}

	var $errorReportPopup = $('<div class="layer_error_div"></div>');

	//데이터 셋 화면에 붙일 class 지정
	if($(".layer_error_div").length > 0 || $("#layer_error_report").length > 0){
		$('#layer_error_report').remove();
		$('.layer_error_div').remove();
		$(".data-search-view").append($errorReportPopup);
	}else{
		$(".data-search-view").append($errorReportPopup);
	}

	if (dataTy === 'V' && !fn_empty(adpk)) { //표준데이터 오류신고시
		ddpk = adpk;
	}

	//팝업 호출
	$.ajax({
		type:"POST",
		url: "/tcs/dss/insertDataImproveReqstPopupView.do",
		data : {dataTy: dataTy,
			publicDataPk : dpk,
			publicDataDetailPk : ddpk,
			publicDataTy : dataTy},
		dataType : "html",
		success: function(html){
			$(".layer_error_div").empty();
			$(".layer_error_div").append(html);
			$("#layer_error_report").modal("open");
		},
		error: function(xhr, status, error) {
			alert("팝업 호출에 실패하였습니다.");
		}
	});
};


/**
 * 오류신고 팝업 호출
 * 
 * @param mberId : 회원ID
 * @param dpk : publicDataPK
 * @param ddpk : publicDataDetailPk
 */
function fn_callErrorReportPopup(mberId, dataTy, dpk, ddpk, adpk) {
	
	
	if(fn_empty(dataTy) || fn_empty(dpk) || fn_empty(ddpk))	return;
	
	//비로그인 사용자는 사용 불가능 기능
	if(fn_empty(mberId)){
		if(confirm("로그인이 필요한 기능입니다. 로그인 화면으로 이동하시겠습니까?")){
			location.href = "/uim/login/loginView.do";
			return;
		};
		return;
	}
	
	var $errorReportPopup = $('<div class="layer_error_div"></div>');
	
	//데이터 셋 화면에 붙일 class 지정
	if($(".layer_error_div").length > 0 || $("#layer_error_report").length > 0){
		$('#layer_error_report').remove();
		$('.layer_error_div').remove();	
		$(".data-search-view").append($errorReportPopup);
	}else{
		$(".data-search-view").append($errorReportPopup);
	}

	if (dataTy === 'V' && !fn_empty(adpk)) { //표준데이터 오류신고시
		ddpk = adpk;
	}
	
	//팝업 호출
	$.ajax({
		type:"POST",
		url: "/tcs/dss/insertErrorReportPopupView.do",
		data : {dataTy: dataTy,
			    publicDataPk : dpk,
				publicDataDetailPk : ddpk,
				publicDataTy : dataTy}, 
		dataType : "html",
		success: function(html){
			$(".layer_error_div").empty();
			$(".layer_error_div").append(html);				
			$("#layer_error_report").modal("open");
		},
		error: function(xhr, status, error) {
			alert("팝업 호출에 실패하였습니다.");
		}	
	});
};

/**
 * 오류신고 팝업 닫기
 */
function fn_closeErrorReportPopup(){
	$.modal.close();
	$('#layer_error_report').remove();
	$('.layer_error_div').remove();	
}


/**
 * 오류신고 팝업 호출 - 영문
 *
 * @param mberId : 회원ID
 * @param dpk : publicDataPK
 * @param ddpk : publicDataDetailPk
 */
function fn_callErrorReportPopup_en(mberId, dataTy, dpk, ddpk, adpk) {


	if(fn_empty(dataTy) || fn_empty(dpk) || fn_empty(ddpk))	return;

	//비로그인 사용자는 사용 불가능 기능
	if(fn_empty(mberId)){
		if(confirm("This feature requires login. Do you want to go to the login screen?")){		//임의번역[강병구]
			location.href = "/en/uim/login/loginView.do";
			return;
		};
		return;
	}

	var $errorReportPopup = $('<div class="layer_error_div"></div>');

	//데이터 셋 화면에 붙일 class 지정
	if($(".layer_error_div").length > 0 || $("#layer_error_report").length > 0){
		$('#layer_error_report').remove();
		$('.layer_error_div').remove();
		$(".data-search-view").append($errorReportPopup);
	}else{
		$(".data-search-view").append($errorReportPopup);
	}

	if (dataTy === 'V' && !fn_empty(adpk)) { //표준데이터 오류신고시
		ddpk = adpk;
	}

	//팝업 호출
	$.ajax({
		type:"POST",
		url: "/en/tcs/dss/insertErrorReportPopupView.do",
		data : {dataTy: dataTy,
			publicDataPk : dpk,
			publicDataDetailPk : ddpk,
			publicDataTy : dataTy},
		dataType : "html",
		success: function(html){
			$(".layer_error_div").empty();
			$(".layer_error_div").append(html);
			$("#layer_error_report").modal("open");
		},
		error: function(xhr, status, error) {
			alert("Pop-up call failed.");			//임의번역[강병구]
		}
	});
};