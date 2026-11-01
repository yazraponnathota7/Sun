package edu.campus.canteen;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

/** Minimal Razorpay REST client. Keys come from environment variables and never reach the browser (only the public key id does). */
@Component
public class RazorpayClient {
 private static final Logger log = LoggerFactory.getLogger(RazorpayClient.class);
 private final String keyId, keySecret, webhookSecret;
 private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
 private final ObjectMapper mapper = new ObjectMapper();

 public RazorpayClient(@Value("${app.razorpay.key-id:}") String keyId, @Value("${app.razorpay.key-secret:}") String keySecret, @Value("${app.razorpay.webhook-secret:}") String webhookSecret) {
   this.keyId = keyId == null ? "" : keyId.trim(); this.keySecret = keySecret == null ? "" : keySecret.trim();
   this.webhookSecret = webhookSecret == null ? "" : webhookSecret.trim();
 }
 public boolean enabled() { return !keyId.isBlank() && !keySecret.isBlank(); }
 public String keyId() { return keyId; }

 private Map<String,Object> call(String method, String path, Object body) {
   if (!enabled()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Online payments are not enabled");
   try {
     HttpRequest.Builder b = HttpRequest.newBuilder(URI.create("https://api.razorpay.com/v1" + path)).timeout(Duration.ofSeconds(20))
       .header("Authorization", "Basic " + Base64.getEncoder().encodeToString((keyId + ":" + keySecret).getBytes(StandardCharsets.UTF_8)))
       .header("Content-Type", "application/json");
     b = body == null ? b.method(method, HttpRequest.BodyPublishers.noBody())
                      : b.method(method, HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(body)));
     HttpResponse<String> r = http.send(b.build(), HttpResponse.BodyHandlers.ofString());
     if (r.statusCode() / 100 != 2) {
       log.warn("Razorpay {} {} returned HTTP {}", method, path, r.statusCode());
       throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "The payment provider could not complete the request. Please try again.");
     }
     return mapper.readValue(r.body(), new TypeReference<Map<String,Object>>() {});
   } catch (ResponseStatusException e) { throw e;
   } catch (InterruptedException e) { Thread.currentThread().interrupt(); throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Payment request was interrupted");
   } catch (Exception e) { log.warn("Razorpay call failed: {}", e.toString()); throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not reach the payment provider. Please try again."); }
 }
 public Map<String,Object> createOrder(long paise, String receipt) {
   return call("POST", "/orders", Map.of("amount", paise, "currency", "INR", "receipt", receipt));
 }
 /** Returns the id of a captured payment for this Razorpay order, or null. */
 public String capturedPaymentId(String razorpayOrderId) {
   Object items = call("GET", "/orders/" + razorpayOrderId + "/payments", null).get("items");
   if (items instanceof List<?> l) for (Object o : l) if (o instanceof Map<?,?> m && "captured".equals(m.get("status"))) return String.valueOf(m.get("id"));
   return null;
 }
 public void refund(String paymentId) { call("POST", "/payments/" + paymentId + "/refund", Map.of()); }
 public boolean verifyWebhookSignature(String rawBody, String signature) {
   if (webhookSecret.isBlank() || rawBody == null || signature == null || signature.isBlank()) return false;
   try {
     Mac mac = Mac.getInstance("HmacSHA256");
     mac.init(new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
     String expected = HexFormat.of().formatHex(mac.doFinal(rawBody.getBytes(StandardCharsets.UTF_8)));
     return MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), signature.getBytes(StandardCharsets.UTF_8));
   } catch (Exception e) { return false; }
 }
 public boolean verifySignature(String orderId, String paymentId, String signature) {
   try {
     Mac mac = Mac.getInstance("HmacSHA256"); mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
     String expected = HexFormat.of().formatHex(mac.doFinal((orderId + "|" + paymentId).getBytes(StandardCharsets.UTF_8)));
     return MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), signature.getBytes(StandardCharsets.UTF_8));
   } catch (Exception e) { return false; }
 }
}
