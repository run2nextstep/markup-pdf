import * as pdfjsLib from '/js/lib/pdfjs/5.4.149/pdf.mjs';

$(document).ready(function() {
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

  // 페이지 렌더링 함수
  const renderPage = num => {
    pageIsRendering = true;

    // 페이지 가져오기
    pdfDoc.getPage(num).then(page => {
      const viewport = page.getViewport({ scale });
      pdfCanvas.height = viewport.height;
      pdfCanvas.width = viewport.width;

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
});