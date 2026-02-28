/**
 * 공통 이미지 폴백 핸들러
 *
 * 목적: 모든 페이지에서 깨진 이미지를 대체 이미지로 자동 교체
 * 적용 범위: 전체 포털 (scriptInc.jspf에서 import)
 *
 * 특징:
 * - DOMContentLoaded 이후 모든 <img>에 자동 적용
 * - MutationObserver로 동적 추가 이미지도 감지
 * - 기존 인라인 스타일 보존 (덮어쓰지 않음)
 * - object-fit: contain으로 비율 유지 (이미지 잘림 방지)
 */
(function() {
    'use strict';

    // 대체 이미지 경로
    var FALLBACK_IMAGE = '/images/fallback/fallback-trans.png';


    /**
     * 모든 이미지에 폴백 핸들러 적용
     */
    function applyImageFallback() {
        document.querySelectorAll('img').forEach(function(img) {
            // 이미 폴백 핸들러가 적용된 경우 스킵
            if (img.dataset.fallbackApplied) {
                return;
            }

            // 폴백 플래그 설정
            img.dataset.fallbackApplied = 'true';

            // 에러 핸들러 등록
            img.onerror = function() {
                // 이미 대체 이미지로 변경된 경우 무한 루프 방지
                if (this.src.indexOf('/images/fallback/') > -1) {
                    this.onerror = null;
                    return;
                }

                // 기존 스타일 확인
                var hasInlineWidth = !!this.style.width && this.style.width !== 'auto';
                var hasInlineHeight = !!this.style.height && this.style.height !== 'auto';
                var hasWidthAttr = this.hasAttribute('width');
                var hasHeightAttr = this.hasAttribute('height');

                // console.log('Image load failed, using fallback:', this.src);

                // 대체 이미지로 변경
                this.src = FALLBACK_IMAGE;

                // 기존 사이즈 스타일이 없는 경우에만 100% 적용 (부모 컨테이너 채우기)
                if (!hasInlineWidth && !hasWidthAttr) {
                    this.style.width = '100%';
                }
                if (!hasInlineHeight && !hasHeightAttr) {
                    this.style.height = '100%';
                }

                // 배경색 설정
                this.style.backgroundColor = '#EBFAFF';

                // object-fit 설정 (이미지가 잘리지 않고 가운데 배치, 마진 효과)
                var currentObjectFit = window.getComputedStyle(this).objectFit;
                if (!currentObjectFit || currentObjectFit === 'fill') {
                    this.style.objectFit = 'contain';  // 이미지 비율 유지, 잘림 없음
                    this.style.objectPosition = 'center';  // 중앙 기준으로 표시
                }

                // 패딩 추가 (마진 효과)
                // this.style.padding = '10px';
                this.style.boxSizing = 'border-box';

                // 대체 이미지 클래스 추가 (CSS 커스터마이징 가능하도록)
                this.classList.add('fallback-image');

                // 에러 핸들러 제거 (무한 루프 방지)
                this.onerror = null;
            };
            // 이미 로드 실패한 이미지 처리 (complete이지만 naturalWidth가 0인 경우)
            if (img.complete && img.naturalWidth === 0) {
                img.onerror();
            }
        });
    }

    /**
     * 동적으로 추가되는 이미지 감지 (AJAX 등)
     */
    function observeDynamicImages() {
        // MutationObserver가 지원되지 않는 구형 브라우저 대응
        if (typeof MutationObserver === 'undefined') {
            return;
        }

        var observer = new MutationObserver(function(mutations) {
            var hasNewImages = false;

            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    // 추가된 노드가 이미지이거나, 이미지를 포함한 경우
                    if (node.nodeName === 'IMG') {
                        hasNewImages = true;
                    } else if (node.querySelectorAll && node.querySelectorAll('img').length > 0) {
                        hasNewImages = true;
                    }
                });
            });

            // 새로운 이미지가 추가되었으면 폴백 핸들러 적용
            if (hasNewImages) {
                applyImageFallback();
            }
        });

        // body 전체를 감시 (하위 모든 노드 포함)
        observer.observe(document.body, {
            childList: true,   // 자식 노드 추가/제거 감지
            subtree: true      // 모든 하위 노드 감지
        });
    }

    /**
     * 초기화
     */
    function init() {
        // DOMContentLoaded 이벤트 대기
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                applyImageFallback();
                observeDynamicImages();
            });
        } else {
            // 이미 DOM이 로드된 경우 즉시 실행
            applyImageFallback();
            observeDynamicImages();
        }
    }

    // 초기화 실행
    init();

    // 전역 함수로 노출 (필요 시 수동 호출 가능)
    window.applyImageFallback = applyImageFallback;

})();
