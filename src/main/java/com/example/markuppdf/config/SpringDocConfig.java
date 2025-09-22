package com.example.markuppdf.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
public class SpringDocConfig {

  @Autowired
  private TagOperationCustomizer tagCustomizer;

  @Bean
  public OpenAPI customOpenAPI() {
    return new OpenAPI()
        .info(new Info()
            .title("Markup PDF API")
            .version("1.0")
            .description("Markup PDF API"))
        .servers(Arrays.asList(
            new Server()
                .url("https://doc.signok.com")
                .description("운영 서버"),
            new Server()
                .url("https://stg-doc.signok.com")
                .description("확인 서버"),
            new Server()
                .url("http://localhost:8080")
                .description("로컬 개발 서버")
        ));
  }

  @Bean
  public GroupedOpenApi api() {
//    String[] paths = {"/api/v1/**"};
    String[] paths = {"/api/**"};
    String[] packagesToScan = {"com.example.markuppdf"};
    return GroupedOpenApi.builder().group("REST API")
        .pathsToMatch(paths)
        .packagesToScan(packagesToScan)
        .addOperationCustomizer(tagCustomizer)
        .addOpenApiCustomiser(openApi -> {
          openApi.info(new Info()
              .title("REST API Documentation")
              .description("API 전용")
              .version("1.0.0"));

//          // API 그룹에만 표시될 태그 정의 (JDK 1.8 호환)
//          openApi.setTags(Arrays.asList(
//              new Tag().name("User API").description("사용자 관련 API"),
//              new Tag().name("Product API").description("상품 관련 API"),
//              new Tag().name("Order API").description("주문 관련 API")
//          ));

          // 원하는 태그 순서 정의 (JDK 1.8 호환)
          java.util.List<String> tagOrder = Arrays.asList(
              "사용자 API", "상품 API", "주문 API", "관리자 API"
          );

          // 태그 순서대로 정렬
          if (openApi.getTags() != null) {
            openApi.getTags().sort((tag1, tag2) -> {
              int index1 = tagOrder.indexOf(tag1.getName());
              int index2 = tagOrder.indexOf(tag2.getName());

              if (index1 == -1) index1 = tagOrder.size();
              if (index2 == -1) index2 = tagOrder.size();

              return Integer.compare(index1, index2);
            });
          }
        })
        .build();
  }

  @Bean
  public GroupedOpenApi general() {
//    String[] paths = {"/api/v1/**"};
    String[] paths = {"/api/**"};
    String[] packagesToScan = {"com.example.markuppdf"};
    return GroupedOpenApi.builder().group("Web Url")
        .pathsToMatch("/**")
        .pathsToExclude(paths)
        .packagesToScan(packagesToScan)
        .addOperationCustomizer(tagCustomizer)
        .addOpenApiCustomiser(openApi -> {
          openApi.info(new Info()
              .title("Web Controller Documentation")
              .description("사용자 웹 컨트롤러")
              .version("1.0.0")
          );

//          // API 그룹에만 표시될 태그 정의 (JDK 1.8 호환)
//          openApi.setTags(Arrays.asList(
//              new Tag().name("User Web").description("사용자 웹 페이지")
//          ));

          // 원하는 태그 순서 정의 (JDK 1.8 호환)
          java.util.List<String> tagOrder = Arrays.asList(
              "사용자 API", "상품 API", "주문 API", "관리자 API"
          );

          // 태그 순서대로 정렬
          if (openApi.getTags() != null) {
            openApi.getTags().sort((tag1, tag2) -> {
              int index1 = tagOrder.indexOf(tag1.getName());
              int index2 = tagOrder.indexOf(tag2.getName());

              if (index1 == -1) index1 = tagOrder.size();
              if (index2 == -1) index2 = tagOrder.size();

              return Integer.compare(index1, index2);
            });
          }
        })
        .build();
  }

}
