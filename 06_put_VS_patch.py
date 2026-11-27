from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


app = FastAPI()

students  = {

    1:{
        "name" : "yazra",
        "department" : "ECE",
        "gpa" : 8.9
    }
}

class Student(BaseModel):
    name: str
    department:str
    gpa:float

class StudentPatch(BaseModel):
    name: str | None = None
    department:str | None = None
    gpa:float | None = None



@app.put("/students/{student_id}")
def replace_student(student_id: int, student:Student):
    if student_id not in students:
        raise HTTPException(status_code= 404, detail="not found...")


    students[student_id] = student.model_dump()
    return students[student_id]

@app.patch("students/{student_id}")
def update_student(student_id: int, student: StudentPatch):
    if student_id not in students:
        raise HTTPException(status_code= 404, detail="not found...")

    changes = student.model_dump(exclude_unset=True)
    students[student_id].update(changes)

    return students[student_id]


#task

products = {
    1:{
        "name" : "monitor",
        "price" : 1500,
        "stock" : 10
    }
}

class productPatch(BaseModel):
    name: str | None = None
    price: float |None = None
    stock: int | None = None


@app.patch("/products/{product_id}")

def updateProduct(product_id: int, product: productPatch):
    if product_id not in  products:
        raise HTTPException(
            status_code= 404,
            detail="product not found.."
        )

    changes = product.model_dump(exclude_unset=True)
    products[product_id].update(changes)

    return products[product_id]


