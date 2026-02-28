/**
 * 공통 코드 조회하여 selectBox에 세팅
 * 
 * @author kms
 * @since 2019.10.29
 *
 */

$(function() {
    $.fn.commonCode = function(options) {
    	
        return this.each(function() {
            var opts = $.extend({}, $.fn.commonCode.defaults, options)
            var $self = $(this);
       
            if(opts.childObj){
            	$self.change(function(e){
            		childSelectCode(this);
            	});
            }

            if(opts.onChangeFn){
            	$self.change(function(e){
            		 opts.onChange(this);
            	});
            }
            
            if(opts.loadData){
            	selectCode();
            }else{
            	$self.get(0).options.length=0;
            	var addMOption = "<option value=''>"+opts.defaltValue+"</option>";
    			$self.append(addMOption);
            }
            
           
          //본인이 변경되었을때
            function selectCode(){ 
            	var param = [
    	  			{ name : 'codeId', value : opts.codeId },
    	  			{ name : 'code', value : opts.code },
    	  			{ name : 'remk', value : opts.remk }
    	  		];
            	if(opts.codeSelectUrl == null || opts.codeSelectUrl == "") return false;
            	$.ajax({
         			type: "POST",
         			url: opts.codeSelectUrl,
         			data: param,
         			dataType: 'json',
         			success: function(data){
         				setDataSetting(data);
         				if(opts.childObj){
         					if(opts.childFirstSelect && opts.isChildSeletedValue){
              					var sLength = $self.get(0).options.length;
              					if(sLength > 0){
              						$self.find("option:selected").prop("selected", "selected").change();
              					}
              				}
         				 }
         				
         				if(opts.onLoad){
         					opts.onLoad();
         				}
         			},
         			error: function(xhr, textStatus, error) {
         				alert(error);
         			}
         		});
            }
           
            function setDataSetting(data){ //데이터 바인딩
            	
            	if(data.codeList){
            		$self.get(0).options.length=0;
            		
            		if(opts.selectAll){
            			var addMOption = "<option value='"+opts.selectAllData+"'>"+opts.selectAllValue+"</option>";
            			$self.append(addMOption);
            		}
            		
            		var chk = false;
            		$.each(data.codeList, function(index, entry) {
            			
            			var selected = "";
            			var extOtpAttr = "";
            			if(entry.code == opts.dataValue) {
            				selected="selected";
            				chk = true;
            			} 
            			if(opts.optModel.extAttr != '' && entry[opts.optModel.extAttr]) extOtpAttr = " "+opts.optModel.extAttr+"='"+entry[opts.optModel.extAttr]+"'";
            			
            			var addOption = "<option value='"+entry[opts.optModel.opt]+"'  "+selected+" "+extOtpAttr+" >"+entry[opts.optModel.value]+"</option>";
            			$self.append(addOption);
            		});
            		
            		if(!chk) $("this > option:eq(0)").prop("selected", "selected");
            		
            		childSelectCode($self);
            	}
            }
            
            //자식이 변경되었을때
            function childSelectCode(obj){
            	var selData = $(obj).val();
            	if(selData == "") {
            		for(var i = 0; i<opts.childObj.length;i++){
            			$("#"+opts.childObj[i]).get(0).options.length=0;
            			
            			//부모가 전체''일때 자식이 전체이면 childselectAllValue값으로 설정
            			if(opts.childSelectAll){
                			var addMOption = "<option value=''>"+opts.childselectAllValue+"</option>";
                			$("#"+opts.childObj[i]).append(addMOption);
                		}
            			
            			//부모가 전체''일때 자식이 전체값이 없으면 비활성화
            			if(!opts.childSelectAll){
            				$("#"+opts.childObj[i]).attr("disabled", true);
            			}
            		}
            		return;
            	}else{
        			//부모를 전체가 아닌 특정값으로 설정하면 자식 활성화            		
            		for(var i = 0; i<opts.childObj.length;i++){
            			$("#"+opts.childObj[i]).removeAttr("disabled");
            		}
            	}
            	
            	var childCodeId = opts.childCodeId;
            	if(opts.childCodeId == undefined || opts.childCodeId == ""){
            		childCodeId = selData;
            		selData = "";
            	}
            	
            	var param = [
     	  			{ name : 'codeId', value : childCodeId },
     	  			{ name : 'code', value : selData }
     	  		];
            	
            	var url = opts.codeSelectUrl;
            	if(opts.childCodeSelectUrl != null && opts.childCodeSelectUrl != "")  url = opts.childCodeSelectUrl;

             	$.ajax({
          			type: "POST",
          			url: url,
          			data: param,
          			dataType: 'json',
          			success: function(data){
          				setChildDataSetting(data);
          				$("#"+opts.childObj[0]).focus();
          				if(opts.childFirstSelect){
          					var sLength = $("#"+opts.childObj[0]).get(0).options.length;
          					if(sLength > 0){
          						if(opts.childDataValue == "") $("#"+opts.childObj[0]).find("option:eq(1)").prop("selected", "selected").change();
          					}
          				}
          			},
          			error: function(xhr, textStatus, error) {
          				alert(error);
          			}
          		});
             	
            }
            
            
            //데이터 바인딩
            function setChildDataSetting(data){
            	if(data.codeList){
            		for(var i = 0; i<opts.childObj.length;i++){
            			$("#"+opts.childObj[i]).get(0).options.length=0;
            			if(opts.childSelectAll){
                			var addMOption = "<option value=''>"+opts.childselectAllValue+"</option>";
                			$("#"+opts.childObj[i]).append(addMOption);
                		}
            		}
            	
            		var chk = false;
              		var i = selectedi = 1;
            		if(!opts.childSelectAll){
            			i = selectedi = 0;
            		}

            		if(data.codeList.length > 0){
	            		$.each(data.codeList, function(index, entry) {
	            			if(opts.optModel.extAttr != '' && entry[opts.optModel.extAttr]){
	            				extOtpAttr = " "+opts.optModel.extAttr+"='"+entry[opts.optModel.extAttr]+"'";
	            			}
	            			var selected = "";
	            			if(entry.code == opts.childDataValue) {
	            				selected="selected";
	            				chk = true;
	            				selectedi = i;
	            			} 
	            			
	            			var addOption = "<option value='"+entry[opts.optModel.opt]+"' "+selected+" >"+entry[opts.optModel.value]+"</option>";
	            			$("#"+opts.childObj[0]).append(addOption);
	            			i++;
	            		});
	            		
	            		if(!chk) $("#"+opts.childObj[0]).find("option:eq(0)").prop("selected", "selected");
	            		else $("#"+opts.childObj[0]).find("option:eq("+selectedi+")").prop("selected", "selected").change();
	            		
	            		$("#"+opts.childObj[0]).removeProp("disabled");
            		}else{
            			if(!opts.childSelectAll){
	            			var addMOption = "<option value=''>없음</option>";
	            			$("#"+opts.childObj[i]).append(addMOption);
            			}
            			$("#"+opts.childObj[0]).prop("disabled", true);
            		}
            		
            	}else{
            		var addMOption = "<option value=''>코드조회 오류</option>";
        			$("#"+opts.childObj[i]).append(addMOption);
        			$("#"+opts.childObj[0]).prop("disabled", true);
            	}
            }
            
          
        });
        
        
    };
    
    $.fn.commonCode.defaults = {
    	//settingValue
    	codeSelectUrl:"", 		//코드 받을 url
    	childCodeSelectUrl:"", 	//자식코드 받을 url
    	codeId:"",	  		    //코드구분값
    	code:"",				//코드
    	remk:"",				//비고
    	dataValue:"",			//기본
    	childObj:"",			//동적일때["",""]
    	childCodeClcd:"",		//자식분류코드구분값
    	childCodeId:"",		    //자식코드구분값
    	selectAll:true,			//전체추가 여부
    	childSelectAll:true,	//자식 전체추가 여부
    	loadData:true,			//데이터불러올지
    	childFirstSelect:false, //자식 첫번째 선택여부
    	isChildSeletedValue:false, //자식초기값이 존재하지않을경우
    	childDataValue:"",			//기본

    	defaltValue:"--------",
    	selectAllValue:"전체",
    	selectAllData:"",
    	childselectAllValue:"전체",
    	optModel : {opt:'code', value : 'codeNm', extAttr:''},
    	onChangeFn:false,
    	onChange: function() {},
    	onLoad:null
    }
});

//표준공통코드
function fn_setSelectBox(obj, contextRoot, strCodeId, strDataValue, bSelectAll, strSelectAllValue, strSelectAllData, strRemk){
	$('#'+obj).commonCode({
    	codeSelectUrl:contextRoot+"/cmm/cmm/selectCommonCodeSelectboxList.json",
    	codeId:strCodeId,
    	dataValue:strDataValue,
    	selectAll:bSelectAll,
    	selectAllValue:strSelectAllValue,
    	selectAllData:strSelectAllData,
    	remk:strRemk
	});
}

//표준공통코드 함수추가
function fn_setSelectBoxWithOnLoad(obj, contextRoot, strCodeId, strDataValue, bSelectAll, strSelectAllValue, fnOnLoad){
	$('#'+obj).commonCode({
    	codeSelectUrl:contextRoot+"/cmm/cmm/selectCommonCodeSelectboxList.json",
    	codeId:strCodeId,
    	dataValue:strDataValue,
    	selectAll:bSelectAll,
    	selectAllValue:strSelectAllValue,
    	onLoad:fnOnLoad
	});
}

//표준공통코드-2단계
function fn_setSelectBoxWithChild(param){
	$('#'+param.obj).commonCode({
		codeSelectUrl:param.contextRoot+"/cmm/cmm/selectCommonCodeSelectboxList.json",
		codeId:param.strCodeId,
    	dataValue:param.strDataValue,
    	selectAll : param.bSelectAll,
  		childObj:param.childObj,
  		childSelectAll:param.bChildSelectAll,
    	selectAllValue:param.strSelectAllValue,
    	childselectAllValue: param.strChildselectAllValue,
  		isChildSeletedValue:false,
  		childFirstSelect:false,
  		childDataValue:param.strDataChildValue
	});
}

//BRM 코드_대분류
function fn_setSelectBoxBrm(obj, contextRoot, strDataValue, bSelectAll){
	$('#'+obj).commonCode({
    	codeSelectUrl:contextRoot+"/cmm/cmm/selectBrmCodeList.json",
//    	codeId:"BRLC",
    	dataValue:strDataValue,
    	selectAll:bSelectAll
	});
}

//BRM 코드_소분류
function fn_setSelectBoxBrmSclas(obj, contextRoot, strDataValue, strDataChildValue, bSelectAll, childObj){
	$('#'+obj).commonCode({
		codeSelectUrl:contextRoot+"/cmm/cmm/selectBrmCodeList.json",
    	codeId:"BRLC",
  		childObj:childObj,
  		childCodeId:"BR",
  		dataValue:strDataValue,
  		selectAll:bSelectAll,
  		childSelectAll:bSelectAll,
  		isChildSeletedValue:false,
  		childFirstSelect:false,
  		childDataValue:strDataChildValue
	});
}

//기관유형_대분류
function fn_setSelectBoxInsttTy(obj, contextRoot, strDataValue, bSelectAll, strSelectAllData){
	$('#'+obj).commonCode({
    	codeSelectUrl:contextRoot+"/cmm/cmm/selectInsttCodeSelectBoxList.json",
    	codeId:"IL",
    	dataValue:strDataValue,
    	selectAll:bSelectAll,
    	selectAllData:strSelectAllData
	});
}

//기관유형_대-중분류
function fn_setSelectBoxInsttTy2Step(param){
	
	$('#'+param.obj).commonCode({
    	codeSelectUrl:param.contextRoot+"/cmm/cmm/selectInsttCodeSelectBoxList.json",
    	codeId:"IL",
    	dataValue:param.strDataValue,
    	selectAll : param.bSelectAll,
  		childObj:param.childObj,
  		childCodeId:"IM",
  		childSelectAll:param.bChildSelectAll,
    	selectAllValue:param.strSelectAllValue,
    	childselectAllValue: param.strChildselectAllValue,
  		isChildSeletedValue:false,
  		childFirstSelect:false,
  		childDataValue:param.strDataChildValue
	});
}

//기관유형_대-중분류
function fn_setSelectBoxInsttTy2StepOnload(obj, contextRoot, strDataValue, bSelectAll, childObj, strDataChildValue, fnOnLoad){
	$('#'+obj).commonCode({
    	codeSelectUrl:contextRoot+"/cmm/cmm/selectInsttCodeSelectBoxList.json",
    	codeId:"IL",
    	dataValue:strDataValue,
    	selectAll : bSelectAll,
  		childObj:childObj,
  		childCodeId:"IM",
  		childSelectAll:bSelectAll,
  		isChildSeletedValue:false,
  		childFirstSelect:false,
  		childDataValue:strDataChildValue,
    	onLoad:fnOnLoad
	});
}

//상위메뉴
function fn_setSelectBoxUpperMenu(obj, contextRoot, strDataValue, bSelectAll){
	$('#'+obj).commonCode({
    	codeSelectUrl:contextRoot+"/cmm/cmm/selectMenuSelectBoxList.json",
    	codeId:"highUpper",
    	dataValue:strDataValue,
    	selectAll : bSelectAll
	});
}

//메뉴_최상위메뉴-상위메뉴
function fn_setSelectBoxMenu2Step(obj, contextRoot, strDataValue, bSelectAll, childObj, strDataChildValue){
	$('#'+obj).commonCode({
    	codeSelectUrl:contextRoot+"/cmm/cmm/selectMenuSelectBoxList.json",
    	codeId:"highUpper",
    	dataValue:strDataValue,
    	selectAll : bSelectAll,
  		childObj:childObj,
  		childCodeId:"upper",
  		childSelectAll:bSelectAll,
  		isChildSeletedValue:false,
  		childFirstSelect:false,
  		childDataValue:strDataChildValue
	});
}

//메뉴_상위메뉴
function fn_setSelectBoxLowerMenu(obj, contextRoot, upperMenuId, strDataValue, bSelectAll){
	$('#'+obj).commonCode({
    	codeSelectUrl:contextRoot+"/cmm/cmm/selectMenuSelectBoxList.json",
    	codeId:"upper",
    	code:upperMenuId,
    	dataValue:strDataValue,
    	selectAll : bSelectAll
	});
}

function fn_setReprsntSvcList(obj, contextRoot, strCodeId, strDataValue, bSelectAll, strSelectAllValue, strSelectAllData){

	$('#'+obj).commonCode({
    	codeSelectUrl:contextRoot+"/cmm/cmm/selectReprsntSvcList.json",
    	codeId:strCodeId,
    	dataValue:strDataValue,
    	selectAll:bSelectAll,
    	selectAllValue:strSelectAllValue,
    	selectAllData:strSelectAllData
	});
}

/**
 * 코드 조회하여 checkbox에 세팅
 * 
 * @param
 * 1. (필수)objId : checkbox가 삽입될 요소 id
 * 2. (필수)name : checkbox name 
 * 3. contextRoot : contextRoot
 * 4. url : 코드를 조회해올 url
 * 5. selectAll : 코드 외 전체 checkbox 추가 유무
 * 6. selectAllData : 코드 외 전체 checkbox의 값
 * 7. selectedDataList : 선택되어야하는 코드값(리스트/배열 형태)
 * 8. codeId, code, remk : 코드 검색조건
 * 9. callback  : 완료 후 실행될 callback함수
 * 
 */

function fn_setCheckboxCmmnCode(param){

	if(fn_empty(param.objId))	return;
	if(fn_empty(param.name))	return;
	
	var objId = param.objId;
	var name = param.name;
	var contextRoot = param.contextRoot;
	if(fn_empty(param.contextRoot))	contextRoot = "";
	var url = contextRoot + param.url;
	if(fn_empty(param.url))	url = contextRoot+"/cmm/cmm/selectCommonCodeSelectboxList.json";
	var selectAll = param.selectAll;
	if(fn_empty(param.selectAll))	selectAll = false;
	var selectAllData = param.selectAllData;
	if(fn_empty(param.selectAllData))	selectAllData = "";
	var selectAllValue = "전체";
	var selectedDataList = param.selectedDataList;
	var callback = param.callback;
	var param = [
			{ name : 'codeId', value : param.codeId },
			{ name : 'code', value : param.code },
			{ name : 'remk', value : param.remk }
		];
	
	var tag = "";
		
	$.ajax({
			type: "POST",
			url: url,
			data: param,
			dataType: 'json',
			success: function(data){
				
				if(data.codeList){
					
					var checked = "";
        		
					//'전체'요소 추가 시 
	        		if(selectAll){
	        			if(selectedDataList.length == 0){
	        				checked = "checked";
	        			}	        	
	        			tag += "<span class='bg-chk all-chk'>";
	        			tag += "<input type='checkbox' id='"+name+"_"+selectAllData+"' name='"+name+"' value='"+selectAllData+"' "+checked+">";	        						
	        			tag += "<label for='"+name+"_"+selectAllData+"'>" +selectAllValue+"</label>";
	        			tag += "</span>";	        			
	        		}
	        		
	        		checked = "";
	        		
	        		//공통코드 리스트
	        		$.each(data.codeList, function(index, entry) {
	        			
	        			//선택데이터 리스트
	       				$.each(selectedDataList, function(idx, selectedData) {
	               			if(entry.code == selectedData) {
	               				checked="checked";
	               				return false;
	               			}else{
	               				checked = "";
	               			}
	               		});
	       				
	       				//체크박스 tag
	       				tag += "<span class='bg-chk one-chk'>";
	        			tag += "	<input type='checkbox' id='"+name+"_"+index+"' name='"+name+"' value='"+entry.code+"' "+checked+">";
	        			tag += "	<label for='"+name+"_"+index+"'>"+entry.codeNm+"</label>";
	        			tag += "</span>";
	        			
	        		});
	        		
	        		$("#"+objId).append(tag);
	        	}
				
				if( callback != undefined ) {
					callback($("#"+objId));
				}
				
			},
			error: function(xhr, textStatus, error) {
				alert(error);
			}
		});
}

/**
 * 코드 조회하여 radiobutton에 세팅
 * 
 * @param
 * 1. (필수)objId : radiobutton이 삽입될 요소 id
 * 2. (필수)name : radiobutton name 
 * 3. contextRoot : contextRoot
 * 4. url : 코드를 조회해올 url
 * 5. selectAll : 코드 외 전체 checkbox 추가 유무
 * 6. selectAllData : 코드 외 전체 checkbox의 값
 * 7. selectedData : 선택되어야하는 코드값
 * 8. codeId, code, remk : 코드 검색조건
 * 
 */

function fn_setRadioButtonCmmnCode(param){

	if(fn_empty(param.objId))	return;
	if(fn_empty(param.name))	return;
	
	var objId = param.objId;
	var name = param.name;
	var contextRoot = param.contextRoot;
	if(fn_empty(param.contextRoot))	contextRoot = "";
	var url = contextRoot + param.url;
	if(fn_empty(param.url))	url = contextRoot+"/cmm/cmm/selectCommonCodeSelectboxList.json";
	var selectAll = param.selectAll;
	if(fn_empty(param.selectAll))	selectAll = false;
	var selectAllData = param.selectAllData;
	if(fn_empty(param.selectAllData))	selectAllData = "";
	var selectAllValue = "전체";
	var selectedData = param.selectedData;
	var param = [
			{ name : 'codeId', value : param.codeId },
			{ name : 'code', value : param.code },
			{ name : 'remk', value : param.remk }
		];
	
	var tag = "";
	
	$.ajax({
			type: "POST",
			url: url,
			data: param,
			dataType: 'json',
			success: function(data){
				
				if(data.codeList){
					
					var checked = "";
					
					//'전체'요소 추가 시 
	        		if(selectAll){
	        			if(selectAllData == selectedData){
	        				checked = "checked";
	        			}	 
	        			
	        			tag += "<span class='bg-chk'>";
	        			tag += "	<input type='radio' id='"+name+"_"+selectAllData+"' name='"+name+"' value='"+selectAllData+"' "+checked+">";	        						
	        			tag += "	<label for='"+name+"_"+selectAllData+"'>" +selectAllValue+"</label>";
	        			tag += "</span>";
	        		}
	        		
	        		$.each(data.codeList, function(index, entry) {
	        			
	        			checked = "";
	        			
	        			//'전체'가 없고, 기본선택 데이터가 없는경우 1번째 요소 기본 선택
	        			if(!selectAll && fn_empty(selectedData) && index == 0)	checked = "checked";
	        			
	        			//선택 데이터가 있는 경우 값 비교하여 기본 선택
        				if(!fn_empty(selectedData) && entry.code == selectedData)	checked = "checked";
               			
	        			//라디오버튼 tag
	       				tag += "<span class='bg-chk'>";
	       				tag += "	<input type='radio' id='"+name+"_"+index+"' name='"+name+"' value='"+entry.code+"' "+checked+">";
	        			tag += "	<label for='"+name+"_"+index+"'>"+entry.codeNm;
	        			tag += "</span>";
	        			
	        		});
				
	        		$("#"+objId).append(tag);
	        	}
			},
			error: function(xhr, textStatus, error) {
				alert(error);
			}
		});
 }

