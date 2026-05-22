/**
 * Premium Interactive Dashboard Engine (Tasks 3, 4, 5, 7)
 * Orchestrates AJAX REST interactions, live queries, EJS modal populations, and progress meters.
 */

let searchTimeout = null;
let activeApplicationsList = []; // Persists applications list state locally

document.addEventListener('DOMContentLoaded', () => {
  // Check if we are on the dashboard
  const isDashboard = document.getElementById('tab-overview');
  if (!isDashboard) return;

  // Initialize data streams
  fetchDashboardStats();
  loadJobsBoard();
  loadApplicationsList();

  // Route to tab if hash exists in URL
  const hash = window.location.hash.substring(1);
  if (hash) {
    switchDashboardTab(hash);
  }

  // Handle Recruiter Post Job submissions
  const postJobForm = document.getElementById('recruiterPostJobForm');
  if (postJobForm) {
    postJobForm.addEventListener('submit', handlePostJobSubmit);
  }

  // Handle Job Seeker application submissions
  const applyForm = document.getElementById('submissionUploadForm');
  if (applyForm) {
    applyForm.addEventListener('submit', handleApplicationSubmit);
  }
});

/* ====================================================
   DASHBOARD LAYER SWAPPER (Task 3 Navigation)
   ==================================================== */

function switchDashboardTab(tabId) {
  // Update sidebar active highlights
  const sidebarLinks = document.querySelectorAll('.nav-item-sidebar');
  sidebarLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${tabId}`) {
      link.classList.add('active');
    }
  });

  // Toggle Tab content panels
  const tabs = document.querySelectorAll('.dashboard-tab-content');
  tabs.forEach(tab => {
    tab.classList.add('d-none');
    tab.classList.remove('active-tab');
  });

  const activeTab = document.getElementById(`tab-${tabId}`);
  if (activeTab) {
    activeTab.classList.remove('d-none');
    activeTab.classList.add('active-tab');
    window.location.hash = tabId;
  }
}

/* ====================================================
   DASHBOARD TELEMETRY INJECTOR (Task 4/5 Stats)
   ==================================================== */

async function fetchDashboardStats() {
  try {
    const res = await fetch('/api/stats');
    const json = await res.json();
    
    if (json.success) {
      const stats = json.data;
      document.getElementById('stat-users').textContent = stats.users;
      document.getElementById('stat-jobs').textContent = stats.jobs;
      document.getElementById('stat-apps').textContent = stats.applications;
      document.getElementById('stat-avg-score').textContent = `${stats.averageAiScore}%`;
    }
  } catch (err) {
    console.error('Failed to load dashboard metrics:', err);
  }
}

/* ====================================================
   LIVE DEBOUNCED SEARCH BOARD (Task 4/5 search list)
   ==================================================== */

function debounceSearch() {
  clearTimeout(searchTimeout);
  const searchVal = document.getElementById('jobsSearchBox').value;
  
  // Debounce API calls by 300ms to allow smooth typing
  searchTimeout = setTimeout(() => {
    loadJobsBoard(searchVal);
  }, 300);
}

async function loadJobsBoard(query = '') {
  const container = document.getElementById('jobsContainer');
  if (!container) return;

  try {
    const res = await fetch(`/api/jobs?search=${encodeURIComponent(query)}`);
    const json = await res.json();

    if (json.success) {
      container.innerHTML = '';
      const jobs = json.data;

      if (jobs.length === 0) {
        container.innerHTML = `
          <div class="col-12 text-center py-5 text-muted">
            <i class="fa-solid fa-folder-open fs-2 mb-2 d-block"></i>
            No active positions match your query.
          </div>
        `;
        return;
      }

      jobs.forEach(job => {
        // Construct dynamic list of requirements
        const reqChips = job.requirements.slice(0, 3).map(r => 
          `<span class="badge bg-dark-50 border border-secondary border-opacity-10 text-muted-50 text-xs me-1 mb-1">${r}</span>`
        ).join('');

        // Detect user role to show delete button
        const userDetailsElement = document.querySelector('.badge-glow');
        const role = userDetailsElement ? userDetailsElement.textContent.trim() : 'Job Seeker';
        
        let actionsHtml = '';
        if (role === 'RECRUITER' || role === 'ADMIN') {
          actionsHtml = `
            <button class="btn btn-outline-danger btn-sm rounded-pill px-3 text-xs w-100" onclick="deleteJobPosting('${job._id}')">
              <i class="fa-solid fa-trash me-1"></i>Delete Position
            </button>
          `;
        } else {
          actionsHtml = `
            <button class="btn btn-premium btn-sm rounded-pill px-4 text-xs w-100" onclick="triggerApplyModal('${job._id}', '${escapeHtml(job.title)}', '${escapeHtml(job.company)}')">
              Apply Now<i class="fa-solid fa-chevron-right ms-1 text-xs"></i>
            </button>
          `;
        }

        const card = document.createElement('div');
        card.className = 'col-md-6 mb-3 animate-fade-in';
        card.innerHTML = `
          <div class="glass-card p-4 h-100 d-flex flex-column justify-content-between hover-lift">
            <div>
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="text-white font-outfit mb-0">${escapeHtml(job.title)}</h5>
                <span class="badge bg-primary-10 text-primary text-xs rounded-pill px-3 py-1">${job.type}</span>
              </div>
              <h6 class="text-gradient text-xs font-bold mb-3">${escapeHtml(job.company)}</h6>
              <p class="text-muted text-xs mb-3 text-truncate-2" style="line-height: 1.6;">${escapeHtml(job.description)}</p>
              
              <div class="requirements-wrapper mb-4">
                ${reqChips}
              </div>
            </div>
            
            <div class="border-top border-secondary border-opacity-10 pt-3 mt-auto">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="text-xs text-muted"><i class="fa-solid fa-location-dot me-1"></i>${escapeHtml(job.location)}</span>
                <span class="text-xs text-white fw-semibold">${escapeHtml(job.salary)}</span>
              </div>
              ${actionsHtml}
            </div>
          </div>
        `;
        container.appendChild(card);
      });
    }
  } catch (err) {
    console.error('Failed to load jobs board:', err);
  }
}

/* ====================================================
   APPLICATIONS TRACKER LIST & AI MODAL INJECTIONS (Tasks 5, 7)
   ==================================================== */

async function loadApplicationsList() {
  const tbody = document.getElementById('applicationRecordsBody');
  const recentList = document.getElementById('recent-applications-list');
  if (!tbody) return;

  try {
    const res = await fetch('/api/applications/me');
    const json = await res.json();

    if (json.success) {
      const apps = json.data;
      activeApplicationsList = apps; // Store locally
      tbody.innerHTML = '';

      if (apps.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="text-center py-5 text-muted">
              <i class="fa-solid fa-inbox fs-3 mb-2 d-block"></i>You haven't submitted any applications yet.
            </td>
          </tr>
        `;
        if (recentList) recentList.innerHTML = `<div class="text-center py-4 text-muted text-xs">No recent actions logged.</div>`;
        return;
      }

      apps.forEach((app, idx) => {
        const formattedDate = new Date(app.appliedAt).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric'
        });

        // Determine score classes
        let scoreBadgeClass = 'bg-danger';
        if (app.aiScore >= 80) scoreBadgeClass = 'bg-success';
        else if (app.aiScore >= 50) scoreBadgeClass = 'bg-warning';

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>
            <div class="fw-bold text-white">${escapeHtml(app.job.title)}</div>
            <div class="text-xs text-muted">${escapeHtml(app.job.company)}</div>
          </td>
          <td class="text-muted">${formattedDate}</td>
          <td>
            <span class="badge bg-primary-10 text-primary text-xs rounded-pill px-3 py-1">${app.status}</span>
          </td>
          <td>
            <span class="badge ${scoreBadgeClass} text-white rounded-pill px-2 py-1">${app.aiScore}%</span>
          </td>
          <td class="text-end">
            <button class="btn btn-outline-premium btn-sm rounded-pill px-3 text-xs" onclick="openAIAnalysisModal(${idx})">
              <i class="fa-solid fa-sparkles me-1 text-xs text-gradient"></i>View Assessment
            </button>
          </td>
        `;
        tbody.appendChild(row);
      });

      // Seeding Recent Actions list on landing panel
      if (recentList) {
        recentList.innerHTML = '';
        apps.slice(0, 3).forEach(app => {
          const actionRow = document.createElement('div');
          actionRow.className = 'd-flex align-items-center mb-3 p-2 rounded-3 glass-inset';
          actionRow.innerHTML = `
            <div class="bg-primary-10 text-primary rounded-pill p-2 me-3"><i class="fa-solid fa-cloud-arrow-up text-xs"></i></div>
            <div class="flex-grow-1">
              <div class="text-xs text-white fw-bold">Applied to ${escapeHtml(app.job.company)}</div>
              <div class="text-muted text-xxs">${escapeHtml(app.job.title)} - ATS rating: ${app.aiScore}%</div>
            </div>
          `;
          recentList.appendChild(actionRow);
        });
      }
    }
  } catch (err) {
    console.error('Failed to load application track list:', err);
  }
}

/**
 * Open Gemini AI evaluation modal mapping dynamic values (Task 7)
 */
function openAIAnalysisModal(idx) {
  const app = activeApplicationsList[idx];
  if (!app) return;

  const scoreIndicator = document.querySelector('.ats-circular-meter');
  const scoreField = document.getElementById('aiReportScore');
  const badgeField = document.getElementById('aiReportBadge');
  const skillsContainer = document.getElementById('aiReportSkills');
  const gapField = document.getElementById('aiReportGap');
  const suggContainer = document.getElementById('aiReportSuggestions');
  const recContainer = document.getElementById('aiReportRecommendations');

  // 1. Calculate dynamic conic-gradient styles based on score value
  const percentage = app.aiScore;
  scoreIndicator.style.background = `conic-gradient(#8a5cf6 0% ${percentage}%, rgba(255,255,255,0.05) ${percentage}% 100%)`;
  scoreField.textContent = `${percentage}%`;

  // 2. Set score assessment labels
  if (percentage >= 80) {
    badgeField.textContent = 'Excellent Match';
    badgeField.className = 'badge rounded-pill bg-success-10 text-success border border-success border-opacity-10 text-xs px-3 py-1';
  } else if (percentage >= 60) {
    badgeField.textContent = 'Moderate Match';
    badgeField.className = 'badge rounded-pill bg-warning-10 text-warning border border-warning border-opacity-10 text-xs px-3 py-1';
  } else {
    badgeField.textContent = 'Action Required';
    badgeField.className = 'badge rounded-pill bg-danger-10 text-danger border border-danger border-opacity-10 text-xs px-3 py-1';
  }

  // 3. Inject skills chips
  skillsContainer.innerHTML = '';
  if (app.aiAnalysis.skillsIdentified && app.aiAnalysis.skillsIdentified.length > 0) {
    app.aiAnalysis.skillsIdentified.forEach(s => {
      const chip = document.createElement('span');
      chip.className = 'badge bg-dark-50 border border-secondary border-opacity-10 text-light text-xs rounded-pill px-3 py-2';
      chip.textContent = s;
      skillsContainer.appendChild(chip);
    });
  } else {
    skillsContainer.innerHTML = '<span class="text-muted text-xs">No skills identified.</span>';
  }

  // 4. Inject structural gaps
  gapField.textContent = app.aiAnalysis.gapAnalysis || 'No gaps analyzed. Ready for submission.';

  // 5. Inject career recommendations
  suggContainer.innerHTML = '';
  if (app.aiAnalysis.careerSuggestions && app.aiAnalysis.careerSuggestions.length > 0) {
    app.aiAnalysis.careerSuggestions.forEach(s => {
      const li = document.createElement('li');
      li.className = 'mb-1 text-light';
      li.textContent = s;
      suggContainer.appendChild(li);
    });
  } else {
    suggContainer.innerHTML = '<li class="text-muted">No careers recommended.</li>';
  }

  // 6. Inject concrete bullet advice
  recContainer.innerHTML = '';
  if (app.aiAnalysis.actionableRecommendations && app.aiAnalysis.actionableRecommendations.length > 0) {
    app.aiAnalysis.actionableRecommendations.forEach(r => {
      const li = document.createElement('li');
      li.className = 'mb-2 text-light';
      li.textContent = r;
      recContainer.appendChild(li);
    });
  } else {
    recContainer.innerHTML = '<li class="text-muted">No suggestions generated. Resume aligns well.</li>';
  }

  // Pop open modal
  const modal = new bootstrap.Modal(document.getElementById('aiAnalysisModal'));
  modal.show();
}

/* ====================================================
   ASYNCHRONOUS FORM SUBMITTERS WITH STATUS METERS (Tasks 5, 7)
   ==================================================== */

function triggerApplyModal(jobId, jobTitle, jobCompany) {
  document.getElementById('applyJobId').value = jobId;
  document.getElementById('applyJobTitle').textContent = jobTitle;
  document.getElementById('applyJobCompany').textContent = jobCompany;

  // Clear progress bars
  document.getElementById('applyStatusWrapper').classList.add('d-none');
  document.getElementById('applyProgressBar').style.width = '0%';
  document.getElementById('applyResumeInput').value = '';

  const applyModal = new bootstrap.Modal(document.getElementById('applyModal'));
  applyModal.show();
}

async function handleApplicationSubmit(e) {
  e.preventDefault();

  const fileInput = document.getElementById('applyResumeInput');
  if (!fileInput.files || fileInput.files.length === 0) return;

  const form = document.getElementById('submissionUploadForm');
  const formData = new FormData(form);

  const statusWrapper = document.getElementById('applyStatusWrapper');
  const progressBar = document.getElementById('applyProgressBar');
  const progressText = document.getElementById('applyProgressText');
  const progressPercent = document.getElementById('applyProgressPercent');
  const submitBtn = document.getElementById('submitApplyBtn');

  // Trigger dynamic loading meter (Task 4/5 animations)
  statusWrapper.classList.remove('d-none');
  submitBtn.disabled = true;

  // Sequentially animate progress to simulate heavy backend AI matching processes
  let percent = 5;
  const progressInterval = setInterval(() => {
    if (percent < 90) {
      percent += Math.floor(Math.random() * 8) + 3;
      percent = Math.min(percent, 90);
      progressBar.style.width = `${percent}%`;
      progressPercent.textContent = `${percent}%`;

      if (percent < 30) {
        progressText.textContent = 'Uploading files...';
      } else if (percent >= 30 && percent < 60) {
        progressText.textContent = 'Parsing metadata streams...';
      } else if (percent >= 60 && percent < 90) {
        progressText.textContent = 'Google Gemini modeling active...';
      }
    }
  }, 180);

  try {
    const res = await fetch('/api/applications', {
      method: 'POST',
      body: formData
    });

    const json = await res.json();
    clearInterval(progressInterval);

    if (json.success) {
      progressBar.style.width = '100%';
      progressPercent.textContent = '100%';
      progressText.textContent = 'Analysis Complete!';

      setTimeout(() => {
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('applyModal')).hide();
        
        // Refresh tables and statistics
        fetchDashboardStats();
        loadApplicationsList();
        
        // Return tab to applications board
        switchDashboardTab('applications');
      }, 800);
    } else {
      alert(`Submission failed: ${json.error}`);
      statusWrapper.classList.add('d-none');
      submitBtn.disabled = false;
    }
  } catch (err) {
    clearInterval(progressInterval);
    console.error('Submit application failed:', err);
    alert('Submission failed. Check backend connections.');
    statusWrapper.classList.add('d-none');
    submitBtn.disabled = false;
  }
}

/**
 * Recruiter POST Job submission (Task 5 REST application)
 */
async function handlePostJobSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  
  // Transform FormData to pure JSON structure
  const payload = {};
  formData.forEach((val, key) => {
    payload[key] = val;
  });

  try {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const json = await res.json();
    if (json.success) {
      alert('Internship listing published successfully!');
      form.reset();
      
      // Update statistics and reload panels
      fetchDashboardStats();
      loadJobsBoard();
      
      // Switch back to job board explore tab
      switchDashboardTab('jobs');
    } else {
      alert(`Error publishing position: ${json.error}`);
    }
  } catch (err) {
    console.error('Post job failed:', err);
    alert('Post job failed. Check database connections.');
  }
}

async function deleteJobPosting(id) {
  if (!confirm('Are you sure you want to delete this job posting?')) return;

  try {
    const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    const json = await res.json();
    
    if (json.success) {
      alert('Listing deleted successfully.');
      fetchDashboardStats();
      loadJobsBoard();
    } else {
      alert(`Delete failed: ${json.error}`);
    }
  } catch (err) {
    console.error('Delete job failed:', err);
  }
}

/* ====================================================
   HELPERS
   ==================================================== */

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
