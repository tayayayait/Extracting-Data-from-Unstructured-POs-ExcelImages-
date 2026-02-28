/**
 * 공통 문자열 처리 스크립트
 * 
 * @author kms
 * @since 2019.10.29
 *
 */

$(function(){
	
	/**
	 * 앞뒤 공백 trim
	 * param  : str - 텍스트
	 * return  : 공백제거한 텍스트
	 */
	fn_trim = function(str) {
	  return str.replace(/(^\s*)|(\s*$)/gi, ""); 
	}
	
	/**
	 * 값이 null인지 확인
	 * param  : str - 텍스트
	 * return  : 공백인지 여부
	 */
	fn_empty = function(str) {
		
		if(str == undefined){
			return true;
		}
		
		if(str == "" || str.length <= 0 ){
			return true;
		}
		return false;
	}
	
	/**
	 * input 입력 제한
	 * param  : gubun - 1 숫자만 입력, 2 - 한글만 입력 3- 한글만 입력불가
	 * param  : obj - 적용 객체
	 */
	fn_inputKey = function(gubun , obj) {
		//숫자만 입력 가능
		if(gubun == '1'){
			obj.value = obj.value.replace(/[^0-9]/g,'');
		}
		//한글만 입력 가능
		else if(gubun == '2'){
			obj.value = obj.value.replace(/[^ㄱ-ㅎ|ㅏ-ㅣ|가-힣|\s]/g,'');
		}
		//한글만 입력 불가능
		else if(gubun == '3'){
			obj.value = obj.value.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|\s]/g,'');
		}
		else if(gubun == 'ip'){
			obj.value = obj.value.replace(/[^0-9.]/g,'');
		}
		//한글, 영문 입력가능
		else if(gubun == '4'){
			var reg = /[^ㄱ-ㅎ|ㅏ-ㅣ|가-힣|a-z|A-Z|\s]/g;
			if(reg.test(obj.value)){
				obj.value = obj.value.replace(/[^ㄱ-ㅎ|ㅏ-ㅣ|가-힣|a-z|A-Z|\s]/g,'');
			}
		}
		// 한글, 특수문자 입력 불가능 (-_만 허용)
		else if(gubun == '5'){
			obj.value = obj.value.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|\{\}\[\]\/?.,;:|\)*~`!^\+<>@\#$%&\\\=\(\'\"\s]/g,'');
		}
		//숫자, - 만 입력 가능(전화번호/팩스번호 데이터 등)
		else if(gubun == '6'){
			obj.value = obj.value.replace(/[^0-9-]/g,'');
		}
		//영문,숫자 입력가능(코드성데이터)
		else if(gubun == '7'){
			obj.value = obj.value.replace(/[^0-9a-zA-Z]/g,'');
		}
		//영문만 입력가능
		else if(gubun == '8'){
			obj.value = obj.value.replace(/[0-9]|[^\!-z]/gi,'');
		}
		// 한글, 특수문자 입력 불가능 (-_@.만 허용) - 이메일 데이터
		else if(gubun == '9'){
			obj.value = obj.value.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|\{\}\[\]\/?,;:|\)*~`!^\+<>\#$%&\\\=\(\'\"\s]/g,'');
		}
	}
	
	/**
	 * 정규식 반환
	 * param  : gubun - 1 ip 형식, 2 url 형식
	 * return  : regExp - 정규식
	 */
	fn_regExp = function(gubun) {
		var regExp
		
		//ip형식
		if(gubun == "ip"){
			regExp = /^(1|2)?\d?\d([.](1|2)?\d?\d){3}$/;
		}
		//url형식
		// else if(gubun == "url"){
		// 	regExp = /^(http(s)?\:\/\/)?((\w+)[.])+(asia|biz|cc|cn|com|de|eu|in|info|jobs|jp|kr|mobi|mx|name|net|nz|org|travel|tv|tw|uk|us)(\/(\w*))*$/i;
		// }
		//공백여부
		else if(gubun == "empty"){
			regExp = /\s/g;
		}
		//숫자만
		else if(gubun == "num"){
			regExp =  /^[0-9]+$/;
		}
		//이메일 체크 정규식
		else if(gubun == "email"){
			regExp =  /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z-_])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,6}$/i;
		}
		//핸드폰번호 정규식
		else if(gubun == "mbtl"){
			regExp =  /^01([0|1|6|7|8|9]?)-?([0-9]{3,4})-?([0-9]{4})$/;
		}
		//일반 전화번호 정규식
		else if(gubun == "tel"){
			regExp =  /^\d{2,3}-?\d{3,4}-?\d{4}$/;
		}
		//특수문자(공백포함) 정규식
		else if(gubun == "notText"){
			regExp =  /^[0-9a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣]+$/;
		}
		//아이디 정규식 (4~20자리, 영문/숫자 조합, 특수문자 -_만 허용, 첫글자 영문)
		else if(gubun == "id"){
			regExp = /^[a-z]+[a-z0-9_-]{3,19}$/g;
		}
		//비밀번호 정규식 (9~20자리, 영문/숫자/특수문자 필수 포함)
		else if(gubun == "password"){
			regExp = /^.*(?=^.{9,20}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=*]).*$/;
		//특수문자 불가능
		} else if(gubun == "notSc") {
			regExp = /[\{\}\[\]\/?;:|\)*~`^\-_+<>@\#$%&\\\=\(\'\"]/gi
		//특수문자 불가능(언더바 제외)
		} else if(gubun == "notScExceptUnderbar") {
			regExp = /[\{\}\[\]\/?;:|\)*~`^\-+<>@\#$%&\\\=\(\'\"]/gi
		//생년월일 체크 정규식
		} else if(gubun == "birthday"){
			regExp = /^(19[0-9][0-9]|20\d{2})(0[0-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])$/;
		//YYYY-MM-DD 날짜 형식(하이픈 포함)
		} else if(gubun == "hyphenYYYYMMDD"){
			regExp = /^(19|20)\d{2}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[0-1])$/;
		}

		return regExp;
	}
	
	/**
	 * <, > 문자 replace
	 * 
	 * */
	fn_scriptLtGtReplace = function(value){
		
		if(value== null || value == ""){
			return "";
		}
		
		var strValue = value;
		strValue = strValue.replace(/\>/g,"&gt;");
		strValue = strValue.replace(/\</g,"&lt;");
		
		return strValue;
	}

});


