let userProfile = {
            points: 0,
            daysCompleted: 0,
            tasksCompleted: 0,
            streak: 0,
            skillRating: 0,
            uploadedData: null
        };

        // Sample Roadmap Data
        const roadmapData = [
            {
                day: 1,
                title: "JavaScript Fundamentals Review",
                tasks: [
                    { title: "Complete ES6+ Features Tutorial", type: "Course", duration: "2 hours", points: 50, link: "https://www.udemy.com/es6-javascript" },
                    { title: "Build a Todo App with Vanilla JS", type: "Project", duration: "3 hours", points: 100, link: "#" },
                    { title: "50 JavaScript Code Challenges", type: "Exercise", duration: "1 hour", points: 75, link: "https://www.codewars.com" }
                ]
            },
            {
                day: 2,
                title: "React Basics & Component Architecture",
                tasks: [
                    { title: "React Official Tutorial", type: "Course", duration: "3 hours", points: 60, link: "https://react.dev/learn" },
                    { title: "Build a Weather App with React", type: "Project", duration: "4 hours", points: 120, link: "#" },
                    { title: "Component Design Patterns Research", type: "Research", duration: "1 hour", points: 40, link: "#" }
                ]
            },
            {
                day: 3,
                title: "State Management & Hooks",
                tasks: [
                    { title: "React Hooks Deep Dive", type: "Course", duration: "2 hours", points: 50, link: "#" },
                    { title: "Build Shopping Cart with useContext", type: "Project", duration: "3 hours", points: 100, link: "#" },
                    { title: "30-Minute Break & Review", type: "Time Management", duration: "30 min", points: 25, link: "#" }
                ]
            },
            {
                day: 4,
                title: "Backend Fundamentals - Node.js",
                tasks: [
                    { title: "Node.js & Express Crash Course", type: "Course", duration: "3 hours", points: 60, link: "#" },
                    { title: "Build REST API for Todo App", type: "Project", duration: "4 hours", points: 120, link: "#" },
                    { title: "API Design Best Practices", type: "Research", duration: "1 hour", points: 40, link: "#" }
                ]
            },
            {
                day: 5,
                title: "Database Design - MongoDB",
                tasks: [
                    { title: "MongoDB University Course", type: "Course", duration: "2 hours", points: 50, link: "#" },
                    { title: "Design Database Schema for Blog", type: "Project", duration: "2 hours", points: 80, link: "#" },
                    { title: "CRUD Operations Practice", type: "Exercise", duration: "2 hours", points: 70, link: "#" }
                ]
            }
        ];

        // Sample Job Data
        const jobsData = [
            {
                company: "TechCorp",
                title: "Junior Full Stack Developer",
                location: "Bangalore",
                type: "Full-time",
                salary: "₹6-8 LPA",
                matchScore: 87,
                minPoints: 500,
                skills: ["React", "Node.js", "MongoDB", "JavaScript"]
            },
            {
                company: "StartupX",
                title: "Frontend Developer",
                location: "Remote",
                type: "Full-time",
                salary: "₹5-7 LPA",
                matchScore: 92,
                minPoints: 400,
                skills: ["React", "JavaScript", "CSS", "Git"]
            },
            {
                company: "DataFlow",
                title: "Backend Developer Intern",
                location: "Hyderabad",
                type: "Internship",
                salary: "₹25k/month",
                matchScore: 78,
                minPoints: 300,
                skills: ["Node.js", "Express", "SQL", "API Design"]
            },
            {
                company: "CloudNet",
                title: "Full Stack Engineer",
                location: "Mumbai",
                type: "Full-time",
                salary: "₹8-12 LPA",
                matchScore: 95,
                minPoints: 800,
                skills: ["React", "Node.js", "AWS", "Docker", "MongoDB"]
            }
        ];

        // Sample Leaderboard Data
        const leaderboardData = [
            { name: "Priya Sharma", role: "Full Stack Developer", points: 2450 },
            { name: "Rahul Kumar", role: "Full Stack Developer", points: 2380 },
            { name: "Ananya Singh", role: "Frontend Developer", points: 2290 },
            { name: "Arjun Patel", role: "Full Stack Developer", points: 2150 },
            { name: "Sneha Reddy", role: "Backend Developer", points: 2100 },
            { name: "Vikram Mehta", role: "Full Stack Developer", points: 2050 },
            { name: "Pooja Iyer", role: "Full Stack Developer", points: 1980 },
            { name: "Karthik Nair", role: "DevOps Engineer", points: 1920 }
        ];

        // Initialize
        function init() {
            generateRoadmapUI();
            generateJobsUI();
            generateLeaderboard();
            updateDashboard();
        }

        // Section Navigation
        function showSection(sectionName) {
            const sections = ['landing', 'onboarding', 'dashboard', 'roadmap', 'jobs', 'leaderboard'];
            sections.forEach(section => {
                const element = document.getElementById(`${section}-section`);
                if (element) {
                    element.classList.add('hidden');
                }
            });
            
            const targetSection = document.getElementById(`${sectionName}-section`);
            if (targetSection) {
                targetSection.classList.remove('hidden');
                targetSection.classList.add('fade-in');
            }
        }

        // File Upload Handler
        function handleFileUpload(event, type) {
            const file = event.target.files[0];
            if (file) {
                userProfile.uploadedData = { type, file: file.name };
                alert(`✅ ${type} uploaded successfully: ${file.name}`);
            }
        }

        // Social Connect
        function connectSocial(platform) {
            alert(`🔗 Connecting to ${platform}... (Demo Mode)\n\nIn production, this would:\n1. Authenticate with ${platform}\n2. Extract your profile data\n3. Analyze your skills and projects\n4. Generate personalized recommendations`);
            userProfile.uploadedData = { type: platform, connected: true };
        }

        // Generate Roadmap
        function generateRoadmap() {
            alert('🎉 Roadmap Generated!\n\nAnalyzing your profile...\n✓ Skills identified\n✓ Gaps detected\n✓ Personalized plan created\n\nRedirecting to dashboard...');
            showSection('dashboard');
        }

        // Generate Roadmap UI
        function generateRoadmapUI() {
            const container = document.getElementById('roadmap-container');
            container.innerHTML = '';
            
            roadmapData.forEach((day, index) => {
                const dayElement = document.createElement('div');
                dayElement.className = 'roadmap-day';
                dayElement.innerHTML = `
                    <div class="day-header">
                        <div class="day-number">Day ${day.day}</div>
                        <div class="day-status status-pending">Pending</div>
                    </div>
                    <h3 style="margin-bottom: 1rem;">${day.title}</h3>
                    <div class="day-tasks">
                        ${day.tasks.map((task, taskIndex) => `
                            <div class="task-item" data-day="${day.day}" data-task="${taskIndex}">
                                <div class="task-checkbox" onclick="toggleTask(${day.day}, ${taskIndex})"></div>
                                <div class="task-info">
                                    <div class="task-title">${task.title}</div>
                                    <div class="task-meta">${task.type} • ${task.duration}</div>
                                </div>
                                <div class="task-points">+${task.points} pts</div>
                            </div>
                        `).join('')}
                    </div>
                `;
                container.appendChild(dayElement);
            });
        }

        // Toggle Task
        function toggleTask(day, taskIndex) {
            const taskElement = document.querySelector(`[data-day="${day}"][data-task="${taskIndex}"] .task-checkbox`);
            const isCompleted = taskElement.classList.toggle('checked');
            
            if (isCompleted) {
                const task = roadmapData[day - 1].tasks[taskIndex];
                userProfile.points += task.points;
                userProfile.tasksCompleted += 1;
                
                // Check if all tasks in day are completed
                const dayElement = taskElement.closest('.roadmap-day');
                const allChecked = dayElement.querySelectorAll('.task-checkbox.checked').length === roadmapData[day - 1].tasks.length;
                
                if (allChecked) {
                    userProfile.daysCompleted += 1;
                    dayElement.classList.add('completed');
                    const statusBadge = dayElement.querySelector('.day-status');
                    statusBadge.className = 'day-status status-completed';
                    statusBadge.textContent = 'Completed';
                }
                
                // Animate points
                animatePoints();
                updateDashboard();
            } else {
                const task = roadmapData[day - 1].tasks[taskIndex];
                userProfile.points -= task.points;
                userProfile.tasksCompleted -= 1;
                updateDashboard();
            }
        }

        // Animate Points
        function animatePoints() {
            const pointsElement = document.getElementById('userPoints');
            pointsElement.style.transform = 'scale(1.2)';
            pointsElement.style.transition = 'transform 0.3s ease';
            setTimeout(() => {
                pointsElement.style.transform = 'scale(1)';
            }, 300);
        }

        // Update Dashboard
        function updateDashboard() {
            document.getElementById('userPoints').textContent = `⭐ ${userProfile.points} Points`;
            document.getElementById('days-completed').textContent = userProfile.daysCompleted;
            document.getElementById('tasks-completed').textContent = userProfile.tasksCompleted;
            document.getElementById('total-points').textContent = userProfile.points;
            
            // Calculate skill rating (0-10 scale)
            const maxPossiblePoints = roadmapData.reduce((sum, day) => 
                sum + day.tasks.reduce((taskSum, task) => taskSum + task.points, 0), 0
            );
            const rating = ((userProfile.points / maxPossiblePoints) * 10).toFixed(1);
            document.getElementById('skill-rating').textContent = rating;
            
            // Update progress bar
            const progressPercent = ((userProfile.daysCompleted / roadmapData.length) * 100).toFixed(0);
            document.getElementById('overall-progress').style.width = `${progressPercent}%`;
            document.getElementById('overall-progress').parentElement.nextElementSibling.textContent = `${progressPercent}% Complete`;
            
            // Update streak (simplified)
            document.getElementById('streak-count').textContent = `${userProfile.daysCompleted} Days`;
            
            // Update eligibility score
            document.getElementById('eligibility-score').textContent = userProfile.points;
        }

        // Generate Jobs UI
        function generateJobsUI() {
            const container = document.getElementById('jobs-container');
            container.innerHTML = '';
            
            jobsData.forEach(job => {
                const canApply = userProfile.points >= job.minPoints;
                const jobElement = document.createElement('div');
                jobElement.className = 'job-card';
                jobElement.innerHTML = `
                    <div class="job-header">
                        <div>
                            <div class="job-title">${job.title}</div>
                            <div style="font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem;">${job.company}</div>
                        </div>
                        <div class="job-company">${job.company[0]}</div>
                    </div>
                    <div class="job-meta">
                        <span>📍 ${job.location}</span>
                        <span>💼 ${job.type}</span>
                        <span>💰 ${job.salary}</span>
                    </div>
                    <div class="job-tags">
                        ${job.skills.map(skill => `<span class="job-tag">${skill}</span>`).join('')}
                    </div>
                    <div class="job-match">
                        <div>
                            <div class="match-score">${job.matchScore}%</div>
                            <div style="font-size: 0.85rem; color: var(--text-muted);">Match</div>
                        </div>
                        <div style="flex: 1;">
                            <p style="margin: 0; font-size: 0.9rem;">
                                ${canApply 
                                    ? '✅ You can apply for this role!' 
                                    : `🔒 Need ${job.minPoints - userProfile.points} more points to unlock`}
                            </p>
                        </div>
                    </div>
                    <button class="btn ${canApply ? 'btn-success' : 'btn-secondary'}" style="width: 100%; margin-top: 1rem;" 
                            ${canApply ? '' : 'disabled'} 
                            onclick="applyJob('${job.title}', '${job.company}')">
                        ${canApply ? 'Apply Now 🚀' : 'Locked 🔒'}
                    </button>
                `;
                container.appendChild(jobElement);
            });
        }

        // Apply to Job
        function applyJob(title, company) {
            alert(`🎉 Application Submitted!\n\nYou've applied for:\n${title}\nat ${company}\n\nWe'll match you with the recruiter based on your profile and points!`);
        }

        // Generate Leaderboard
        function generateLeaderboard() {
            const globalContainer = document.getElementById('global-leaderboard');
            const trackContainer = document.getElementById('track-leaderboard');
            
            // Global leaderboard
            leaderboardData.forEach((user, index) => {
                const rank = index + 1;
                let rankClass = '';
                if (rank === 1) rankClass = 'gold';
                else if (rank === 2) rankClass = 'silver';
                else if (rank === 3) rankClass = 'bronze';
                
                const userElement = document.createElement('div');
                userElement.className = 'leaderboard-item';
                userElement.innerHTML = `
                    <div class="rank ${rankClass}">#${rank}</div>
                    <div class="user-avatar">${user.name[0]}</div>
                    <div class="user-info">
                        <div class="user-name">${user.name}</div>
                        <div class="user-role">${user.role}</div>
                    </div>
                    <div class="user-points">${user.points}</div>
                `;
                globalContainer.appendChild(userElement);
            });
            
            // Track-specific leaderboard (filter for Full Stack)
            const trackUsers = leaderboardData.filter(user => user.role === 'Full Stack Developer');
            trackUsers.forEach((user, index) => {
                const rank = index + 1;
                let rankClass = '';
                if (rank === 1) rankClass = 'gold';
                else if (rank === 2) rankClass = 'silver';
                else if (rank === 3) rankClass = 'bronze';
                
                const userElement = document.createElement('div');
                userElement.className = 'leaderboard-item';
                userElement.innerHTML = `
                    <div class="rank ${rankClass}">#${rank}</div>
                    <div class="user-avatar">${user.name[0]}</div>
                    <div class="user-info">
                        <div class="user-name">${user.name}</div>
                        <div class="user-role">${user.role}</div>
                    </div>
                    <div class="user-points">${user.points}</div>
                `;
                trackContainer.appendChild(userElement);
            });
        }

        // Modal Functions
        function closeModal() {
            document.getElementById('task-modal').classList.remove('active');
        }

        // Initialize on load
        window.addEventListener('DOMContentLoaded', init);