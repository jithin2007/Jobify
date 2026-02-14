// ================= API CONFIG =================
const API_BASE_URL = "http://127.0.0.1:8000/api";


// ================= STATE =================
let userProfile = {
    points: 0,
    daysCompleted: 0,
    tasksCompleted: 0,
    streak: 0,
    skillRating: 0,
    extractedProfile: null,
    roadmap: null
};


// ================= INIT =================
function init(){
    generateLeaderboard();
    updateDashboard();
}


// ================= NAVIGATION =================
function showSection(name){
    ["landing","onboarding","dashboard","roadmap","jobs","leaderboard"]
    .forEach(id=>{
        document.getElementById(id+"-section")?.classList.add("hidden")
    })

    document.getElementById(name+"-section")?.classList.remove("hidden")
}


// ================= FILE UPLOAD =================
async function handleFileUpload(e){
    const file=e.target.files[0];
    if(!file) return;

    showLoading("Analyzing Resume...")

    try{
        const fd=new FormData();
        fd.append("file",file)

        const res=await fetch(`${API_BASE_URL}/upload/resume`,{
            method:"POST",
            body:fd
        })

        const data=await res.json()

        console.log("Resume API:",data)

        userProfile.extractedProfile=data.profile || {}

        hideLoading()
        alert("Resume analyzed successfully!")

        prefillForm(userProfile.extractedProfile)

    }catch (error) {
        hideLoading()
        console.error(error);
        alert("Server error: " + error.message);
    }
}


// ================= PREFILL =================
function prefillForm(profile){
    if(profile.skills){
        document.getElementById("skills").value = profile.skills.join(", ")
    }
}


// ================= SAFE JSON PARSER =================
function safeParse(obj){

    if(!obj) return {}

    // already object
    if(typeof obj === "object") return obj

    try{
        return JSON.parse(obj)
    }catch{
        try{
            const start=obj.indexOf("{")
            const end=obj.lastIndexOf("}")+1
            return JSON.parse(obj.slice(start,end))
        }catch{
            console.warn("Could not parse JSON:",obj)
            return {}
        }
    }
}


// ================= ROADMAP =================
async function generateRoadmap(){

    showLoading("Generating roadmap...")

    try{

        const role=document.getElementById("dream-role").value
        const skills=document.getElementById("skills").value
        .split(",")
        .map(s=>s.trim())
        .filter(Boolean)

        if(!role||skills.length===0){
            hideLoading()
            return alert("Enter role + skills")
        }

        // ---------- GAP ----------
        const gapRes=await fetch(`${API_BASE_URL}/skills/gap`,{
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body:JSON.stringify({ skills, role })
        })

        const gapData=await gapRes.json()
        console.log("Gap API:",gapData)

        const gaps =
            gapData.gap_analysis?.missing_skills?.critical ||
            gapData.gap_analysis?.missing ||
            []


        // ---------- ROADMAP ----------
        const roadRes=await fetch(`${API_BASE_URL}/roadmap`,{
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body:JSON.stringify({ skills, gaps, role })
        })

        const roadRaw=await roadRes.json()
        console.log("Roadmap API RAW:",roadRaw)

        const parsed=safeParse(roadRaw.roadmap)
        console.log("Roadmap Parsed:",parsed)

        userProfile.roadmap=parsed

        renderRoadmap(parsed)


        // ---------- JOBS ----------
        await loadJobs(skills)

        // ---------- MARKET ----------
        await loadMarket(skills)

        hideLoading()

        showSection("roadmap")

    }catch(err){
        hideLoading()
        console.error(err)
        alert("Backend error — check console")
    }
}


// ================= RENDER ROADMAP =================
function renderRoadmap(data){

    const box=document.getElementById("roadmap-container")
    box.innerHTML=""

    if(!data || typeof data !== "object"){
        box.innerHTML="<p>Invalid roadmap format</p>"
        return
    }

    let day=1

    Object.values(data).forEach(week=>{

        if(!Array.isArray(week)) return

        week.forEach(task=>{

            if(typeof task !== "object") return

            box.innerHTML+=`
            <div class="roadmap-day">
                <div class="day-header">
                    <div class="day-number">Day ${day}</div>
                    <div class="day-status status-pending">Pending</div>
                </div>

                <h3>${task.task || "Task"}</h3>

                <div class="task-item">
                    <div class="task-checkbox" onclick="toggleTask(this)"></div>
                    <div class="task-info">
                        <div>${task.task || ""}</div>
                        <div class="task-meta">${task.time_required || ""}</div>
                    </div>
                    <div class="task-points">+${task.xp_points || 50}</div>
                </div>
            </div>
            `
            day++
        })
    })

    if(day===1){
        box.innerHTML="<p>No roadmap returned from AI.</p>"
    }
}


// ================= JOBS =================
async function loadJobs(skills){

    const res = await fetch(`${API_BASE_URL}/jobs`,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ skills })
    });

    const data = await res.json();

    console.log("Jobs API:",data)

    const jobs =
        data.matched_jobs ||
        data.jobs ||
        []

    renderJobs(jobs)
}


function renderJobs(jobs){

    const box=document.getElementById("jobs-container")
    if(!box) return

    box.innerHTML=""

    if(!Array.isArray(jobs)){
        console.warn("Jobs not array:",jobs)
        return
    }

    jobs.forEach(job=>{
        box.innerHTML+=`
        <div class="job-card">
            <div class="job-title">${job.job_title || job.title || "Developer"}</div>
            <div>${job.company || "Company"}</div>
            <div>${job.match_percent || 80}% match</div>
        </div>`
    })
}


// ================= MARKET VALUE =================
async function loadMarket(skills){

    const res = await fetch(`${API_BASE_URL}/market-value`,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ skills })
    });

    const data = await res.json()
    console.log("Market API:",data)

    const box=document.getElementById("skills-container")
    if(!box) return

    box.innerHTML=""

    const skillsList=data.market_value?.top_skills || []

    skillsList.forEach(s=>{
        box.innerHTML+=`
        <div class="skill-tag">
            ${s.skill} <span class="skill-value">+${s.boost}</span>
        </div>`
    })
}


// ================= TASK TOGGLE =================
function toggleTask(el){

    el.classList.toggle("checked")

    if(el.classList.contains("checked")){
        userProfile.points+=50
        userProfile.tasksCompleted++
    }else{
        userProfile.points-=50
        userProfile.tasksCompleted--
    }

    updateDashboard()
}


// ================= DASHBOARD =================
function updateDashboard(){

    document.getElementById("userPoints").innerText=`⭐ ${userProfile.points}`

    document.getElementById("tasks-completed").innerText=userProfile.tasksCompleted
    document.getElementById("total-points").innerText=userProfile.points

    const rating=((userProfile.points/1000)*10).toFixed(1)
    document.getElementById("skill-rating").innerText=rating
}


// ================= LOADING =================
function showLoading(msg){
    const d=document.createElement("div")
    d.id="loading"
    d.style.cssText="position:fixed;inset:0;background:#000c;display:flex;align-items:center;justify-content:center;color:white;font-size:22px;z-index:9999"
    d.innerText=msg
    document.body.appendChild(d)
}

function hideLoading(){
    document.getElementById("loading")?.remove()
}


// ================= LEADERBOARD =================
function generateLeaderboard(){

    const list=[
        {name:"Alex",points:2000},
        {name:"Sam",points:1800},
        {name:"Jordan",points:1500}
    ]

    const box=document.getElementById("global-leaderboard")
    if(!box) return

    list.forEach((u,i)=>{
        box.innerHTML+=`
        <div class="leaderboard-item">
            <div>#${i+1}</div>
            <div>${u.name}</div>
            <div>${u.points}</div>
        </div>`
    })
}


// ================= START =================
window.addEventListener("DOMContentLoaded",init)
