import * as pdfjsLib from '/js/lib/pdfjs/5.4.149/pdf.mjs';
import {Canvas, PencilBrush} from '/js/lib/fabricjs/6.7.1/index.min.mjs';

// [추가] Fabric.js 캔버스 인스턴스를 저장할 변수
let fabricCanvas = null;

$(document).ready(function () {
  // PDF.js worker 설정
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/lib/pdfjs/5.4.149/pdf.worker.mjs';

  // PDF 파일 URL (Controller에서 제공하는 경로)
  const url = '/files/sample.pdf';

  let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

  const scale = 1.5,
    pdfCanvas = document.getElementById('pdf-canvas'),
    ctx = pdfCanvas.getContext('2d');

  // [추가] Fabric.js 캔버스 초기화
  // 'fabric-canvas'는 html의 두 번째 canvas id입니다.
  // isDrawingMode: false -> 기본적으로는 그리기 모드가 아닌 선택 모드로 시작합니다.
  fabricCanvas = new Canvas('fabric-canvas', {
    isDrawingMode: false
  });

  // 페이지 렌더링 함수
  const renderPage = num => {
    pageIsRendering = true;

    // 페이지 가져오기
    pdfDoc.getPage(num).then(page => {
      const viewport = page.getViewport({scale});

      // PDF 캔버스 크기 설정
      pdfCanvas.height = viewport.height;
      pdfCanvas.width = viewport.width;

      // [추가] Fabric 캔버스 크기를 PDF 캔버스와 동일하게 설정 (매우 중요!)
      // 이렇게 해야 주석이 PDF 페이지 위에 정확하게 위치합니다.
      fabricCanvas.setWidth(viewport.width);
      fabricCanvas.setHeight(viewport.height);

      const renderCtx = {
        canvasContext: ctx,
        viewport
      };

      page.render(renderCtx).promise.then(() => {
        pageIsRendering = false;

        if (pageNumIsPending !== null) {
          renderPage(pageNumIsPending);
          pageNumIsPending = null;
        }
      });

      // 페이지 번호 업데이트
      $('#page-num').text(num);
    });
  };

  // 이전 페이지 보기
  const showPrevPage = () => {
    if (pageNum <= 1) {
      return;
    }
    pageNum--;
    queueRenderPage(pageNum);
  };

  // 다음 페이지 보기
  const showNextPage = () => {
    if (pageNum >= pdfDoc.numPages) {
      return;
    }
    pageNum++;
    queueRenderPage(pageNum);
  };

  // 렌더링 큐
  const queueRenderPage = num => {
    if (pageIsRendering) {
      pageNumIsPending = num;
    } else {
      renderPage(num);
    }
  };

  // PDF 문서 로드
  pdfjsLib.getDocument(url).promise.then(doc => {
    pdfDoc = doc;
    $('#page-count').text(pdfDoc.numPages);
    renderPage(pageNum);
  }).catch(err => {
    console.error('Error loading PDF: ' + err);
  });

  // 버튼 이벤트
  $('#prev-page').on('click', showPrevPage);
  $('#next-page').on('click', showNextPage);

  // [추가] 펜(그리기) 버튼 이벤트 핸들러
  $('#draw-btn').on('click', () => {
    // isDrawingMode 속성을 현재 상태의 반대로 변경 (true -> false, false -> true)
    fabricCanvas.isDrawingMode = !fabricCanvas.isDrawingMode;

    // 사용자에게 현재 상태를 알려주기 위해 버튼 스타일 변경
    if (fabricCanvas.isDrawingMode) {
      $('#draw-btn').css('background-color', '#aaddff'); // 활성화 색상

      // [변경] 새로운 PencilBrush 인스턴스를 생성하여 할당합니다.
      // 브러쉬의 속성을 설정하고, 캔버스의 freeDrawingBrush에 지정해줍니다.
      const pencilBrush = new PencilBrush(fabricCanvas);
      pencilBrush.color = "red";
      pencilBrush.width = 3;
      fabricCanvas.freeDrawingBrush = pencilBrush;
    } else {
      $('#draw-btn').css('background-color', ''); // 기본 색상
    }
  });
});