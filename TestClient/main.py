from fastapi import FastAPI, HTTPException

app = FastAPI()

products = {
    1 : {"name" : "iphone"}
}




@app.get("/product/{product_id}")
def get_product(product_id: int):

    if product_id not in products:
        raise HTTPException(
            status_code= 404,
            detail="product not found"
        )
    return products[product_id]
