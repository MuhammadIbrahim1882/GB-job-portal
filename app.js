const state = {
  jobs: [],
  selectedJobId: null,
  filterState: {
    search: '',
    location: 'all',
    type: 'all',
    category: 'all',
    experience: 'all'
  }
};

const elements = {
  jobsGrid: document.getElementById('jobsGrid'),
  jobDetail: document.getElementById('jobDetail'),
  resultsCount: document.getElementById('resultsCount'),
  searchInput: document.getElementById('searchInput'),
  locationFilter: document.getElementById('locationFilter'),
  typeFilter: document.getElementById('typeFilter'),
  categoryFilter: document.getElementById('categoryFilter'),
  experienceFilter: document.getElementById('experienceFilter'),
  applicationForm: document.getElementById('applicationForm'),
  jobForm: document.getElementById('jobForm'),
  applicationModal: document.getElementById('applicationModal'),
  jobModal: document.getElementById('jobModal'),
  toast: document.getElementById('toast'),
  jobIdInput: document.getElementById('jobId')
};

async function fetchJobs() {
  try {
    const params = new URLSearchParams(state.filterState);
    const response = await fetch(`/api/jobs?${params.toString()}`);
    const jobs = await response.json();

    state.jobs = Array.isArray(jobs) ? jobs : [];
    if (!state.selectedJobId && state.jobs.length) {
      state.selectedJobId = state.jobs[0].id;
    }

    if (state.selectedJobId && !state.jobs.some((job) => job.id === state.selectedJobId)) {
      state.selectedJobId = state.jobs[0]?.id || null;
    }

    renderJobs();
    renderDetail();
    populateFilterOptions();
  } catch (error) {
    console.error('Failed to load jobs:', error);
    showToast('Unable to load the latest jobs right now.');
  }
}

function populateFilterOptions() {
  const locations = [...new Set(state.jobs.map((job) => job.location))].sort();
  const categories = [...new Set(state.jobs.map((job) => job.category))].sort();

  const locationOptions = ['<option value="all">All locations</option>']
    .concat(locations.map((location) => `<option value="${location}">${location}</option>`))
    .join('');

  const categoryOptions = ['<option value="all">All categories</option>']
    .concat(categories.map((category) => `<option value="${category}">${category}</option>`))
    .join('');

  elements.locationFilter.innerHTML = locationOptions;
  elements.categoryFilter.innerHTML = categoryOptions;
  elements.locationFilter.value = state.filterState.location;
  elements.categoryFilter.value = state.filterState.category;
}

function renderJobs() {
  elements.resultsCount.textContent = `${state.jobs.length} role${state.jobs.length === 1 ? '' : 's'}`;

  if (!state.jobs.length) {
    elements.jobsGrid.innerHTML = '<div class="detail-empty">No jobs match your current filters.</div>';
    return;
  }

  elements.jobsGrid.innerHTML = state.jobs
    .map(
      (job) => `
        <article class="job-card ${job.id === state.selectedJobId ? 'active' : ''}" data-job-id="${job.id}">
          <div class="job-top">
            <div class="company-badge">${job.company.slice(0, 2).toUpperCase()}</div>
            <span class="role-tag">${job.type}</span>
          </div>

          <h3 class="job-title">${job.title}</h3>
          <div class="company-line">${job.company}</div>

          <div class="job-meta">
            <span>${job.location}</span>
            <span>${job.experience}</span>
            <span>${job.postedAt}</span>
          </div>

          <div class="salary">${job.salary}</div>
        </article>
      `
    )
    .join('');

  document.querySelectorAll('.job-card').forEach((card) => {
    card.addEventListener('click', () => {
      state.selectedJobId = card.dataset.jobId;
      renderJobs();
      renderDetail();
    });
  });
}

function renderDetail() {
  const selectedJob = state.jobs.find((job) => job.id === state.selectedJobId);

  if (!selectedJob) {
    elements.jobDetail.innerHTML = `
      <div class="detail-empty">
        <div>
          <p>Select a job to view details.</p>
        </div>
      </div>
    `;
    return;
  }

  elements.jobDetail.innerHTML = `
    <div class="detail-header">
      <div>
        <div class="company-badge">${selectedJob.company.slice(0, 2).toUpperCase()}</div>
      </div>
      <span class="role-tag">${selectedJob.type}</span>
    </div>

    <h3>${selectedJob.title}</h3>
    <p class="detail-company">${selectedJob.company}</p>

    <div class="detail-meta">
      <span>${selectedJob.location}</span>
      <span>${selectedJob.experience}</span>
      <span>${selectedJob.postedAt}</span>
      <span>${selectedJob.category}</span>
    </div>

    <div class="detail-section">
      <h4>Salary</h4>
      <p>${selectedJob.salary}</p>
    </div>

    <div class="detail-section">
      <h4>Job description</h4>
      <p>${selectedJob.description}</p>
    </div>

    <div class="detail-section">
      <h4>Requirements</h4>
      <ul>
        ${selectedJob.requirements.map((item) => `<li>${item}</li>`).join('')}
      </ul>
    </div>

    <div class="detail-actions">
      <button class="primary-btn" data-action="apply" data-job-id="${selectedJob.id}">Apply now</button>
      <button class="secondary-btn">Save job</button>
    </div>
  `;

  const applyButton = elements.jobDetail.querySelector('[data-action="apply"]');
  if (applyButton) {
    applyButton.addEventListener('click', () => openApplicationModal(selectedJob.id));
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.remove('hidden');

  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    elements.toast.classList.add('hidden');
  }, 2500);
}

function openApplicationModal(jobId) {
  elements.jobIdInput.value = jobId;
  elements.applicationModal.classList.remove('hidden');
  elements.applicationModal.setAttribute('aria-hidden', 'false');
}

function closeModal(modalElement) {
  modalElement.classList.add('hidden');
  modalElement.setAttribute('aria-hidden', 'true');
}

function bindFilters() {
  elements.searchInput.addEventListener('input', (event) => {
    state.filterState.search = event.target.value;
    fetchJobs();
  });

  elements.locationFilter.addEventListener('change', (event) => {
    state.filterState.location = event.target.value;
    fetchJobs();
  });

  elements.typeFilter.addEventListener('change', (event) => {
    state.filterState.type = event.target.value;
    fetchJobs();
  });

  elements.categoryFilter.addEventListener('change', (event) => {
    state.filterState.category = event.target.value;
    fetchJobs();
  });

  elements.experienceFilter.addEventListener('change', (event) => {
    state.filterState.experience = event.target.value;
    fetchJobs();
  });
}

function bindModalControls() {
  document.querySelectorAll('[data-close]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.close;
      const modal = document.getElementById(target);
      if (modal) {
        closeModal(modal);
      }
    });
  });

  document.getElementById('postJobBtn').addEventListener('click', () => {
    elements.jobModal.classList.remove('hidden');
    elements.jobModal.setAttribute('aria-hidden', 'false');
  });

  elements.applicationForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const form = new FormData(elements.applicationForm);
    const payload = Object.fromEntries(form.entries());

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to submit application.');
      }

      showToast(data.message || 'Application submitted successfully.');
      elements.applicationForm.reset();
      closeModal(elements.applicationModal);
    } catch (error) {
      showToast(error.message || 'There was a problem with your application.');
    }
  });

  elements.jobForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const form = new FormData(elements.jobForm);
    const payload = Object.fromEntries(form.entries());

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to publish job.');
      }

      showToast(`Job posted: ${data.title || 'New role'}`);
      elements.jobForm.reset();
      closeModal(elements.jobModal);
      state.selectedJobId = data.id;
      fetchJobs();
    } catch (error) {
      showToast(error.message || 'There was a problem posting the job.');
    }
  });
}

function initialize() {
  bindFilters();
  bindModalControls();
  fetchJobs();
}

initialize();
