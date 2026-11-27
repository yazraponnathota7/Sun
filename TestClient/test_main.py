from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_product_not_found():
    response = client.get("/products/99")

    assert response.status_code == 404
    assert response.json() == {
        "detail": "product not found"
    }
