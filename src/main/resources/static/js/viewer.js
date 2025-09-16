import * as pdfjsLib from '/js/lib/pdfjs/5.4.149/pdf.mjs';
import {Canvas, PencilBrush} from '/js/lib/fabricjs/6.7.1/index.min.mjs';

// [추가] Fabric.js 캔버스 인스턴스를 저장할 변수
let fabricCanvas = null;

// [추가] 페이지별 주석 데이터를 저장할 객체
let annotationStore = {};

// [추가] 현재 문서의 식별자. 실제로는 동적으로 받아와야 합니다.
const docId = 'sample.pdf';

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

        // [추가] 렌더링이 완료된 후, 해당 페이지의 주석을 불러옵니다.
        loadAnnotations(num);
      });

      // 페이지 번호 업데이트
      $('#page-num').text(num);
    });
  };

  // [추가] 현재 페이지의 주석을 저장하는 함수
  const saveAnnotations = (pageNumToSave) => {
    // 캔버스에 객체가 하나 이상 있을 때만 저장합니다.
    if (fabricCanvas && fabricCanvas.getObjects().length > 0) {
      console.log(`Saving annotations for page ${pageNumToSave}`);
      // toJSON()은 캔버스의 모든 객체 정보를 JSON 형식으로 변환합니다.
      annotationStore[pageNumToSave] = fabricCanvas.toJSON();
    } else {
      // 만약 객체가 없다면 (모두 지웠다면) 해당 페이지의 데이터는 삭제합니다.
      delete annotationStore[pageNumToSave];
    }
  };

  // [추가] 특정 페이지의 주석을 불러오는 함수
  const loadAnnotations = (pageNumToLoad) => {
    // 먼저 캔버스를 깨끗하게 비웁니다.
    fabricCanvas.clear();

    // 저장된 주석 데이터가 있는지 확인합니다.
    if (annotationStore[pageNumToLoad]) {
      console.log(`Loading annotations for page ${pageNumToLoad}`);
      // loadFromJSON()으로 저장된 JSON 데이터를 캔버스에 다시 그립니다.
      fabricCanvas.loadFromJSON(annotationStore[pageNumToLoad], () => {
        // 데이터를 모두 불러온 후 캔버스를 다시 렌더링해야 보입니다.
        fabricCanvas.requestRenderAll();
      });
    }
  };

  // 이전 페이지 보기
  const showPrevPage = () => {
    if (pageNum <= 1) {
      return;
    }
    saveAnnotations(pageNum); // 현재 페이지를 떠나기 전에 저장
    pageNum--;
    queueRenderPage(pageNum);
  };

  // 다음 페이지 보기
  const showNextPage = () => {
    if (pageNum >= pdfDoc.numPages) {
      return;
    }
    saveAnnotations(pageNum); // 현재 페이지를 떠나기 전에 저장
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
    // renderPage(pageNum);

    // [추가] PDF 로드 성공 후, 서버에서 기존 주석을 불러옵니다.
    $.get(`/api/annotations/${docId}`, function(data) {
      console.log("Annotations loaded from server:", data);
      // 불러온 데이터를 annotationStore에 페이지별로 정리합니다.
      data.forEach(item => {
        // DB에서 가져온 데이터는 문자열이므로 JSON 객체로 파싱합니다.
        annotationStore[item.pageNum] = JSON.parse(item.annotationData);
      });
      // 주석 로드가 끝난 후 첫 페이지를 렌더링합니다.
      renderPage(pageNum);
    });
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

  // [추가] 저장 버튼 이벤트 핸들러
  $('#save-btn').on('click', () => {
    // 현재 그리고 있는 페이지의 주석을 먼저 저장
    saveAnnotations(pageNum);

    alert('저장을 시작합니다.');
    const savePromises = [];

    // annotationStore에 있는 모든 페이지의 주석을 서버로 전송
    for (const [page, data] of Object.entries(annotationStore)) {
      const annotationData = {
        docId: docId,
        pageNum: parseInt(page),
        // 서버로 보낼 때는 JSON 객체를 다시 문자열로 변환합니다.
        annotationData: JSON.stringify(data)
      };

      const request = $.ajax({
        url: '/api/annotations',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(annotationData)
      });
      savePromises.push(request);
    }

    // 모든 저장 요청이 완료될 때까지 기다립니다.
    Promise.all(savePromises)
      .then(() => {
        alert('모든 주석이 성공적으로 저장되었습니다.');
      })
      .catch((err) => {
        console.error('저장 중 오류 발생:', err);
        alert('주석 저장에 실패했습니다.');
      });
  });
});