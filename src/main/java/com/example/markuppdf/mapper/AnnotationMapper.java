package com.example.markuppdf.mapper;


import com.example.markuppdf.dto.AnnotationDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface AnnotationMapper {
  List<AnnotationDto> findAnnotationsByDocId(String docId);

  void saveAnnotation(AnnotationDto annotationDto);
}