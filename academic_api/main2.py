from fastapi import FastAPI
from students import router as student_router
from Subjects import router as subject_router

app = FastAPI()

app.include_router(student_router)
app.include_router(subject_router)