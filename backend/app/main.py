from fastapi import FastAPI

app = FastAPI(
    title="Fantasy Hub API",
    version="0.1.0"
)

@app.get("/")
def root():
    return {"message": "Fantasy Hub backend is running"}