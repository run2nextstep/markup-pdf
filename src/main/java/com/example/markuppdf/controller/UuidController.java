package com.example.markuppdf.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.uuid.Generators;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UuidController {
  private final Logger logger = LogManager.getLogger(this.getClass());

  private final ObjectMapper mapper;

  public UuidController(ObjectMapper mapper) {
    this.mapper = mapper;
  }

  // UUIDv4
  @GetMapping("/api/uuidv4")
  public ResponseEntity<ObjectNode> generateUuidV4() {
    String uuid = java.util.UUID.randomUUID().toString();
    logger.info("#### uuid v4 : {}", uuid);

    ObjectNode objectNode = mapper.createObjectNode();
    objectNode.put("version", 4);
    objectNode.put("uuid", uuid);

    return new ResponseEntity<>(objectNode, HttpStatus.OK);
  }

  // UUIDv4
  @GetMapping("/api/uuidv7")
  public ResponseEntity<ObjectNode> generateUuidV7() {

    String uuid = Generators.timeBasedEpochGenerator().generate().toString();
    logger.info("#### uuid v7 : {}", uuid);

    ObjectNode objectNode = mapper.createObjectNode();
    objectNode.put("version", 7);
    objectNode.put("uuid", uuid);

    return new ResponseEntity<>(objectNode, HttpStatus.OK);
  }

}
