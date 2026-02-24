package com.example.markuppdf.controller;


import com.example.markuppdf.dto.AnnotationDto;
import com.example.markuppdf.mapper.AnnotationMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

//@Tag(name = "Annotation API", description = "PDF 주석 관리 API")
@RestController
@RequestMapping("/api/annotations")
public class AnnotationController {

  @Autowired
  private AnnotationMapper annotationMapper;

//  @Operation(summary = "문서 주석 조회", description = "특정 문서 ID에 해당하는 모든 주석을 조회합니다.") // [적용]
  @GetMapping("/{docId}")
  public ResponseEntity<List<AnnotationDto>> getAnnotations(
      @Parameter(description = "문서 ID (파일 이름)", required = true, example = "sample.pdf")
      @PathVariable String docId) {
    List<AnnotationDto> annotations = annotationMapper.findAnnotationsByDocId(docId);
    return ResponseEntity.ok(annotations);
  }

  @PostMapping
  public ResponseEntity<Void> saveAnnotation(@RequestBody AnnotationDto annotationDto) {
    annotationMapper.saveAnnotation(annotationDto);
    return ResponseEntity.ok().build();
  }
}
