/**
 * 공통 팝업 관련 스크립트
 * 
 * @author kms
 * @since 2019.12.02
 *
 */

	/**
	 * 
	 * 기관 선택 팝업 호출
	 * 
	 * popupSearchTyClChangeAt : 유형_분류_대_변경여부['Y'-타 유형 검색 가능, 'N'-해당 유형만 검색가능] 
	 * popupSearchTyClLrge     : 유형_분류_대                                        
	 * popupSearchCustomGubunCode : 메인창에서 호출시 구분코드[한 화면에서 기관 선택팝업 2군데 이상 호출 시 구분값 전달용]
	 * popupSearchProvdReqstPosblAt: 데이터 제공요청 신청 가능여부
     * popupSearchMultiSelectAt : 다건 선택 가능여부                  
	 * 
	 */
	function fn_callInsttListPopup(param) {
		
		var $insttListPopup = $('<div class="layer_instt_div"></div>');
		
		if($(".layer_instt_div").length > 0){
			$('#layer_instt_search').remove();
			$('.layer_instt_div').remove();	
 		}
		
		if($("#contents").length > 0){
			$("#contents").append($insttListPopup);
		}
		
		//popupSearchTyClChangeAt이 N이고 유형분류가 빈값일 경우, popupSearchTyClChangeAt를 Y로 강제로 변경
		if(param.tyClChangeAt == "N" && fn_empty(param.tyClLrge)){
			param.tyClChangeAt = "Y";
		}
		
		//데이터제공요청 가능여부 설정
		if(fn_empty(param.provdReqstPosblAt)){
			param.provdReqstPosblAt = "N";
		}
		
		$.ajax({
			type:"POST",
			url: "/cmm/cmm/selectInsttListPopupView.do",
 			data : { popupSearchTyClChangeAt : param.tyClChangeAt
				   , popupSearchTyClLrge : param.tyClLrge
				   , popupSearchCustomGubunCode : param.customGubunCode
				   , popupSearchProvdReqstPosblAt : param.provdReqstPosblAt
				   , popupSearchMultiSelectAt : param.multiSelectAt
 				   }, 
			dataType : "html",
			success: function(html){
				$(".layer_instt_div").empty();
				$(".layer_instt_div").append(html);				
				$("#layer_instt_search").modal("open");
			},
			error: function(xhr, status, error) {
				alert("팝업 호출에 실패하였습니다.");
			}	
		});
	};
	
	/**
	 * 기관 선택 팝업 닫기
	 */
	function fn_closeInsttListPopup(){
		$.modal.close();
		$('#layer_instt_search').remove();
		$('.layer_instt_div').remove();	
	}

 
	/**
	 * 
	 * BRM분류 팝업
	 * callback함수 : fn_brmCallback(resultParam) 
	 * 
	 * 결과값  
	 * resultParam.brmCode
	 * resultParam.brmNm
	 * resultParam.upperBrmCode
	 * resultParam.upperBrmNm 	
	 * 
	 */
	function fn_callBrmPopup(){
		
		var $brmPop = $('<div class="layer_brm_div"></div>');
		$("#contents").append($brmPop);
		
		$.ajax({
			type:"POST",
			url: "/lms/drm/selectBrmPopup.do",
			dataType : "html",
			success: function(html){
				$(".layer_brm_div").empty();
				$(".layer_brm_div").append(html);				
				$("#layer_brm").modal("open");
			},
			error: function(xhr, status, error) {
				alert("팝업 호출에 실패하였습니다.");
			}	
		});
	}
 