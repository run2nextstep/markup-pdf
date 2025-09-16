package com.example.markuppdf.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

  @Override
  public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
    // .mjs 확장자에 대한 MIME 타입을 'application/javascript'로 설정합니다.
    configurer.mediaType("mjs", MediaType.valueOf("application/javascript"));
  }

}