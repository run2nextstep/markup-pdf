package com.example.markuppdf.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;
import java.nio.file.Files;

@Controller
public class PdfController {

  // 뷰어 페이지를 보여주는 기본 매핑
  @GetMapping("/viewer")
  public String viewerPage() {
    return "viewer"; // templates/viewer.html을 찾습니다.
  }

  // PDF 파일을 데이터로 제공하는 API
  @GetMapping("/files/{fileName:.+}")
  @ResponseBody
  public ResponseEntity<byte[]> getPdfFile(@PathVariable String fileName) throws IOException {
    // ClassPathResource를 사용하여 resources/static/files 디렉토리에서 파일을 찾습니다.
    Resource resource = new ClassPathResource("static/files/" + fileName);

    if (!resource.exists()) {
      return ResponseEntity.notFound().build();
    }

    byte[] fileContent = Files.readAllBytes(resource.getFile().toPath());

    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_PDF)
        .body(fileContent);
  }
}