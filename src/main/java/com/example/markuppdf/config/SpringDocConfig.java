package com.example.markuppdf.config;


import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springdoc.core.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SpringDocConfig {

  @Bean
  public OpenAPI customOpenAPI() {
    return new OpenAPI()
        .info(new Info()
            .title("Markup PDF API")
            .version("1.0")
            .description("Markup PDF API 화면입니다."));
  }

  @Bean
  public GroupedOpenApi api() {
//    String[] paths = {"/api/v1/**"};
    String[] paths = {"/api/**"};
    String[] packagesToScan = {"com.example.markuppdf"};
    return GroupedOpenApi.builder().group("springdoc-openapi")
        .pathsToMatch(paths)
        .packagesToScan(packagesToScan)
        .build();
  }

}
