/**
 * 공통 숫자 처리 스크립트
 * 
 * @author kms
 * @since 2019.12.11
 *
 */


function fn_setNumberAutoComma(obj) {
    
    // 콤마( , )의 경우도 문자로 인식되기때문에 콤마를 따로 제거한다.
    var deleteComma = obj.value.replace(/\,/g, "");

    // 콤마( , )를 제외하고 문자가 입력되었는지를 확인한다.
    if(isFinite(deleteComma) == false) {
        alert("문자는 입력하실 수 없습니다.");
        obj.value = "";
        return false;
    }
   
    // 기존에 들어가있던 콤마( , )를 제거한 이 후의 입력값에 다시 콤마( , )를 삽입한다.
    obj.value = fn_setNumberComma(fn_removeNumberComma(obj.value));
}

// 천단위 이상의 숫자에 콤마( , )를 삽입하는 함수
function fn_setNumberComma(str) {

    str = String(str);
    return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, "$1,");
}

// 콤마( , )가 들어간 값에 콤마를 제거하는 함수
function fn_removeNumberComma(str) {

    str = String(str);
    return str.replace(/[^\d]+/g, "");
}

 
