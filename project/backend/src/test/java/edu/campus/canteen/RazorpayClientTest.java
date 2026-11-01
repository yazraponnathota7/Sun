package edu.campus.canteen;

import org.junit.jupiter.api.Test;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import static org.junit.jupiter.api.Assertions.*;

class RazorpayClientTest {
  @Test void verifiesWebhookSignatureAgainstExactRawBody() throws Exception {
    String secret = "test-webhook-secret";
    String body = "{\"event\":\"payment.captured\"}";
    Mac mac = Mac.getInstance("HmacSHA256");
    mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
    String signature = HexFormat.of().formatHex(mac.doFinal(body.getBytes(StandardCharsets.UTF_8)));
    RazorpayClient client = new RazorpayClient("", "", secret);
    assertTrue(client.verifyWebhookSignature(body, signature));
    assertFalse(client.verifyWebhookSignature(body + " ", signature));
    assertFalse(client.verifyWebhookSignature(body, "bad-signature"));
  }

  @Test void refusesWebhookWhenSecretIsNotConfigured() {
    RazorpayClient client = new RazorpayClient("", "", "");
    assertFalse(client.verifyWebhookSignature("{}", "anything"));
  }
}
