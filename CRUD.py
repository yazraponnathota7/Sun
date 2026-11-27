from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

products = {
    1: {"name": "monitor", "price": 2000},
    2: {"name": "mouse", "price": 500}
}


# READ

@app.get("/products/{product_id}")
def get_products(product_id: int):
    if product_id not in products:
        raise HTTPException(
            status_code=404,
            detail="Product not found.."
        )
    return products[product_id]

# CREATE


class Product(BaseModel):
    name: str
    price: float


@app.post("/products")
def add_product(product: Product):

    new_id = max(products.keys()) + 1

    products[new_id] = product.model_dump()

    return {
        "id": new_id,
        **products[new_id]
    }

# update


@app.put("/products/{product_id}")
def update_product(product_id: int, product: Product):

    if product_id not in products:
        raise HTTPException(
            status_code=404,
            detail="Not found"
        )

    products[product_id] = product.model_dump()

    return {
        "id": product_id,
        **products[product_id]
    }

# patch


class ProductsPatch(BaseModel):
    name: str | None = None
    price: float | None = None


@app.patch("/products/{product_id}")
def modify_product(product_id: int, product: ProductsPatch):
    if product_id not in products:
        raise HTTPException(
            status_code=404,
            detail="not found.."
        )

    changes = product.model_dump(exclude_unset=True)
    products[product_id].update(changes)

    return products[product_id]


# delete

@app.delete("/products/{product_id}")
def delete_product(product_id: int):

    if product_id not in products:
        raise HTTPException(
            status_code=404,
            detail="not found.."
        )

    delete_item = products.pop(product_id)

    return {
        "message": "successfully deleted",
        "product": delete_item
    }
