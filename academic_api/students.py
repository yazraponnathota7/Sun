from fastapi import APIRouter

router = APIRouter(prefix="/students")

@router.get("/")
def get_students():
    return {"message" : "hello"}