from fastapi import FastAPI, UploadFile, File

app = FastAPI()

@app.get("/")
def home():
    return {"status":"server running"}

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    return {"filename": file.filename}
