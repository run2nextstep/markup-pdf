import * as pdfjsLib from '/js/lib/pdfjs/5.4.149/pdf.mjs';
import {Canvas, PencilBrush, IText, Rect, Circle, classRegistry, util} from '/js/lib/fabricjs/6.7.1/index.min.mjs';

// ----- 커스텀 클래스 정의 -----
class CustomCheckbox extends Rect {
  static type = 'CustomCheckbox';

  constructor(options = {}) {
    options.width = 20;
    options.height = 20;
    options.fill = 'white';
    options.stroke = 'black';
    options.strokeWidth = 2;
    super(options);
    this.checked = options.checked || false;
  }

  _render(ctx) {
    super._render(ctx);
    if (this.checked) {
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-this.width / 2 + 4, 0);
      ctx.lineTo(-this.width / 2 + 8, this.height / 2 - 4);
      ctx.lineTo(this.width / 2 - 4, -this.height / 2 + 6);
      ctx.stroke();
    }
  }

  toggle() {
    this.checked = !this.checked;
  }

  toObject(propertiesToInclude = []) {
    return super.toObject(propertiesToInclude.concat(['checked']));
  }

  static async fromObject(object) {
    return new CustomCheckbox(object);
  }
}

class CustomRadioButton extends Circle {
  static type = 'CustomRadioButton';

  constructor(options = {}) {
    options.radius = 10;
    options.fill = 'white';
    options.stroke = 'black';
    options.strokeWidth = 2;
    super(options);
    this.groupName = options.groupName || 'defaultGroup';
    this.checked = options.checked || false;
  }

  _render(ctx) {
    super._render(ctx);
    if (this.checked) {
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius / 2, 0, Math.PI * 2, false);
      ctx.fill();
    }
  }

  select() {
    if (this.checked) return;
    this.checked = true;
    this.canvas.getObjects().forEach(obj => {
      if (obj.type === 'CustomRadioButton' && obj.groupName === this.groupName && obj !== this) obj.deselect();
    });
  }

  deselect() {
    this.checked = false;
  }

  toObject(propertiesToInclude = []) {
    return super.toObject(propertiesToInclude.concat(['checked', 'groupName']));
  }

  static async fromObject(object) {
    return new CustomRadioButton(object);
  }
}

classRegistry.setClass(CustomCheckbox);
classRegistry.setClass(CustomRadioButton);

// ----- `v0.0.1` 기능 포함 전체 로직 -----
let fabricCanvas = null;
let annotationStore = {};
const docId = 'sample.pdf';
let currentMode = 'select';

$(document).ready(function () {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/lib/pdfjs/5.4.149/pdf.worker.mjs';

  const url = `/files/${docId}`;
  let pdfDoc = null, pageNum = 1, pageIsRendering = false, pageNumIsPending = null;
  const scale = 1.5, pdfCanvas = document.getElementById('pdf-canvas'), ctx = pdfCanvas.getContext('2d');
  fabricCanvas = new Canvas('fabric-canvas', {isDrawingMode: false});

  const setMode = (mode) => {
    currentMode = mode;
    if (mode === 'draw') {
      fabricCanvas.isDrawingMode = true;
      const pencilBrush = new PencilBrush(fabricCanvas);
      pencilBrush.color = "red";
      pencilBrush.width = 3;
      fabricCanvas.freeDrawingBrush = pencilBrush;
    } else {
      fabricCanvas.isDrawingMode = false;
    }

    $('#draw-btn, #text-btn, #checkbox-btn, #radio-btn').css('background-color', '');
    if (mode !== 'select') $(`#${mode}-btn`).css('background-color', '#aaddff');
  };

  const addText = (pointer) => {
    const text = new IText('내용 입력', {
      left: pointer.x, top: pointer.y, fontFamily: 'sans-serif',
      fontSize: 20, fill: 'blue', editable: true
    });
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    text.enterEditing();
    setMode('select');
  };

  // 페이지 렌더링, 저장/불러오기, 페이지 이동 함수 (수정 없음)
  const renderPage = num => {
    pageIsRendering = true;
    pdfDoc.getPage(num).then(page => {
      const viewport = page.getViewport({scale});
      pdfCanvas.height = viewport.height;
      pdfCanvas.width = viewport.width;
      fabricCanvas.setWidth(viewport.width);
      fabricCanvas.setHeight(viewport.height);
      const renderCtx = {canvasContext: ctx, viewport};
      page.render(renderCtx).promise.then(() => {
        pageIsRendering = false;
        if (pageNumIsPending !== null) {
          renderPage(pageNumIsPending);
          pageNumIsPending = null;
        }
        loadAnnotations(num);
      });
      $('#page-num').text(num);
    });
  };
  const saveAnnotations = (pageNumToSave) => {
    if (fabricCanvas && fabricCanvas.getObjects().length > 0) {
      annotationStore[pageNumToSave] = fabricCanvas.toJSON();
    } else {
      delete annotationStore[pageNumToSave];
    }
  };
  const loadAnnotations = (pageNumToLoad) => {
    fabricCanvas.clear();
    if (annotationStore[pageNumToLoad]) {
      fabricCanvas.loadFromJSON(annotationStore[pageNumToLoad], () => {
        fabricCanvas.requestRenderAll();
      });
    }
  };
  const showPrevPage = () => {
    if (pageNum <= 1) return;
    saveAnnotations(pageNum);
    pageNum--;
    queueRenderPage(pageNum);
  };
  const showNextPage = () => {
    if (pageNum >= pdfDoc.numPages) return;
    saveAnnotations(pageNum);
    pageNum++;
    queueRenderPage(pageNum);
  };
  const queueRenderPage = num => {
    if (pageIsRendering) {
      pageNumIsPending = num;
    } else {
      renderPage(num);
    }
  };

  pdfjsLib.getDocument(url).promise.then(doc => {
    pdfDoc = doc;
    $('#page-count').text(pdfDoc.numPages);
    $.get(`/api/annotations/${docId}`, function (data) {
      data.forEach(item => {
        annotationStore[item.pageNum] = JSON.parse(item.annotationData);
      });
      renderPage(pageNum);
    });
  });

  fabricCanvas.on('mouse:down', (options) => {
    const target = options.target;
    if (target) {
      if (target.type === 'CustomCheckbox') {
        target.toggle();
        target.dirty = true;
        fabricCanvas.requestRenderAll();
      } else if (target.type === 'CustomRadioButton') {
        target.select();
        fabricCanvas.getObjects().forEach(obj => {
          if (obj.dirty === false) obj.dirty = true;
        });
        fabricCanvas.requestRenderAll();
      }
      return;
    }

    if (currentMode === 'text') {
      addText(options.pointer);
    } else if (currentMode === 'checkbox') {
      const checkbox = new CustomCheckbox({left: options.pointer.x, top: options.pointer.y});
      fabricCanvas.add(checkbox);
      setMode('select');
    } else if (currentMode === 'radio') {
      const groupName = prompt("라디오 그룹 이름을 입력하세요:", "그룹1");
      if (groupName) {
        const radio = new CustomRadioButton({left: options.pointer.x, top: options.pointer.y, groupName: groupName});
        fabricCanvas.add(radio);
      }
      setMode('select');
    }
  });

  $('#prev-page').on('click', showPrevPage);
  $('#next-page').on('click', showNextPage);
  $('#draw-btn, #text-btn, #checkbox-btn, #radio-btn').on('click', function () {
    const newMode = this.id.replace('-btn', '');
    setMode(currentMode === newMode ? 'select' : newMode);
  });

  $('#save-btn').on('click', () => {
    saveAnnotations(pageNum);
    alert('저장을 시작합니다.');
    const savePromises = [];
    for (const [page, data] of Object.entries(annotationStore)) {
      const annotationData = {docId: docId, pageNum: parseInt(page), annotationData: JSON.stringify(data)};
      const request = $.ajax({
        url: '/api/annotations',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(annotationData)
      });
      savePromises.push(request);
    }
    Promise.all(savePromises).then(() => alert('모든 주석이 성공적으로 저장되었습니다.')).catch((err) => alert('주석 저장에 실패했습니다.'));
  });
});