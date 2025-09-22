package com.example.markuppdf.config;

import io.swagger.v3.oas.models.Operation;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;

@Component
public class TagOperationCustomizer implements OperationCustomizer {

  @Override
  public Operation customize(Operation operation, HandlerMethod handlerMethod) {
    Class<?> controllerClass = handlerMethod.getBeanType();
    String packageName = controllerClass.getPackage().getName();
    String methodName = handlerMethod.getMethod().getName();

    // 패키지별 태그 지정
    if (packageName.contains(".api.user")) {
      operation.addTagsItem("사용자 API");
    } else if (packageName.contains(".api.admin")) {
      operation.addTagsItem("관리자 API");
    } else if (packageName.contains(".web")) {
      operation.addTagsItem("웹 페이지");
    }

    // 메서드명 패턴별 추가 태그
    if (methodName.startsWith("create") || methodName.startsWith("save")) {
      operation.addTagsItem("생성/저장");
    } else if (methodName.startsWith("update") || methodName.startsWith("modify")) {
      operation.addTagsItem("수정");
    } else if (methodName.startsWith("delete") || methodName.startsWith("remove")) {
      operation.addTagsItem("삭제");
    }

    return operation;
  }

}
