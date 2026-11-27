from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI()

@app.get("/")

def home():
    return {"message" : "this is my first api program.."}


@app.get("/employ")

def employee():
    return {"status" : "retired"}


@app.get("/user/{user_id}")

def get_user(user_id : int):
    return {"user" : user_id}


@app.get("/products")

def get_students(category: str, price: float = 777.7):
    return {
        "category" : category,
        "price" : price
    }


# request bodies

class Officer(BaseModel):
    name: str
    status: str
    age: int


@app.post("/officers")

def create_officer(officer: Officer):
    return{
        "message" : "created successfully..",
        "officer" : officer
    }




# task

class Participant(BaseModel):
    name: str
    college: str
    team_size: int


@app.post("/register")

def participant_info(participant: Participant):
    return {

        "participant" : participant

    }