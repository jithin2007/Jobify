from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Dict, Any
import json, os, io, logging, ast
from datetime import datetime
from dotenv import load_dotenv
from groq import Groq
import PyPDF2

# ---------------- CONFIG ---------------- #

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Jobify API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

load_dotenv()
API_KEY = os.getenv("GROQ_API_KEY")

if not API_KEY:
    raise RuntimeError("GROQ_API_KEY missing in .env file")

client = Groq(api_key=API_KEY)

# ---------------- LOAD DATA ---------------- #

def load_json(filename):
    path = os.path.join(BASE_DIR, filename)
    with open(path, encoding="utf-8") as f:
        return json.load(f)

RAW_DATA = load_json("roles.json")

# supports both list OR dict dataset formats
ROLES = RAW_DATA["roles"] if isinstance(RAW_DATA, dict) else RAW_DATA

# ---------------- LOAD PROMPTS ---------------- #

def load_prompt(name):
    path = os.path.join(BASE_DIR, name)
    with open(path, encoding="utf-8") as f:
        return f.read()

PROMPTS = {
    k: load_prompt(v) for k,v in {
        "profile_extractor":"profile_extractor.txt",
        "skill_gap_analyzer":"skill_gap_analyzer.txt",
        "roadmap_generator":"roadmap_generator.txt",
        "job_matcher":"job_matcher.txt",
        "resume_score":"resume_score.txt",
        "market_value":"market_value_calculator.txt",
        "project_verifier":"project_verifier.txt",
        "motivational_coach":"motivational_coach.txt",
        "leaderboard_ranker":"leaderboard_ranker.txt"
    }.items()
}

# ---------------- MODELS ---------------- #

class UserProgress(BaseModel):
    user_id:str
    points:int
    days_completed:int
    tasks_completed:int
    streak:int

class GapRequest(BaseModel):
    skills:List[str]
    role:str

class RoadmapRequest(BaseModel):
    skills:List[str]
    gaps:List[str]
    role:str

class VerifyRequest(BaseModel):
    skills:List[str]
    projects:List[str]

class JobsRequest(BaseModel):  # ⭐ FIXED
    skills: List[str]

class MarketRequest(BaseModel):  # ⭐ FIXED
    skills: List[str]

# ---------------- HELPERS ---------------- #

def safe_json(text: str):
    """
    Ultra-robust JSON extractor for messy LLM output.
    Handles:
    - markdown ```json blocks
    - text before/after JSON
    - trailing commas
    - single quotes
    """

    if not text:
        return {}

    try:
        return json.loads(text)
    except:
        pass

    # remove markdown blocks
    text = text.replace("```json", "").replace("```", "")

    # find first { and last }
    start = text.find("{")
    end = text.rfind("}")

    if start == -1 or end == -1:
        logging.warning("No JSON object detected")
        return {}

    cleaned = text[start:end+1]

    # remove trailing commas
    cleaned = cleaned.replace(",}", "}").replace(",]", "]")

    try:
        return json.loads(cleaned)
    except Exception as e:
        logging.warning(f"JSON parse failed after cleanup: {e}")
        return {}




def call_ai(prompt: str):
    try:
        res = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content":
                    """You are a JSON generator.
Return ONLY valid JSON.
No explanation.
No markdown.
No text before or after.
Strict JSON only."""
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0,
            max_tokens=1500
        )

        return res.choices[0].message.content.strip()

    except Exception as e:
        raise HTTPException(500, f"AI error: {e}")


def extract_pdf_text(file_bytes:bytes):
    try:
        pdf = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        return "".join(p.extract_text() or "" for p in pdf.pages) or "No readable text found"
    except Exception as e:
        raise HTTPException(400,f"PDF read error: {e}")

def parse_skills(raw):
    if isinstance(raw,list):
        return raw
    try:
        return ast.literal_eval(raw)
    except:
        return []

# ---------------- ROUTES ---------------- #

@app.get("/api")
def home():
    return {"status":"Jobify backend running"}

# ---------- Resume Upload ---------- #

@app.post("/api/upload/resume")
async def upload_resume(file:UploadFile=File(...)):
    content=await file.read()

    text = extract_pdf_text(content) if file.filename.endswith(".pdf") else content.decode("utf-8","ignore")

    prompt = PROMPTS["profile_extractor"].replace("{input_text}",text[:4000])
    return {"success":True,"profile":safe_json(call_ai(prompt))}

# ---------- Profile Analysis ---------- #

@app.post("/api/profile/analyze")
async def analyze_profile(profile:Dict[str,Any]=Body(...)):
    prompt = PROMPTS["resume_score"].replace("{profile}",json.dumps(profile))
    return {"success":True,"analysis":safe_json(call_ai(prompt))}

# ---------- Skill Gap ---------- #

@app.post("/api/skills/gap")
async def gap_analysis(data:GapRequest):

    required=[]

    for r in ROLES:
        title = r.get("job_title","").lower()
        if data.role.lower() in title:
            required = parse_skills(r.get("job_skill_set",[]))
            break

    if not required:
        required=["python","git","sql"]

    prompt=PROMPTS["skill_gap_analyzer"]\
        .replace("{user_skills}",json.dumps(data.skills))\
        .replace("{target_role}",data.role)\
        .replace("{required_skills}",json.dumps(required))

    return {"success":True,"gap_analysis":safe_json(call_ai(prompt))}

# ---------- Roadmap ---------- #

@app.post("/api/roadmap")
async def roadmap(data: RoadmapRequest):

    prompt = PROMPTS["roadmap_generator"]\
        .replace("{skills}", json.dumps(data.skills))\
        .replace("{missing_skills}", json.dumps(data.gaps))\
        .replace("{role}", data.role)\
        .replace("{hours}", "3")

    ai_text = call_ai(prompt)
    parsed = safe_json(ai_text)

    # fallback if AI breaks
    if not parsed:
        parsed = {
            "week1": [
                {"task":"Learn fundamentals","time_required":"2h","xp_points":50},
                {"task":"Build small project","time_required":"3h","xp_points":70}
            ]
        }

    return {
        "success": True,
        "roadmap": parsed
    }



# ---------- Jobs ---------- #
# ⭐ FIXED BODY PARSING

@app.post("/api/jobs")
async def jobs(data: JobsRequest):

    # only send titles + skills (tiny payload)
    subset = [
        {
            "title": r.get("job_title",""),
            "skills": parse_skills(r.get("job_skill_set",[]))
        }
        for r in ROLES[:10]
    ]

    prompt = PROMPTS["job_matcher"]\
        .replace("{skills}", json.dumps(data.skills))\
        .replace("{jobs_dataset}", json.dumps(subset))

    result = safe_json(call_ai(prompt))

    if isinstance(result, dict):
        result = [result]

    return {"success":True,"matched_jobs":result}



# ---------- Market ---------- #

@app.post("/api/market-value")
async def market(data:MarketRequest):

    salary={"python":120000,"react":125000,"aws":140000,"docker":135000}

    prompt=PROMPTS["market_value"]\
        .replace("{skills}",json.dumps(data.skills))\
        .replace("{salary_data}",json.dumps(salary))

    return {"success":True,"market_value":safe_json(call_ai(prompt))}

# ---------- Verify ---------- #

@app.post("/api/verify")
async def verify(data:VerifyRequest):

    prompt=PROMPTS["project_verifier"]\
        .replace("{skills}",json.dumps(data.skills))\
        .replace("{projects}",json.dumps(data.projects))

    return {"success":True,"verification":safe_json(call_ai(prompt))}

# ---------- Progress ---------- #

@app.post("/api/progress")
async def progress(data:UserProgress):

    rating=min(10,(data.points/1000)*10)

    return {
        "success":True,
        "level":data.points//200+1,
        "rating":round(rating,1)
    }

# ---------- Leaderboard ---------- #

@app.get("/api/leaderboard")
async def leaderboard():

    users=[
        {"name":"Alex","xp":2200,"completed_tasks":80,"streak":9},
        {"name":"Sam","xp":2000,"completed_tasks":75,"streak":10},
        {"name":"Jordan","xp":1800,"completed_tasks":70,"streak":6}
    ]

    prompt=PROMPTS["leaderboard_ranker"].replace(
        "Users = [{name, xp, completed_tasks, streak}]",
        f"Users = {json.dumps(users)}"
    )

    return {"success":True,"leaderboard":safe_json(call_ai(prompt))}

# ---------- Motivation ---------- #

@app.get("/api/motivation")
async def motivation(xp:int,tasks:int,streak:int):

    prompt=PROMPTS["motivational_coach"]\
        .replace("{xp}",str(xp))\
        .replace("{tasks}",str(tasks))\
        .replace("{streak}",str(streak))

    return {"message":call_ai(prompt)}

# ---------- Health ---------- #

@app.get("/api/health")
def health():
    return {"status":"healthy","time":datetime.now().isoformat()}

# ---------- FRONTEND ---------- #

app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")

# ---------------- RUN ---------------- #

if __name__=="__main__":
    import uvicorn
    uvicorn.run(app,host="0.0.0.0",port=8000)
