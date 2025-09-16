package com.example.markuppdf.dto;

public class AnnotationDto {
  private String docId;
  private int pageNum;
  private String annotationData;

  // Getter, Setter, 생성자 등
  public String getDocId() { return docId; }
  public void setDocId(String docId) { this.docId = docId; }
  public int getPageNum() { return pageNum; }
  public void setPageNum(int pageNum) { this.pageNum = pageNum; }
  public String getAnnotationData() { return annotationData; }
  public void setAnnotationData(String annotationData) { this.annotationData = annotationData; }
}