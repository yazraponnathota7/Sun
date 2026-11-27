from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

product = {
    "name": "Iphone",
    "price": 8988,
    "password": 1234
}


class Product(BaseModel):
    name: str
    price: float
    password: int


class ProductResponse(BaseModel):
    name: str
    price: float


@app.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int):

    return {
        "name": "Iphone",
        "price": 8988,
        "password": 1234

    }
