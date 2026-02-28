```xml
<?xml version="1.0" encoding="UTF-8"?>
<uiux_spec>
  <header>
    <title>거래명세서 자동 생성 프로그램 UI/UX 상세서 (Windows Desktop App)</title>
    <applied_skills>
      <skill><name>ui-ux-pro-max</name><focus>접근성/상태/레이아웃/모션 기준</focus></skill>
      <skill><name>writing-clearly-and-concisely</name><focus>규칙 중심 문장</focus></skill>
      <skill><name>prompt-engineering</name><focus>표/토큰/상태 템플릿화</focus></skill>
    </applied_skills>
  </header>

  <schemas>
    <table_schema id="spec_table_4col">
      <columns>
        <column key="item">항목</column>
        <column key="value">값(HEX·px·ms)</column>
        <column key="usage">사용처</column>
        <column key="rule">규칙</column>
      </columns>
    </table_schema>
  </schemas>

  <sections>
    <section id="0" title="문서 정보">
      <table schema_ref="spec_table_4col">
        <rows>
          <row><item>문서명</item><value>거래명세서 자동 생성 프로그램 UI/UX 상세서</value><usage>전체</usage><rule>본 문서를 그대로 `상세서.md` 본문으로 사용</rule></row>
          <row><item>버전</item><value>v1.0</value><usage>전체</usage><rule>UI 구현 기준선(Design Baseline)</rule></row>
          <row><item>대상 OS</item><value>Windows 10/11</value><usage>전체</usage><rule>마우스+키보드 기본, 터치(선택) 고려</rule></row>
          <row><item>기본 테마</item><value>Light only</value><usage>전체</usage><rule>다크모드는 v2 범위로 분리(가정 참조)</rule></row>
          <row><item>기준 DPI/스케일</item><value>96DPI / 100%</value><usage>전체</usage><rule>125%에서도 깨짐/겹침 없어야 함(UI QA 포함)</rule></row>
          <row><item>최소 창 크기</item><value>1120×720px</value><usage>전체</usage><rule>이보다 작으면 스크롤/패널 접힘 규칙 적용</rule></row>
          <row><item>표기 단위</item><value>px / ms / HEX</value><usage>전체</usage><rule>예외: 폰트 패밀리는 문자열로 표기</rule></row>
        </rows>
      </table>
    </section>

    <section id="1" title="UX 목표 및 원칙(규칙)">
      <table schema_ref="spec_table_4col">
        <rows>
          <row><item>정확성 우선</item><value>금액 오차 0원</value><usage>처리/검증</usage><rule>계산 결과가 확정되기 전 “미리보기(검증)” 단계 제공</rule></row>
          <row><item>오류 예방</item><value>필수값 누락 즉시 감지</value><usage>입력/마법사</usage><rule>제출 전 블로킹(필수값) + 제출 후 요약(전체 오류) 동시 제공</rule></row>
          <row><item>대량 처리</item><value>50파일/5분 목표</value><usage>일괄 처리</usage><rule>UI는 비동기 작업(중단/재시도/계속) 전제로 설계</rule></row>
          <row><item>가시성</item><value>진행률/상태 항상 노출</value><usage>일괄 처리</usage><rule>전체 진행률 + 파일별 상태(성공/경고/실패) 2단 구조</rule></row>
          <row><item>복구 가능</item><value>실패해도 나머지 진행</value><usage>일괄 처리</usage><rule>“실패 항목만 재시도” 버튼 제공, 실패 사유 1클릭 확인</rule></row>
          <row><item>비개발자 친화</item><value>용어/레이블 표준화</value><usage>전체</usage><rule>기술 용어 노출 금지(예: “파서”) → “발주서 읽기 규칙”</rule></row>
        </rows>
      </table>
    </section>

    <section id="2" title="정보 구조(IA) 및 네비게이션">
      <section id="2-1" title="좌측 사이드바 메뉴(기본)">
        <table schema_ref="spec_table_4col">
          <rows>
            <row><item>메뉴 구조</item><value>6개 상위 메뉴</value><usage>App Shell</usage><rule>`일괄 처리 / 업체 관리 / 매핑 마법사 / 단가·규칙 / 로그·리포트 / 설정`</rule></row>
            <row><item>기본 진입 화면</item><value>일괄 처리</value><usage>최초 실행</usage><rule>사용자의 일일 업무 흐름과 일치</rule></row>
            <row><item>메뉴 라벨 길이</item><value>최대 10자 권장</value><usage>사이드바</usage><rule>넘치면 2줄 금지, 말줄임(…) 적용</rule></row>
            <row><item>검색 진입</item><value>Ctrl+K</value><usage>전체</usage><rule>전역 검색(업체/품목/로그) 검색창 포커스</rule></row>
          </rows>
        </table>
      </section>

      <section id="2-2" title="App Shell(공통 뼈대)">
        <table schema_ref="spec_table_4col">
          <rows>
            <row><item>헤더 높이</item><value>56px</value><usage>상단</usage><rule>화면 제목 + 현재 작업 컨텍스트(날짜/출력경로)</rule></row>
            <row><item>사이드바 폭(기본)</item><value>264px</value><usage>좌측</usage><rule>아이콘 20px, 텍스트 13px</rule></row>
            <row><item>사이드바 폭(접힘)</item><value>72px</value><usage>좌측</usage><rule>`bp_compact`에서 기본 접힘(아이콘만)</rule></row>
            <row><item>콘텐츠 패딩</item><value>24px</value><usage>본문</usage><rule>`bp_compact`에서는 16px</rule></row>
            <row><item>섹션 간 간격</item><value>16px</value><usage>본문</usage><rule>카드·테이블·폼 블록 간 기본 간격</rule></row>
            <row><item>우측 인스펙터(선택)</item><value>360px</value><usage>상세패널</usage><rule>`bp_wide`에서 기본 표시(로그/오류 상세)</rule></row>
          </rows>
        </table>
      </section>

    </section>
    <section id="3" title="디자인 토큰(Design Tokens)">
      <note>토큰 이름은 구현 코드에서 상수로 그대로 사용한다(예: `COLOR_PRIMARY_600`).</note>

      <section id="3-1" title="Color (Light)">
        <table schema_ref="spec_table_4col">
          <rows>
            <row><item>color.bg.app</item><value>#F8FAFC</value><usage>앱 배경</usage><rule>기본 배경(스크롤 영역 포함)</rule></row>
            <row><item>color.bg.surface</item><value>#FFFFFF</value><usage>카드/모달/드로어</usage><rule>모든 “Surface” 기본 배경</rule></row>
            <row><item>color.bg.muted</item><value>#F1F5F9</value><usage>입력 disabled, 테이블 스트라이프</usage><rule>정보성 강조가 아닌 영역에만 사용</rule></row>
            <row><item>color.text.primary</item><value>#0F172A</value><usage>본문 텍스트</usage><rule>기본 텍스트(최소 대비 4.5:1)</rule></row>
            <row><item>color.text.muted</item><value>#475569</value><usage>보조 설명/메타</usage><rule>본문 대체 금지(가독성 저하)</rule></row>
            <row><item>color.text.placeholder</item><value>#64748B</value><usage>플레이스홀더</usage><rule>입력 안내용, 값과 혼동 없게</rule></row>
            <row><item>color.border.default</item><value>#E2E8F0</value><usage>카드/테이블/입력</usage><rule>기본 1px 보더</rule></row>
            <row><item>color.border.strong</item><value>#CBD5E1</value><usage>hover/구분선</usage><rule>구분 강조가 필요할 때만 사용</rule></row>
            <row><item>color.primary.50</item><value>#EFF6FF</value><usage>선택/호버 배경</usage><rule>테이블 행 hover, 정보 배경</rule></row>
            <row><item>color.primary.100</item><value>#DBEAFE</value><usage>선택 배경</usage><rule>선택(Selected) 기본 배경</rule></row>
            <row><item>color.primary.600</item><value>#2563EB</value><usage>Primary CTA</usage><rule>주요 버튼/강조 링크</rule></row>
            <row><item>color.primary.700</item><value>#1D4ED8</value><usage>Hover</usage><rule>Primary hover</rule></row>
            <row><item>color.primary.800</item><value>#1E40AF</value><usage>Active</usage><rule>Primary active</rule></row>
            <row><item>color.success.600</item><value>#16A34A</value><usage>성공 상태</usage><rule>성공 배지/토스트/아이콘</rule></row>
            <row><item>color.warning.600</item><value>#D97706</value><usage>경고 상태</usage><rule>경고 배지/토스트</rule></row>
            <row><item>color.danger.50</item><value>#FEF2F2</value><usage>에러 배경</usage><rule>에러 행/배너 배경</rule></row>
            <row><item>color.danger.600</item><value>#DC2626</value><usage>오류 상태</usage><rule>오류 보더/텍스트/토스트</rule></row>
            <row><item>color.focus.ring</item><value>#93C5FD</value><usage>포커스 링</usage><rule>모든 인터랙티브 요소 공통</rule></row>
            <row><item>color.overlay.scrim</item><value>rgba(15,23,42,0.60)</value><usage>모달/드로어 오버레이</usage><rule>클릭 시 닫기 허용(필수 입력 모달 제외)</rule></row>
          </rows>
        </table>
      </section>

      <section id="3-2" title="Typography">
        <table schema_ref="spec_table_4col">
          <rows>
            <row><item>font.family.base</item><value>Segoe UI, Malgun Gothic, Arial, sans-serif</value><usage>전체</usage><rule>OS 기본과 조화, 폰트 강제 다운로드 금지</rule></row>
            <row><item>font.size.xs</item><value>12px</value><usage>캡션/메타</usage><rule>표 보조 정보, 힌트</rule></row>
            <row><item>font.size.sm</item><value>13px</value><usage>본문 기본</usage><rule>앱 기본 폰트 크기</rule></row>
            <row><item>font.size.md</item><value>14px</value><usage>폼 라벨/강조</usage><rule>과다 사용 금지(밀도 증가)</rule></row>
            <row><item>font.size.lg</item><value>16px</value><usage>섹션 타이틀</usage><rule>카드/블록 헤더</rule></row>
            <row><item>font.size.xl</item><value>18px</value><usage>화면 타이틀</usage><rule>상단 헤더 타이틀</rule></row>
            <row><item>font.weight.regular</item><value>400</value><usage>본문</usage><rule>기본</rule></row>
            <row><item>font.weight.semibold</item><value>600</value><usage>버튼/제목</usage><rule>제목/주요 CTA</rule></row>
            <row><item>lineHeight.xs</item><value>16px</value><usage>12px 텍스트</usage><rule>최소 1.3 이상</rule></row>
            <row><item>lineHeight.sm</item><value>20px</value><usage>13px 텍스트</usage><rule>본문 기본</rule></row>
            <row><item>lineHeight.md</item><value>22px</value><usage>14px 텍스트</usage><rule>폼 라벨/설명</rule></row>
            <row><item>lineHeight.lg</item><value>24px</value><usage>16px 텍스트</usage><rule>섹션 제목</rule></row>
            <row><item>letterSpacing.default</item><value>0px</value><usage>전체</usage><rule>임의 자간 금지(가독성 저하)</rule></row>
          </rows>
        </table>
      </section>

      <section id="3-3" title="Spacing">
        <table schema_ref="spec_table_4col">
          <rows>
            <row><item>space.0</item><value>0px</value><usage>리셋</usage><rule>불필요한 0 반복 금지(토큰 사용)</rule></row>
            <row><item>space.1</item><value>4px</value><usage>미세 간격</usage><rule>아이콘-텍스트, 배지</rule></row>
            <row><item>space.2</item><value>8px</value><usage>기본 간격</usage><rule>폼 내부 요소</rule></row>
            <row><item>space.3</item><value>12px</value><usage>컴포넌트 패딩</usage><rule>입력/카드 내부</rule></row>
            <row><item>space.4</item><value>16px</value><usage>섹션 간격</usage><rule>카드 간 기본</rule></row>
            <row><item>space.5</item><value>20px</value><usage>넉넉 간격</usage><rule>대시보드 블록</rule></row>
            <row><item>space.6</item><value>24px</value><usage>페이지 패딩</usage><rule>콘텐츠 외곽 패딩</rule></row>
            <row><item>space.8</item><value>32px</value><usage>큰 구분</usage><rule>섹션/그룹 분리</rule></row>
            <row><item>space.10</item><value>40px</value><usage>매우 큰 구분</usage><rule>빈 상태(Empty) 레이아웃</rule></row>
          </rows>
        </table>
      </section>

      <section id="3-4" title="Radius">
        <table schema_ref="spec_table_4col">
          <rows>
            <row><item>radius.sm</item><value>6px</value><usage>인풋/배지</usage><rule>작은 요소</rule></row>
            <row><item>radius.md</item><value>10px</value><usage>버튼/토스트</usage><rule>기본</rule></row>
            <row><item>radius.lg</item><value>14px</value><usage>카드/모달</usage><rule>Surface 기본</rule></row>
            <row><item>radius.pill</item><value>999px</value><usage>태그/칩</usage><rule>캡슐형 요소</rule></row>
          </rows>
        </table>
      </section>

      <section id="3-5" title="Shadow (선택적)">
        <table schema_ref="spec_table_4col">
          <rows>
            <row><item>shadow.sm</item><value>0 1 2 rgba(15,23,42,0.06)</value><usage>카드 hover</usage><rule>과도한 입체감 금지</rule></row>
            <row><item>shadow.md</item><value>0 4 12 rgba(15,23,42,0.10)</value><usage>드로어</usage><rule>표면 분리</rule></row>
            <row><item>shadow.lg</item><value>0 12 32 rgba(15,23,42,0.14)</value><usage>모달</usage><rule>최상위 레이어 강조</rule></row>
          </rows>
        </table>
      </section>

      <section id="3-6" title="Motion">
        <table schema_ref="spec_table_4col">
          <rows>
            <row><item>motion.duration.fast</item><value>120ms</value><usage>hover</usage><rule>색/보더 전환</rule></row>
            <row><item>motion.duration.base</item><value>200ms</value><usage>모달/드로어</usage><rule>열림/닫힘</rule></row>
            <row><item>motion.duration.slow</item><value>280ms</value><usage>큰 전환</usage><rule>화면 전환(가능 시)</rule></row>
            <row><item>motion.easing.standard</item><value>cubic-bezier(0.2,0,0,1)</value><usage>전체</usage><rule>기본 easing</rule></row>
            <row><item>motion.reduce</item><value>0ms</value><usage>접근성</usage><rule>“모션 최소화” 설정 시 적용</rule></row>
          </rows>
        </table>
      </section>

      <section id="3-7" title="Z-index(레이어)">
        <table schema_ref="spec_table_4col">
          <rows>
            <row><item>z.base</item><value>0</value><usage>기본</usage><rule>콘텐츠</rule></row>
            <row><item>z.sticky</item><value>10</value><usage>고정 헤더</usage><rule>테이블 헤더/필터바</rule></row>
            <row><item>z.dropdown</item><value>20</value><usage>콤보박스</usage><rule>드롭다운/메뉴</rule></row>
            <row><item>z.overlay</item><value>30</value><usage>스크림</usage><rule>모달/드로어 배경</rule></row>
            <row><item>z.modal</item><value>40</value><usage>모달</usage><rule>최상위 입력</rule></row>
            <row><item>z.toast</item><value>50</value><usage>토스트</usage><rule>화면 우상단</rule></row>
            <row><item>z.tooltip</item><value>60</value><usage>툴팁</usage><rule>포인터/포커스 툴팁</rule></row>
          </rows>
        </table>
      </section>
    </section>
    <section id="4" title="레이아웃 규칙">
      <section id="4-1" title="브레이크포인트(창 너비 기준)">
        <table schema_ref="spec_table_4col">
          <rows>
            <row><item>bp_compact</item><value>≤1200px</value><usage>전체</usage><rule>사이드바 기본 접힘(72px), 우측 인스펙터 숨김</rule></row>
            <row><item>bp_regular</item><value>1201~1600px</value><usage>전체</usage><rule>기본 레이아웃(사이드바 264px)</rule></row>
            <row><item>bp_wide</item><value>≥1601px</value><usage>전체</usage><rule>우측 인스펙터(360px) 기본 표시</rule></row>
          </rows>
        </table>
      </section>

      <section id="4-2" title="그리드/컨테이너">
        <table schema_ref="spec_table_4col">
          <rows>
            <row><item>grid.columns</item><value>12</value><usage>본문</usage><rule>카드/폼 레이아웃 정렬 기준</rule></row>
            <row><item>grid.gutter</item><value>24px</value><usage>본문</usage><rule>열 사이 간격</rule></row>
            <row><item>container.padding</item><value>24px</value><usage>본문</usage><rule>`bp_compact`에서는 16px</rule></row>
            <row><item>form.label.col</item><value>160px</value><usage>폼</usage><rule>라벨 좌측 정렬(2열 폼 기본)</rule></row>
            <row><item>form.field.gapY</item><value>12px</value><usage>폼</usage><rule>필드 간 세로 간격</rule></row>
          </rows>
        </table>
      </section>

      <section id="4-3" title="스크롤/고정(Sticky) 규칙">
        <table schema_ref="spec_table_4col">
          <rows>
            <row><item>sticky.filterBar</item><value>top:0</value><usage>일괄 처리</usage><rule>필터/실행 영역은 스크롤 시 상단 고정</rule></row>
            <row><item>sticky.tableHeader</item><value>top:0</value><usage>테이블</usage><rule>헤더 고정, 본문만 스크롤</rule></row>
            <row><item>max.nestedScroll</item><value>2</value><usage>전체</usage><rule>중첩 스크롤은 최대 2단(페이지 + 테이블)</rule></row>
            <row><item>inspector.scroll</item><value>내부 스크롤</value><usage>우측 패널</usage><rule>우측 상세는 자체 스크롤, 페이지 스크롤과 분리</rule></row>
          </rows>
        </table>
      </section>
    </section>

    <section id="5" title="공통 상태(States) 의미 규칙">
      <table schema_ref="spec_table_4col">
        <rows>
          <row><item>state.default</item><value>-</value><usage>전체</usage><rule>기본 상태</rule></row>
          <row><item>state.hover</item><value>+보더 강조</value><usage>버튼/행/카드</usage><rule>레이아웃 흔들림(크기 변화) 금지</rule></row>
          <row><item>state.active</item><value>색상 1단계 진하게</value><usage>버튼/행</usage><rule>클릭/프레스 순간만</rule></row>
          <row><item>state.focus</item><value>ring 2px</value><usage>전체</usage><rule>키보드 포커스 시 반드시 표시</rule></row>
          <row><item>state.disabled</item><value>opacity 0.55</value><usage>전체</usage><rule>클릭/입력 불가, 툴팁으로 이유(선택)</rule></row>
          <row><item>state.loading</item><value>스피너 16px</value><usage>전체</usage><rule>동일 영역에서 로딩 표시, 버튼은 비활성화</rule></row>
          <row><item>state.error</item><value>danger.600</value><usage>입력/행/배너</usage><rule>“색만”으로 알리지 말고 텍스트 포함</rule></row>
        </rows>
      </table>
    </section>
    <section id="6" title="컴포넌트 규격(필수)">
      <note>모든 컴포넌트는 `default/hover/active/focus/disabled/loading/error` 상태를 가진다(해당 상태가 “의미 없음”인 경우에도 동작을 정의한다).</note>

      <section id="6-1" title="Button">
        <part label="A" title="기본 규격">
          <table schema_ref="spec_table_4col">
            <rows>
              <row><item>Button.height.sm</item><value>28px</value><usage>보조 액션</usage><rule>툴바/행 내부</rule></row>
              <row><item>Button.height.md</item><value>32px</value><usage>기본</usage><rule>대부분</rule></row>
              <row><item>Button.height.lg</item><value>40px</value><usage>주요 CTA</usage><rule>“일괄 처리 시작” 등</rule></row>
              <row><item>Button.paddingX.sm</item><value>12px</value><usage>sm</usage><rule>좌우 패딩</rule></row>
              <row><item>Button.paddingX.md</item><value>14px</value><usage>md</usage><rule>좌우 패딩</rule></row>
              <row><item>Button.paddingX.lg</item><value>16px</value><usage>lg</usage><rule>좌우 패딩</rule></row>
              <row><item>Button.radius</item><value>10px</value><usage>전체</usage><rule>`radius.md` 사용</rule></row>
              <row><item>Button.gap</item><value>8px</value><usage>아이콘+텍스트</usage><rule>아이콘-텍스트 간격</rule></row>
              <row><item>Button.icon</item><value>16px</value><usage>아이콘 버튼</usage><rule>아이콘 전용은 32×32px 최소</rule></row>
              <row><item>Button.focusRing</item><value>2px</value><usage>focus</usage><rule>`color.focus.ring`</rule></row>
              <row><item>Button.transition</item><value>120ms</value><usage>hover/active</usage><rule>`motion.duration.fast`</rule></row>
            </rows>
          </table>
        </part>

        <part label="B" title="Primary(주요)">
          <table schema_ref="spec_table_4col">
            <rows>
              <row><item>Button.Primary.bg.default</item><value>#2563EB</value><usage>기본</usage><rule>`color.primary.600`</rule></row>
              <row><item>Button.Primary.bg.hover</item><value>#1D4ED8</value><usage>hover</usage><rule>`color.primary.700`</rule></row>
              <row><item>Button.Primary.bg.active</item><value>#1E40AF</value><usage>active</usage><rule>`color.primary.800`</rule></row>
              <row><item>Button.Primary.text.default</item><value>#FFFFFF</value><usage>기본</usage><rule>대비 4.5:1 확보</rule></row>
              <row><item>Button.Primary.focus.ring</item><value>#93C5FD / 2px</value><usage>focus</usage><rule>링은 밖으로(레이아웃 변화 없음)</rule></row>
              <row><item>Button.Primary.disabled.bg</item><value>#E2E8F0</value><usage>disabled</usage><rule>클릭 불가</rule></row>
              <row><item>Button.Primary.disabled.text</item><value>#64748B</value><usage>disabled</usage><rule>텍스트 대비 유지</rule></row>
              <row><item>Button.Primary.loading</item><value>spinner 16px</value><usage>loading</usage><rule>버튼 비활성 + 스피너(좌측)</rule></row>
              <row><item>Button.Primary.error</item><value>border #DC2626 / 1px</value><usage>error</usage><rule>실패 직후 2000ms 표시 + 토스트 병행</rule></row>
            </rows>
          </table>
        </part>

        <part label="C" title="Secondary(기본)">
          <table schema_ref="spec_table_4col">
            <rows>
              <row><item>Button.Secondary.bg.default</item><value>#FFFFFF</value><usage>기본</usage><rule>`color.bg.surface`</rule></row>
              <row><item>Button.Secondary.border.default</item><value>#CBD5E1</value><usage>기본</usage><rule>`color.border.strong`</rule></row>
              <row><item>Button.Secondary.bg.hover</item><value>#F8FAFC</value><usage>hover</usage><rule>`color.bg.app`</rule></row>
              <row><item>Button.Secondary.bg.active</item><value>#F1F5F9</value><usage>active</usage><rule>`color.bg.muted`</rule></row>
              <row><item>Button.Secondary.focus.ring</item><value>#93C5FD / 2px</value><usage>focus</usage><rule>공통</rule></row>
              <row><item>Button.Secondary.disabled</item><value>opacity 0.55</value><usage>disabled</usage><rule>공통 규칙</rule></row>
              <row><item>Button.Secondary.loading</item><value>spinner 16px</value><usage>loading</usage><rule>공통</rule></row>
              <row><item>Button.Secondary.error</item><value>border #DC2626 / 1px</value><usage>error</usage><rule>공통</rule></row>
            </rows>
          </table>
        </part>

        <part label="D" title="Danger(삭제/위험)">
          <table schema_ref="spec_table_4col">
            <rows>
              <row><item>Button.Danger.bg.default</item><value>#DC2626</value><usage>기본</usage><rule>`color.danger.600`</rule></row>
              <row><item>Button.Danger.bg.hover</item><value>#B91C1C</value><usage>hover</usage><rule>(기본값) 더 진하게</rule></row>
              <row><item>Button.Danger.bg.active</item><value>#991B1B</value><usage>active</usage><rule>(기본값) 더 진하게</rule></row>
              <row><item>Button.Danger.focus.ring</item><value>#93C5FD / 2px</value><usage>focus</usage><rule>포커스는 동일 색(일관성)</rule></row>
              <row><item>Button.Danger.disabled</item><value>opacity 0.55</value><usage>disabled</usage><rule>공통</rule></row>
              <row><item>Button.Danger.loading</item><value>spinner 16px</value><usage>loading</usage><rule>공통</rule></row>
              <row><item>Button.Danger.error</item><value>유지(기본)</value><usage>error</usage><rule>Danger 자체가 오류색이므로 별도 테두리 추가 금지</rule></row>
            </rows>
          </table>
        </part>
      </section>

      <section id="6-2" title="Input (Text Field)">
        <part label="A" title="기본 규격">
          <table schema_ref="spec_table_4col">
            <rows>
              <row><item>Input.height.md</item><value>32px</value><usage>기본</usage><rule>폼 기본</rule></row>
              <row><item>Input.height.lg</item><value>40px</value><usage>설정/긴 폼</usage><rule>가독성 우선 화면</rule></row>
              <row><item>Input.paddingX</item><value>12px</value><usage>전체</usage><rule>좌우 패딩</rule></row>
              <row><item>Input.radius</item><value>6px</value><usage>전체</usage><rule>`radius.sm`</rule></row>
              <row><item>Input.border</item><value>1px</value><usage>전체</usage><rule>보더 고정(레이아웃 흔들림 금지)</rule></row>
              <row><item>Input.font</item><value>13px / 400</value><usage>전체</usage><rule>본문과 동일</rule></row>
              <row><item>Input.helper.font</item><value>12px</value><usage>도움말</usage><rule>`font.size.xs`</rule></row>
              <row><item>Input.error.font</item><value>12px</value><usage>오류</usage><rule>짧고 구체적으로</rule></row>
              <row><item>Input.icon</item><value>16px</value><usage>검색/클리어</usage><rule>아이콘 버튼은 32×32px</rule></row>
            </rows>
          </table>
        </part>

        <part label="B" title="상태(필수)">
          <table schema_ref="spec_table_4col">
            <rows>
              <row><item>Input.bg.default</item><value>#FFFFFF</value><usage>default</usage><rule>`color.bg.surface`</rule></row>
              <row><item>Input.border.default</item><value>#CBD5E1</value><usage>default</usage><rule>`color.border.strong`</rule></row>
              <row><item>Input.border.hover</item><value>#94A3B8</value><usage>hover</usage><rule>(기본값) 1단계 진하게</rule></row>
              <row><item>Input.border.active</item><value>#2563EB</value><usage>active</usage><rule>클릭 순간(선택)</rule></row>
              <row><item>Input.border.focus</item><value>#2563EB</value><usage>focus</usage><rule>포커스 시 보더=primary</rule></row>
              <row><item>Input.focus.ring</item><value>#93C5FD / 2px</value><usage>focus</usage><rule>공통</rule></row>
              <row><item>Input.disabled.bg</item><value>#F1F5F9</value><usage>disabled</usage><rule>`color.bg.muted`</rule></row>
              <row><item>Input.disabled.text</item><value>#475569</value><usage>disabled</usage><rule>값은 읽히게(완전 회색 금지)</rule></row>
              <row><item>Input.loading</item><value>spinner 16px</value><usage>loading</usage><rule>우측에 스피너, 입력 잠금</rule></row>
              <row><item>Input.error.border</item><value>#DC2626</value><usage>error</usage><rule>`color.danger.600`</rule></row>
              <row><item>Input.error.helper</item><value>#DC2626</value><usage>error</usage><rule>오류 텍스트는 입력 하단 1줄</rule></row>
            </rows>
          </table>
        </part>
      </section>

      <section id="6-3" title="Textarea">
        <part label="A" title="기본 규격">
          <table schema_ref="spec_table_4col">
            <rows>
              <row><item>Textarea.minHeight</item><value>96px</value><usage>비고/규칙 편집</usage><rule>3줄 기본</rule></row>
              <row><item>Textarea.maxHeight</item><value>240px</value><usage>설정</usage><rule>그 이상은 내부 스크롤</rule></row>
              <row><item>Textarea.padding</item><value>12px</value><usage>전체</usage><rule>상하좌우 동일</rule></row>
              <row><item>Textarea.resize</item><value>vertical only</value><usage>전체</usage><rule>가로 리사이즈 금지(레이아웃 붕괴)</rule></row>
            </rows>
          </table>
        </part>

        <part label="B" title="상태(필수: Input과 동일)">
          <table schema_ref="spec_table_4col">
            <rows>
              <row><item>Textarea.default</item><value>Input 동일</value><usage>default</usage><rule>스타일/보더/포커스 규칙 동일</rule></row>
              <row><item>Textarea.hover</item><value>Input 동일</value><usage>hover</usage><rule>동일</rule></row>
              <row><item>Textarea.active</item><value>Input 동일</value><usage>active</usage><rule>동일</rule></row>
              <row><item>Textarea.focus</item><value>Input 동일</value><usage>focus</usage><rule>동일</rule></row>
              <row><item>Textarea.disabled</item><value>Input 동일</value><usage>disabled</usage><rule>동일</rule></row>
              <row><item>Textarea.loading</item><value>spinner 16px</value><usage>loading</usage><rule>우측 상단에 표시</rule></row>
              <row><item>Textarea.error</item><value>danger.600</value><usage>error</usage><rule>보더+하단 메시지</rule></row>
            </rows>
          </table>
        </part>
      </section>

      <section id="6-4" title="Card">
        <part label="A" title="기본 규격">
          <table schema_ref="spec_table_4col">
            <rows>
              <row><item>Card.bg</item><value>#FFFFFF</value><usage>카드</usage><rule>`color.bg.surface`</rule></row>
              <row><item>Card.border</item><value>1px / #E2E8F0</value><usage>카드</usage><rule>`color.border.default`</rule></row>
              <row><item>Card.radius</item><value>14px</value><usage>카드</usage><rule>`radius.lg`</rule></row>
              <row><item>Card.padding</item><value>16px</value><usage>카드 본문</usage><rule>`space.4`</rule></row>
              <row><item>Card.header.height</item><value>48px</value><usage>카드 헤더</usage><rule>타이틀+액션(우측)</rule></row>
              <row><item>Card.gap</item><value>12px</value><usage>내부</usage><rule>섹션 간 간격</rule></row>
            </rows>
          </table>
        </part>

        <part label="B" title="상태(필수)">
          <table schema_ref="spec_table_4col">
            <rows>
              <row><item>Card.default</item><value>border #E2E8F0</value><usage>default</usage><rule>기본</rule></row>
              <row><item>Card.hover</item><value>border #CBD5E1 + shadow.sm</value><usage>hover</usage><rule>클릭 가능한 카드에만 적용</rule></row>
              <row><item>Card.active</item><value>border #CBD5E1</value><usage>active</usage><rule>그림자 약화(선택)</rule></row>
              <row><item>Card.focus</item><value>ring #93C5FD / 2px</value><usage>focus</usage><rule>카드가 클릭 타깃일 때만</rule></row>
              <row><item>Card.disabled</item><value>opacity 0.55</value><usage>disabled</usage><rule>클릭/입력 금지</rule></row>
              <row><item>Card.loading</item><value>skeleton</value><usage>loading</usage><rule>텍스트/표 자리 고정, 점멸 금지</rule></row>
              <row><item>Card.error</item><value>leftBorder 4px / #DC2626</value><usage>error</usage><rule>카드 내 오류 요약이 있을 때</rule></row>
            </rows>
          </table>
        </part>
      </section>

      <section id="6-5" title="Modal">
        <part label="A" title="기본 규격">
          <table schema_ref="spec_table_4col">
            <rows>
              <row><item>Modal.scrim</item><value>rgba(15,23,42,0.60)</value><usage>오버레이</usage><rule>클릭 닫기 기본 ON(필수 입력 모달 OFF)</rule></row>
              <row><item>Modal.radius</item><value>14px</value><usage>컨테이너</usage><rule>`radius.lg`</rule></row>
              <row><item>Modal.shadow</item><value>shadow.lg</value><usage>컨테이너</usage><rule>최상위 강조</rule></row>
              <row><item>Modal.padding</item><value>24px</value><usage>본문</usage><rule>`space.6`</rule></row>
              <row><item>Modal.header.height</item><value>56px</value><usage>헤더</usage><rule>제목(18px) + 닫기</rule></row>
              <row><item>Modal.footer.height</item><value>64px</value><usage>푸터</usage><rule>버튼 정렬(우측)</rule></row>
              <row><item>Modal.width.sm</item><value>480px</value><usage>단순 확인</usage><rule>확인/경고</rule></row>
              <row><item>Modal.width.md</item><value>640px</value><usage>폼</usage><rule>설정/추가</rule></row>
              <row><item>Modal.width.lg</item><value>840px</value><usage>복잡 폼</usage><rule>규칙 편집/미리보기</rule></row>
            </rows>
          </table>
        </part>

        <part label="B" title="상태(필수)">
          <table schema_ref="spec_table_4col">
            <rows>
              <row><item>Modal.default</item><value>open</value><usage>default</usage><rule>열릴 때 포커스는 첫 입력으로 이동</rule></row>
              <row><item>Modal.hover</item><value>close hover 배경 #F1F5F9</value><usage>hover</usage><rule>닫기 버튼에만 적용</rule></row>
              <row><item>Modal.active</item><value>close active 배경 #E2E8F0</value><usage>active</usage><rule>동일</rule></row>
              <row><item>Modal.focus</item><value>focus trap</value><usage>focus</usage><rule>Tab이 모달 밖으로 나가지 않게</rule></row>
              <row><item>Modal.disabled</item><value>overlay click off</value><usage>disabled</usage><rule>처리 중(예: 저장)에는 닫기 비활성</rule></row>
              <row><item>Modal.loading</item><value>skeleton + 버튼 disabled</value><usage>loading</usage><rule>저장/검증 중 표시</rule></row>
              <row><item>Modal.error</item><value>상단 에러 배너</value><usage>error</usage><rule>오류는 모달 상단 1줄 요약 + 상세(접기)</rule></row>
            </rows>
          </table>
        </part>
      </section>

      <section id="6-6" title="Drawer (우측 슬라이드 패널)">
        <part label="A" title="기본 규격">
          <table schema_ref="spec_table_4col">
            <rows>
              <row><item>Drawer.position</item><value>right</value><usage>기본</usage><rule>우측 고정(일관성)</rule></row>
              <row><item>Drawer.width</item><value>420px</value><usage>상세</usage><rule>`bp_compact`에서는 100% 모달 대체</rule></row>
              <row><item>Drawer.scrim</item><value>rgba(15,23,42,0.40)</value><usage>오버레이</usage><rule>모달보다 약하게</rule></row>
              <row><item>Drawer.shadow</item><value>shadow.md</value><usage>패널</usage><rule>본문과 분리</rule></row>
              <row><item>Drawer.header.height</item><value>56px</value><usage>헤더</usage><rule>제목 + 닫기</rule></row>
              <row><item>Drawer.padding</item><value>16px</value><usage>본문</usage><rule>`space.4`</rule></row>
            </rows>
          </table>
        </part>

        <part label="B" title="상태(필수)">
          <table schema_ref="spec_table_4col">
            <rows>
              <row><item>Drawer.default</item><value>open</value><usage>default</usage><rule>열릴 때 헤더에 포커스(스크린리더 대비)</rule></row>
              <row><item>Drawer.hover</item><value>닫기 버튼 hover</value><usage>hover</usage><rule>모달과 동일</rule></row>
              <row><item>Drawer.active</item><value>닫기 버튼 active</value><usage>active</usage><rule>모달과 동일</rule></row>
              <row><item>Drawer.focus</item><value>포커스 트랩(선택)</value><usage>focus</usage><rule>편집 드로어는 트랩 ON</rule></row>
              <row><item>Drawer.disabled</item><value>닫기 비활성</value><usage>disabled</usage><rule>저장/처리 중</rule></row>
              <row><item>Drawer.loading</item><value>skeleton</value><usage>loading</usage><rule>상세 로딩</rule></row>
              <row><item>Drawer.error</item><value>에러 배너</value><usage>error</usage><rule>오류 요약 + 재시도 버튼</rule></row>
            </rows>
          </table>
        </part>
      </section>

      <section id="6-7" title="Toast (알림)">
        <part label="A" title="기본 규격">
          <table schema_ref="spec_table_4col">
            <rows>
              <row><item>Toast.width</item><value>360px</value><usage>우상단</usage><rule>긴 메시지는 2줄까지, 이후 말줄임</rule></row>
              <row><item>Toast.padding</item><value>12px</value><usage>내부</usage><rule>`space.3`</rule></row>
              <row><item>Toast.radius</item><value>10px</value><usage>컨테이너</usage><rule>`radius.md`</rule></row>
              <row><item>Toast.gap</item><value>8px</value><usage>아이콘/텍스트</usage><rule>간격</rule></row>
              <row><item>Toast.stack.gap</item><value>8px</value><usage>여러 개</usage><rule>토스트 간 간격</rule></row>
              <row><item>Toast.position</item><value>top-right / 16px</value><usage>전역</usage><rule>화면 우상단 고정</rule></row>
              <row><item>Toast.duration.info</item><value>4000ms</value><usage>정보</usage><rule>자동 닫힘</rule></row>
              <row><item>Toast.duration.success</item><value>4000ms</value><usage>성공</usage><rule>자동 닫힘</rule></row>
              <row><item>Toast.duration.warning</item><value>6000ms</value><usage>경고</usage><rule>자동 닫힘</rule></row>
              <row><item>Toast.duration.error</item><value>0ms</value><usage>오류</usage><rule>자동 닫힘 금지(사용자 닫기)</rule></row>
            </rows>
          </table>
        </part>

        <part label="B" title="상태(필수)">
          <table schema_ref="spec_table_4col">
            <rows>
              <row><item>Toast.default</item><value>bg #FFFFFF</value><usage>default</usage><rule>Surface 스타일</rule></row>
              <row><item>Toast.hover</item><value>타이머 일시정지</value><usage>hover</usage><rule>hover 시 자동 닫힘 카운트 멈춤</rule></row>
              <row><item>Toast.active</item><value>클릭 시 상세 열기</value><usage>active</usage><rule>오류 토스트는 클릭→오류 패널(드로어)</rule></row>
              <row><item>Toast.focus</item><value>닫기 버튼 포커스 링</value><usage>focus</usage><rule>키보드로 닫기 가능</rule></row>
              <row><item>Toast.disabled</item><value>사용 안 함</value><usage>disabled</usage><rule>토스트 자체는 disabled 상태 생성 금지(대신 숨김)</rule></row>
              <row><item>Toast.loading</item><value>사용 안 함</value><usage>loading</usage><rule>로딩은 토스트 대신 인라인/버튼 스피너</rule></row>
              <row><item>Toast.error</item><value>아이콘/텍스트 danger</value><usage>error</usage><rule>오류는 `color.danger.600` 사용</rule></row>
            </rows>
          </table>
        </part>
      </section>

      <section id="6-8" title="Table (데이터 테이블)">
        <part label="A" title="기본 규격">
          <table schema_ref="spec_table_4col">
            <rows>
              <row><item>Table.header.height</item><value>40px</value><usage>헤더</usage><rule>헤더는 sticky</rule></row>
              <row><item>Table.row.height</item><value>36px</value><usage>본문</usage><rule>기본 밀도</rule></row>
              <row><item>Table.row.height.compact</item><value>32px</value><usage>대량 목록</usage><rule>화면 정보량 우선 시</rule></row>
              <row><item>Table.cell.paddingX</item><value>12px</value><usage>셀</usage><rule>좌우 패딩</rule></row>
              <row><item>Table.cell.paddingY</item><value>8px</value><usage>셀</usage><rule>상하 패딩</rule></row>
              <row><item>Table.border</item><value>1px / #E2E8F0</value><usage>전체</usage><rule>기본 보더</rule></row>
              <row><item>Table.zebra.bg</item><value>#F8FAFC</value><usage>스트라이프</usage><rule>2행마다(선택)</rule></row>
              <row><item>Table.text</item><value>13px</value><usage>본문</usage><rule>기본</rule></row>
            </rows>
          </table>
        </part>

        <part label="B" title="상태(필수)">
          <table schema_ref="spec_table_4col">
            <rows>
              <row><item>Table.default</item><value>bg #FFFFFF</value><usage>default</usage><rule>기본</rule></row>
              <row><item>Table.hover</item><value>row bg #EFF6FF</value><usage>hover</usage><rule>행 hover(선택보다 약하게)</rule></row>
              <row><item>Table.active</item><value>row bg #DBEAFE</value><usage>active</usage><rule>클릭/선택 순간</rule></row>
              <row><item>Table.focus</item><value>cell ring #93C5FD / 2px</value><usage>focus</usage><rule>키보드 탐색 시 셀 단위 포커스</rule></row>
              <row><item>Table.disabled</item><value>opacity 0.55</value><usage>disabled</usage><rule>편집 불가 테이블</rule></row>
              <row><item>Table.loading</item><value>skeleton rows</value><usage>loading</usage><rule>행 수는 고정(레이아웃 점프 금지)</rule></row>
              <row><item>Table.error</item><value>row bg #FEF2F2 + left 4px #DC2626</value><usage>error</usage><rule>오류 행 강조 + 메시지 아이콘</rule></row>
            </rows>
          </table>
        </part>

        <part label="C" title="필수 기능 규칙(일반)">
          <table schema_ref="spec_table_4col">
            <rows>
              <row><item>Table.sortIcon</item><value>16px</value><usage>헤더</usage><rule>정렬 가능 컬럼만 표시</rule></row>
              <row><item>Table.column.minWidth</item><value>80px</value><usage>컬럼</usage><rule>너무 좁으면 자동 줄바꿈 금지(말줄임)</rule></row>
              <row><item>Table.column.ellipsis</item><value>true</value><usage>긴 텍스트</usage><rule>파일명/업체명은 말줄임 + 툴팁</rule></row>
              <row><item>Table.selection</item><value>row</value><usage>목록</usage><rule>기본은 행 단위 선택</rule></row>
              <row><item>Table.bulkActions</item><value>top bar</value><usage>목록</usage><rule>다중 선택 시 상단 액션 바 노출</rule></row>
              <row><item>Table.emptyState</item><value>1 카드</value><usage>없음</usage><rule>“데이터 없음” + 다음 행동 버튼 제공</rule></row>
            </rows>
          </table>
        </part>
      </section>
    </section>

    <section id="7" title="화면별 UI 구성(구현 기준)">
      <section id="7-1" title="일괄 처리(대시보드)">
        <table schema_ref="spec_table_4col">
          <rows>
            <row><item>Dashboard.filterBar.height</item><value>56px</value><usage>상단</usage><rule>날짜 선택 + 입력폴더 + 출력폴더 + `처리 시작`</rule></row>
            <row><item>Dashboard.primaryCTA</item><value>Button.lg</value><usage>상단</usage><rule>기본 라벨: `일괄 처리 시작`</rule></row>
            <row><item>Dashboard.progressBar.height</item><value>8px</value><usage>상단/카드</usage><rule>전체 진행률(%) 표시</rule></row>
            <row><item>Dashboard.summary.card</item><value>Card</value><usage>상단</usage><rule>성공/경고/실패 건수 + 금액합계</rule></row>
            <row><item>Dashboard.table.columns</item><value>7</value><usage>목록</usage><rule>상태/업체/파일명/문서번호/금액/저장경로/결과</rule></row>
            <row><item>Dashboard.rowActions</item><value>아이콘 16px</value><usage>목록</usage><rule>보기(미리보기)/오류보기/재시도</rule></row>
            <row><item>Dashboard.failPolicy</item><value>continue</value><usage>처리</usage><rule>실패해도 다음 파일 계속</rule></row>
            <row><item>Dashboard.cancel</item><value>Button.Secondary</value><usage>처리</usage><rule>“전체 중단”은 확인 모달 필수</rule></row>
          </rows>
        </table>
      </section>

      <section id="7-2" title="업체 관리(리스트+상세)">
        <table schema_ref="spec_table_4col">
          <rows>
            <row><item>VendorList.search</item><value>Input.md</value><usage>상단</usage><rule>placeholder: `업체명/코드 검색`</rule></row>
            <row><item>VendorList.table</item><value>Table</value><usage>좌측</usage><rule>200개 업체도 스크롤/검색 즉시 반응</rule></row>
            <row><item>VendorDetail.open</item><value>Drawer(420px)</value><usage>우측</usage><rule>목록 유지한 채 상세 편집</rule></row>
            <row><item>VendorDetail.sections</item><value>Tabs(권장)</value><usage>상세</usage><rule>`기본/단가/매핑/생성규칙/예외키워드/OCR`</rule></row>
            <row><item>Vendor.save</item><value>Button.Primary</value><usage>상세</usage><rule>저장 중(loading) 닫기 disabled</rule></row>
            <row><item>Vendor.validation</item><value>inline error</value><usage>상세</usage><rule>필수값: 업체명/발행번호 포맷/저장경로</rule></row>
          </rows>
        </table>
      </section>

      <section id="7-3" title="매핑 설정 마법사(Wizard)">
        <table schema_ref="spec_table_4col">
          <rows>
            <row><item>Wizard.layout</item><value>좌:단계 / 우:내용</value><usage>마법사</usage><rule>좌측 단계폭 240px, 우측 폼</rule></row>
            <row><item>Wizard.stepper.itemHeight</item><value>40px</value><usage>단계</usage><rule>현재 단계는 `primary.50` 배경</rule></row>
            <row><item>Wizard.footer.height</item><value>72px</value><usage>하단</usage><rule>`이전/다음/저장` 고정</rule></row>
            <row><item>Wizard.sampleUpload</item><value>Drag&amp;Drop + 버튼</value><usage>1단계</usage><rule>지원: xlsx/xls/jpg/png</rule></row>
            <row><item>Wizard.mappingTable</item><value>Table</value><usage>매핑</usage><rule>필드(품명/규격/수량/…) 행 기준 매핑</rule></row>
            <row><item>Wizard.preview</item><value>Modal.lg</value><usage>검증</usage><rule>“거래명세서 미리보기”에서 오류 강조</rule></row>
            <row><item>Wizard.errorBlocking</item><value>true</value><usage>저장</usage><rule>오류 1개라도 있으면 저장 불가</rule></row>
          </rows>
        </table>
      </section>

      <section id="7-4" title="로그·리포트">
        <table schema_ref="spec_table_4col">
          <rows>
            <row><item>Report.dateRange</item><value>2×Date Input</value><usage>상단</usage><rule>기본: 오늘(또는 마지막 처리일)</rule></row>
            <row><item>Report.export</item><value>Button.Secondary</value><usage>상단</usage><rule>`엑셀 다운로드`</rule></row>
            <row><item>Report.table</item><value>Table</value><usage>본문</usage><rule>실행ID/일시/성공/실패/금액합계</rule></row>
            <row><item>Report.detail</item><value>Drawer</value><usage>상세</usage><rule>실패 사유/파일 리스트/재시도 링크</rule></row>
          </rows>
        </table>
      </section>

      <section id="7-5" title="설정">
        <table schema_ref="spec_table_4col">
          <rows>
            <row><item>Settings.path</item><value>Input + Browse</value><usage>저장경로</usage><rule>OS 파일/폴더 선택 다이얼로그 사용</rule></row>
            <row><item>Settings.ocrKey</item><value>Input(password)</value><usage>OCR</usage><rule>키는 마스킹, “테스트” 버튼 제공</rule></row>
            <row><item>Settings.motionReduce</item><value>Toggle</value><usage>접근성</usage><rule>ON이면 `motion.reduce` 적용</rule></row>
            <row><item>Settings.reset</item><value>Button.Danger</value><usage>전체</usage><rule>초기화는 확인 모달 필수</rule></row>
          </rows>
        </table>
      </section>
    </section>

    <section id="8" title="접근성(A11y) 체크리스트(필수)">
      <table schema_ref="spec_table_4col">
        <rows>
          <row><item>색 대비</item><value>4.5:1 이상</value><usage>전체</usage><rule>`text.primary` 기준, muted 남용 금지</rule></row>
          <row><item>포커스 표시</item><value>ring 2px #93C5FD</value><usage>전체</usage><rule>키보드 탐색 시 항상 보이게</rule></row>
          <row><item>키보드 내비게이션</item><value>Tab/Shift+Tab</value><usage>전체</usage><rule>시각적 순서=탭 순서</rule></row>
          <row><item>단축키</item><value>Ctrl+K/Ctrl+F/Esc</value><usage>전체</usage><rule>Esc는 모달/드로어 닫기(처리 중이면 비활성)</rule></row>
          <row><item>최소 클릭 영역</item><value>32×32px(권장 40×40px)</value><usage>버튼/아이콘</usage><rule>아이콘 버튼은 패딩으로 확보</rule></row>
          <row><item>오류 안내</item><value>텍스트+색</value><usage>입력/테이블</usage><rule>“빨간색만” 금지, 오류 문장 제공</rule></row>
          <row><item>상태 전달</item><value>아이콘+라벨</value><usage>상태 배지</usage><rule>성공/경고/실패는 텍스트 라벨 포함</rule></row>
          <row><item>모션 최소화</item><value>0ms</value><usage>전체</usage><rule>설정 ON 시 페이드/슬라이드 제거</rule></row>
          <row><item>스크롤 접근</item><value>PageUp/Down</value><usage>테이블</usage><rule>키보드로 목록 이동 가능해야 함</rule></row>
        </rows>
      </table>
    </section>

    <section id="9" title="UI QA 체크리스트(필수)">
      <table schema_ref="spec_table_4col">
        <rows>
          <row><item>상태 커버리지</item><value>7 states</value><usage>모든 컴포넌트</usage><rule>default/hover/active/focus/disabled/loading/error 확인</rule></row>
          <row><item>DPI 125%</item><value>깨짐 0건</value><usage>전체</usage><rule>텍스트 겹침/버튼 잘림/테이블 헤더 틀어짐 금지</rule></row>
          <row><item>긴 텍스트</item><value>말줄임+툴팁</value><usage>테이블</usage><rule>파일명/경로/업체명</rule></row>
          <row><item>로딩 동작</item><value>UI 멈춤 0건</value><usage>일괄 처리</usage><rule>처리 중 UI 프리즈 금지(진행률 갱신)</rule></row>
          <row><item>실패 지속 처리</item><value>계속 진행</value><usage>일괄 처리</usage><rule>1개 실패해도 나머지 완료</rule></row>
          <row><item>재시도 UX</item><value>1클릭 재시도</value><usage>일괄 처리/로그</usage><rule>실패 건만 재시도, 결과 갱신</rule></row>
          <row><item>저장/취소</item><value>중복 저장 0</value><usage>설정/업체</usage><rule>저장 중 버튼 disabled + 로딩 표시</rule></row>
          <row><item>경로/파일 권한</item><value>오류 안내</value><usage>설정/처리</usage><rule>권한/잠금 파일은 원인+해결 안내</rule></row>
          <row><item>오프라인</item><value>OCR 관련 안내</value><usage>설정</usage><rule>OCR 사용 시 네트워크 필요 문구</rule></row>
        </rows>
      </table>
    </section>

    <section id="10" title="가정(Assumptions)">
      <table schema_ref="spec_table_4col">
        <rows>
          <row><item>UI 프레임워크</item><value>PyQt(권장) 또는 동등 GUI</value><usage>전체</usage><rule>토큰/규격은 프레임워크 중립(픽셀 기준)</rule></row>
          <row><item>다크모드</item><value>미지원(v1)</value><usage>전체</usage><rule>필요 시 토큰 2세트로 확장</rule></row>
          <row><item>아이콘 세트</item><value>단일 SVG 세트</value><usage>전체</usage><rule>이모지 아이콘 금지</rule></row>
          <row><item>폰트</item><value>시스템 기본</value><usage>전체</usage><rule>Windows 기본 폰트 우선</rule></row>
          <row><item>테이블 편집</item><value>인라인 편집(선택)</value><usage>단가/규칙</usage><rule>v1에서는 모달/드로어 편집도 허용</rule></row>
          <row><item>토스트 오류 자동닫힘</item><value>0ms(수동)</value><usage>오류</usage><rule>중요 오류는 사용자가 인지할 때까지 유지</rule></row>
        </rows>
      </table>
    </section>
  </sections>
</uiux_spec>
```
