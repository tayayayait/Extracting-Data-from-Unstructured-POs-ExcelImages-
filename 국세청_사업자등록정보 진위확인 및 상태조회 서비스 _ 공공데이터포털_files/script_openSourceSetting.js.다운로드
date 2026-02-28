/**
 * 오픈 소스 설정 스크립트
 * 
 * @author kms
 * @since 2019.11.12
 *
 */

$(function(){

	/*
	 * 페이스북 공유(jjh 추가, sdk)
	 * */
	(function(d, s, id) {
	    var js, fjs = d.getElementsByTagName(s)[0];
	    if (d.getElementById(id)) return;
	    js = d.createElement(s); js.id = id;
	    js.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v4.0&appId=372879886730147";
	    fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));
	/*
	 * 웹 에디터 - tinymce 설정
	 * */
	tinymceObj = { 
				selector:'',
				language:'ko_KR',
				width : '100%',
				height : '500px',
				//theme: "modern",
				branding: false,
				statusbar: false,
				plugins: [
				 	"autolink lists link image charmap print preview anchor",
				 	"searchreplace visualblocks textcolor colorpicker textpattern",
					 "insertdatetime table contextmenu paste"
				],
				//toolbar: "insertfile undo redo | styleselect | bold italic | fontselect | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent |  custom_image", /*link image */
				toolbar: 'styleselect | fontselect | fontsizeselect | bold italic underline | forecolor backcolor | custom_image link | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | lineheightselect | removeformat | undo redo',
				font_formats: "나눔고딕=nanumgothic;나눔명조=Nanum Myoungjo;굴림=Gulim;굴림체=Gulim;궁서체=Gungsuh;돋움=Dotum;돋움체=Dotum;바탕체=Batang,Arial=arial;Courier New=courier new;Tahoma=Tahoma;Verdana=Verdana;Times New Roman=Times New Roman",
				fontsize_formats: '8pt 10pt 11pt 12pt 14pt 18pt 24pt 36pt',
				//content_css: [
				//	  '/assets/tinymce/skins/lightgray/content.min.css'
				//],
			    forced_root_block : false,
			    force_br_newlines : true,
			    force_p_newlines : false,	
			    setup: function (editor) {
					editor.ui.registry.addButton('custom_image', {
					    title: '이미지삽입',
					    icon: 'image',
					    onAction: function() {
				        	window.open("/assets/biz/quick_photo/Photo_Quick_UploadPopup.html","tinymcePop","width=384, height=265, resizable=no");
				    	}
				    });
		    	//에디터 글자수 초과 확인
		    	editor.on('keyup', function (e) {
		    		
		    		var allowed_keys = [8, 13, 16, 17, 18, 20, 33, 34, 35, 36, 37, 38, 39, 40, 46];
	        	    var chars_with_html = tinyMCE.activeEditor.getContent().length;
                    var key = e.keyCode;
                    var maxLength = tinymce.activeEditor.settings.max_chars;
                    
                    if(maxLength != undefined){

	                    if (allowed_keys.indexOf(key) != -1) {
	                    	fn_setTextLength(maxLength, chars_with_html, "editorCharCount");
	                        return true;
	                    }
	                    if (chars_with_html > maxLength) {
	                    	alert("에디터에 입력가능한 글자수를 초과하여 입력하였습니다.");
	                    	//입력이 안되도록 설정했으나, 잘못된 코드인지 제대로 동작하지 않음
	                        e.stopPropagation();
	                        e.preventDefault();
	                        return false;
	                    } 
	                    if (chars_with_html > maxLength - 1 && key != 8 && key != 46) {
	                        alert("에디터에 입력가능한 글자수를 초과하여 입력하였습니다.");
	                    	//입력이 안되도록 설정했으나, 잘못된 코드인지 제대로 동작하지 않음
	                        e.stopPropagation();
	                        e.preventDefault();
	                        return false;
	                    }
	                    
	                    fn_setTextLength(maxLength, chars_with_html, "editorCharCount");
                    }
		        });
		    },
		    init_instance_callback: function () { // initialize counter div
		    	var maxLength = tinymce.activeEditor.settings.max_chars;
		    	var chars_with_html = tinyMCE.activeEditor.getContent().length;
		    	
		    	if(maxLength != undefined){
			        $('.tox-tinymce').after("<span class='txt-right'><span id='editorCharCount'>"+chars_with_html+"</span>&#47;<span id='editorMaxLength'></span></span>");
			        $('#editorMaxLength').html(maxLength);
		    	}
		    }
	}

});	
 

/*
 * 파일 업로드 가능한 확장자
 * */
var allowedExtensionsImage = ['jpg', 'jpeg', 'bmp', 'png','gif','tiff'];
var allowedExtensionsDoc = ['txt', 'xlsx', 'xls', 'csv', 'ppt', 'pptx', 'docx', 'hwp', 'pdf'];
var allowedExtensionsDocZip = ['zip', 'txt', 'xlsx', 'xls', 'csv','ppt', 'pptx', 'docx', 'hwp', 'pdf'];
var allowedExtensionsImageDocZip = ['jpg', 'jpeg', 'bmp', 'png','gif','tiff','zip', 'txt', 'xlsx', 'xls', 'csv', 'ppt', 'pptx', 'docx', 'hwp', 'pdf', 'hwpx'];
var allowedExtensionsFileData = ['jpg', 'jpeg', 'bmp', 'png','gif', 'txt', 'xlsx', 'xls', 'ppt', 'pptx', 'docx', 'hwp', 'csv'];
var allowedExtensionsExcel = ['xlsx', 'xls', 'csv'];
var allowedExtensionsCsv = ['csv'];

/*
 * 파일 업로더 설정 - fine uploader
 *  template: ui-template (현재 1개의 템플릿 사용하므로, 수정 필요없음)
    autoUpload: 사용자 파일 추가시 파일 업로드를 실행할지 여부(수정불가)
    multiple: 여러개 파일 업로드 가능 여부 
    maxConnections: 파일 업로드 실행 시 동시에 실행시킬 연결 수(수정불가)
    validation: {
        allowedExtensions: 파일 업로드 시 가능한 확장자 목록
        itemLimit: 여러개 파일 업로드가 가능할 경우 파일 제한 갯수
        sizeLimit: 파일의 사이즈 제한(수정불가)
    }, request: {
        endpoint: 파일 업로드 시 실행할 url(수정불가)
        filenameParam: 파일 업로드 파라미터 명(수정불가)
    }, callbacks: {
    		onAllComplete: function(succeedList, failedList) {
        	//파일 업로드가 모두 끝나고 실행될 구문
        }
    }, 
    debug: true
 * */
 uploaderSetting = {
    template:"qq-template-validation",
    autoUpload: false,
    multiple: true,
    maxConnections: 1, 
    validation: {
        allowedExtensions: allowedExtensionsImageDocZip,
        itemLimit: 3,
        sizeLimit: 209715200 //200MB. 변경시 context-common.xml의 MULTIPART RESOLVERS 설정도 같이 변경
    }, request: {
        endpoint: '/cmm/cmm/uploadFile.do',
        filenameParam: "file"
    }, callbacks: {
    	onAllComplete: function(succeedList, failedList) {
        	fn_uploaderCompleteCallback();
        }
    }, 
    messages: {
        typeError: "{file} 은 업로드가 불가능한 확장자를 가진 파일입니다.",
        sizeError: "{file} 은 파일크기가 너무 큽니다. 업로드가능한 파일 사이즈는 {sizeLimit} 입니다.",
        minSizeError: "{file} 은 파일크기가 너무 작습니다. 업로드 가능한 최소 파일 사이즈는 {minSizeLimit} 입니다.",
        emptyError: "{file} 은 파일크기가 0입니다. 다른 파일을 선택해주십시오.",
        noFilesError: "업로드 처리할 파일이 없습니다.",
        tooManyItemsError: "설정된 파일 갯수를 초과합니다. 업로드 가능한 파일 갯수는 최대 {itemLimit}개 입니다.",
        maxHeightImageError: "이미지 세로 길이가 초과하였습니다.",
        maxWidthImageError: "이미지 가로 길이가 초과하였습니다.",
        minHeightImageError: "이미지 세로 길이가 너무 작습니다.",
        minWidthImageError: "이미지 가로 길이가 너무 작습니다",
        retryFailTooManyItems: "파일업로드 재시도에 실패하엿습니다.",
        onLeave: "파일 업로드가 진행중입니다. 지금 화면을 벗어나면 업로드가 취소됩니다.",
        unsupportedBrowserIos8Safari: "복구 할 수없는 오류 - 이 브라우저는 iOS8 Safari의 심각한 버그로 인해 어떤 종류의 파일 업로드도 허용하지 않습니다. Apple이 이러한 문제를 해결할 때까지 iOS 8 Chrome을 사용하십시오."
    },debug: true
}