package edu.campus.canteen;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import java.util.Map;

/** Always answers with {"message": "..."} so the frontend can show a clear error. */
@RestControllerAdvice
public class ApiExceptionHandler {
 private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);
 private static ResponseEntity<Map<String,Object>> reply(int status, String message) {
   return ResponseEntity.status(status).body(Map.of("message", message));
 }
 @ExceptionHandler(MethodArgumentNotValidException.class)
 ResponseEntity<Map<String,Object>> invalid(MethodArgumentNotValidException e) {
   String msg = e.getBindingResult().getFieldErrors().stream().findFirst()
     .map(f -> f.getField() + " " + f.getDefaultMessage()).orElse("Invalid request");
   return reply(400, msg);
 }
 @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
 ResponseEntity<Map<String,Object>> unreadable(Exception e) { return reply(400, "The request contains invalid data"); }
 @ExceptionHandler(DuplicateKeyException.class)
 ResponseEntity<Map<String,Object>> duplicate(DuplicateKeyException e) { return reply(409, "That value is already in use"); }
 @ExceptionHandler(DataIntegrityViolationException.class)
 ResponseEntity<Map<String,Object>> integrity(DataIntegrityViolationException e) {
   log.warn("Data integrity violation", e); return reply(409, "This change conflicts with existing data (for example, an item that is still in use)");
 }
 @ExceptionHandler(Exception.class)
 ResponseEntity<Map<String,Object>> other(Exception e) {
   if (e instanceof ErrorResponse er) {
     String detail = er.getBody().getDetail();
     return reply(er.getStatusCode().value(), detail == null || detail.isBlank() ? "Request failed" : detail);
   }
   log.error("Unexpected error", e);
   return reply(500, "Something went wrong on the server. Please try again.");
 }
}
