from fastapi import FastAPI, HTTPException

app = FastAPI()

students = {
    1 : {"name" : "yazra", "gpa" : 8.9},
    2 : {"name" : "tt", "gpa" : 9.9},
    7 : {"name" : "tassu", "gpa" : 10}
}


@app.get("/students/{student_id}")

def get_student(student_id: int):
    if student_id not in students:
        raise HTTPException(
            status_code = 404,
            detail =  "Student not found..."
        )

    return students[student_id]



#challege 

courses = {

    2009 : "Data science",
    5003 : "Internal servers",
    8734 : "Deploymentation"
}

@app.get("/courses/{course_id}")

def get_course_info(course_id: int):
    if course_id not in courses:
        raise HTTPException(
            status_code = 404,
            detail = "not a valid course ID...."
        )

    return courses[course_id]

