package com.example.markuppdf;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.module.blackbird.BlackbirdModule;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class MarkupPdfApplication {

  public static void main(String[] args) {
    SpringApplication.run(MarkupPdfApplication.class, args);
  }

  @Bean
  public ObjectMapper objectMapper() {
    return JsonMapper
        .builder()
        .addModule(new BlackbirdModule())
        .build();
  }

}
