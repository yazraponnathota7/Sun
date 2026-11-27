from fastapi import APIRouter

router = APIRouter(prefix="/students")


@router.get("/subjects")
def get_subjects():
    return {"message": "how are you"}
