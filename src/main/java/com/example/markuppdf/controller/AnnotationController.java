package com.example.markuppdf.controller;


import com.example.markuppdf.dto.AnnotationDto;
import com.example.markuppdf.mapper.AnnotationMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/annotations")
public class AnnotationController {

  @Autowired
  private AnnotationMapper annotationMapper;

  @GetMapping("/{docId}")
  public ResponseEntity<List<AnnotationDto>> getAnnotations(@PathVariable String docId) {
    List<AnnotationDto> annotations = annotationMapper.findAnnotationsByDocId(docId);
    return ResponseEntity.ok(annotations);
  }

  @PostMapping
  public ResponseEntity<Void> saveAnnotation(@RequestBody AnnotationDto annotationDto) {
    annotationMapper.saveAnnotation(annotationDto);
    return ResponseEntity.ok().build();
  }
}
