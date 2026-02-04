// ========================================
// CINEPHILE 2.0 - Global Movie Discovery
// Application Logic
// ========================================

// State Management
const state = {
    searchQuery: '',
    selectedGenre: 'all',
    selectedLanguage: 'all',
    selectedDirector: 'all',
    selectedActor: 'all',
    selectedMusicDirector: 'all',
    selectedYear: 'all',
    currentPage: 1,
    moviesPerPage: 50,
    filteredMovies: [],
    allDirectors: new Set(),
    allActors: new Set(),
    allMusicDirectors: new Set(),
    allYears: new Set()
};

// DOM Elements
const elements = {
    searchInput: null,
    searchClear: null,
    genreFilters: null,
    languageFilters: null,
    directorFilter: null,
    actorFilter: null,
    musicFilter: null,
    yearFilter: null,
    moviesGrid: null,
    movieCount: null,
    activeFilters: null,
    noResults: null,
    loading: null,
    loadMoreContainer: null,
    loadMoreBtn: null,
    loadMoreCount: null,
    resetFilters: null
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    extractMetadata();
    populateDropdowns();
    setupEventListeners();
    setupModalListeners(); // Initialize modal listeners
    applyFilters();
});

// Initialize DOM Elements
function initializeElements() {
    elements.searchInput = document.getElementById('search-input');
    elements.searchClear = document.getElementById('search-clear');
    elements.genreFilters = document.getElementById('genre-filters');
    elements.languageFilters = document.getElementById('language-filters');
    elements.directorFilter = document.getElementById('director-filter');
    elements.actorFilter = document.getElementById('actor-filter');
    elements.musicFilter = document.getElementById('music-filter');
    elements.yearFilter = document.getElementById('year-filter');
    elements.moviesGrid = document.getElementById('movies-grid');
    elements.movieCount = document.getElementById('movie-count');
    elements.activeFilters = document.getElementById('active-filters');
    elements.noResults = document.getElementById('no-results');
    elements.loading = document.getElementById('loading');
    elements.loadMoreContainer = document.getElementById('load-more-container');
    elements.loadMoreBtn = document.getElementById('load-more-btn');
    elements.loadMoreCount = document.getElementById('load-more-count');
    elements.resetFilters = document.getElementById('reset-filters');

    // Modal Elements
    elements.movieModal = document.getElementById('movie-modal');
    elements.modalClose = document.getElementById('modal-close');
    elements.modalPoster = document.getElementById('modal-poster');
    elements.modalTitle = document.getElementById('modal-title');
    elements.modalYear = document.getElementById('modal-year');
    elements.modalLanguage = document.getElementById('modal-language');
    elements.modalRating = document.getElementById('modal-rating');
    elements.modalGenres = document.getElementById('modal-genres');
    elements.modalDirector = document.getElementById('modal-director');
    elements.modalMusic = document.getElementById('modal-music');
    elements.modalCast = document.getElementById('modal-cast');
    elements.modalSummary = document.getElementById('modal-summary');
    elements.modalTrailerBtn = document.getElementById('modal-trailer-btn');
}

// Extract metadata from movies database
function extractMetadata() {
    if (typeof moviesDatabase === 'undefined') {
        console.error('Movies database not loaded');
        return;
    }

    moviesDatabase.forEach(movie => {
        if (movie.director) state.allDirectors.add(movie.director);
        if (movie.actors) {
            movie.actors.forEach(actor => state.allActors.add(actor));
        }
        if (movie.musicDirector) state.allMusicDirectors.add(movie.musicDirector);
        if (movie.year) state.allYears.add(movie.year);
    });
}

// Populate dropdown filters
function populateDropdowns() {
    // Directors
    const sortedDirectors = [...state.allDirectors].sort();
    sortedDirectors.forEach(director => {
        const option = document.createElement('option');
        option.value = director;
        option.textContent = director;
        elements.directorFilter.appendChild(option);
    });

    // Actors
    const sortedActors = [...state.allActors].sort();
    sortedActors.forEach(actor => {
        const option = document.createElement('option');
        option.value = actor;
        option.textContent = actor;
        elements.actorFilter.appendChild(option);
    });

    // Music Directors
    const sortedMusicDirectors = [...state.allMusicDirectors].sort();
    sortedMusicDirectors.forEach(musicDirector => {
        const option = document.createElement('option');
        option.value = musicDirector;
        option.textContent = musicDirector;
        elements.musicFilter.appendChild(option);
    });

    // Years (descending)
    const sortedYears = [...state.allYears].sort((a, b) => b - a);
    sortedYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        elements.yearFilter.appendChild(option);
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Search input
    elements.searchInput.addEventListener('input', debounce(() => {
        state.searchQuery = elements.searchInput.value.trim();
        state.currentPage = 1;
        toggleSearchClear();
        applyFilters();
    }, 300));

    // Search clear button
    elements.searchClear.addEventListener('click', () => {
        elements.searchInput.value = '';
        state.searchQuery = '';
        state.currentPage = 1;
        toggleSearchClear();
        applyFilters();
    });

    // Genre filter clicks
    elements.genreFilters.addEventListener('click', (e) => {
        if (e.target.classList.contains('chip')) {
            state.selectedGenre = e.target.dataset.genre;
            state.currentPage = 1;
            updateActiveChips(elements.genreFilters, e.target.dataset.genre);
            applyFilters();
        }
    });

    // Language filter clicks
    elements.languageFilters.addEventListener('click', (e) => {
        if (e.target.classList.contains('chip')) {
            state.selectedLanguage = e.target.dataset.language;
            state.currentPage = 1;
            updateActiveChips(elements.languageFilters, e.target.dataset.language);
            applyFilters();
        }
    });

    // Dropdown filters
    elements.directorFilter.addEventListener('change', () => {
        state.selectedDirector = elements.directorFilter.value;
        state.currentPage = 1;
        applyFilters();
    });

    elements.actorFilter.addEventListener('change', () => {
        state.selectedActor = elements.actorFilter.value;
        state.currentPage = 1;
        applyFilters();
    });

    elements.musicFilter.addEventListener('change', () => {
        state.selectedMusicDirector = elements.musicFilter.value;
        state.currentPage = 1;
        applyFilters();
    });

    elements.yearFilter.addEventListener('change', () => {
        state.selectedYear = elements.yearFilter.value;
        state.currentPage = 1;
        applyFilters();
    });

    // Load more button
    elements.loadMoreBtn.addEventListener('click', () => {
        state.currentPage++;
        renderMoreMovies();
    });

    // Reset filters button
    elements.resetFilters.addEventListener('click', resetAllFilters);
}

// Toggle search clear button visibility
function toggleSearchClear() {
    if (state.searchQuery.length > 0) {
        elements.searchClear.classList.remove('hidden');
    } else {
        elements.searchClear.classList.add('hidden');
    }
}

// Update active chips
function updateActiveChips(container, activeValue) {
    const chips = container.querySelectorAll('.chip');
    chips.forEach(chip => {
        const value = chip.dataset.genre || chip.dataset.language;
        chip.classList.toggle('active', value === activeValue);
    });
}

// Apply all filters
function applyFilters() {
    if (typeof moviesDatabase === 'undefined') {
        console.error('Movies database not loaded');
        return;
    }

    const query = state.searchQuery.toLowerCase();

    state.filteredMovies = moviesDatabase.filter(movie => {
        // Search filter (title, director, actors, music director)
        if (query) {
            const titleMatch = movie.title.toLowerCase().includes(query);
            const directorMatch = movie.director && movie.director.toLowerCase().includes(query);
            const actorMatch = movie.actors && movie.actors.some(actor =>
                actor.toLowerCase().includes(query)
            );
            const musicMatch = movie.musicDirector && movie.musicDirector.toLowerCase().includes(query);

            if (!titleMatch && !directorMatch && !actorMatch && !musicMatch) {
                return false;
            }
        }

        // Genre filter
        if (state.selectedGenre !== 'all') {
            if (!movie.genres || !movie.genres.some(g =>
                g.toLowerCase() === state.selectedGenre.toLowerCase()
            )) {
                return false;
            }
        }

        // Language filter
        if (state.selectedLanguage !== 'all') {
            if (!movie.language || movie.language.toLowerCase() !== state.selectedLanguage.toLowerCase()) {
                return false;
            }
        }

        // Director filter
        if (state.selectedDirector !== 'all') {
            if (!movie.director || movie.director !== state.selectedDirector) {
                return false;
            }
        }

        // Actor filter
        if (state.selectedActor !== 'all') {
            if (!movie.actors || !movie.actors.includes(state.selectedActor)) {
                return false;
            }
        }

        // Music Director filter
        if (state.selectedMusicDirector !== 'all') {
            if (!movie.musicDirector || movie.musicDirector !== state.selectedMusicDirector) {
                return false;
            }
        }

        // Year filter
        if (state.selectedYear !== 'all') {
            if (movie.year !== parseInt(state.selectedYear)) {
                return false;
            }
        }

        return true;
    });

    // Sort by rating (highest first)
    state.filteredMovies.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    // Update UI
    renderMovies();
    renderActiveFilters();
    updateResultsCount();
    updateLoadMoreButton();
}

// Render movies to grid
function renderMovies() {
    const moviesToShow = state.filteredMovies.slice(0, state.currentPage * state.moviesPerPage);

    if (moviesToShow.length === 0) {
        elements.moviesGrid.innerHTML = '';
        elements.noResults.classList.remove('hidden');
        elements.loadMoreContainer.classList.add('hidden');
    } else {
        elements.noResults.classList.add('hidden');
        elements.moviesGrid.innerHTML = moviesToShow
            .map((movie, index) => createMovieCard(movie, index))
            .join('');
    }
}

// Render more movies (for load more)
function renderMoreMovies() {
    const startIndex = (state.currentPage - 1) * state.moviesPerPage;
    const moviesToAdd = state.filteredMovies.slice(startIndex, state.currentPage * state.moviesPerPage);

    moviesToAdd.forEach((movie, index) => {
        const cardHTML = createMovieCard(movie, startIndex + index);
        elements.moviesGrid.insertAdjacentHTML('beforeend', cardHTML);
    });

    updateLoadMoreButton();
}

// Create movie card HTML
function createMovieCard(movie, index) {
    const genreTags = (movie.genres || [])
        .slice(0, 3)
        .map(g => `<span class="genre-tag">${capitalizeFirst(g)}</span>`)
        .join('');

    const actorsList = (movie.actors || []).slice(0, 2).join(', ');
    const posterUrl = movie.poster || 'https://via.placeholder.com/300x450/1a1a25/6366f1?text=No+Poster';
    const fallbackUrl = `https://via.placeholder.com/300x450/1a1a25/6366f1?text=${encodeURIComponent(movie.title || 'Movie')}`;

    return `
        <article class="movie-card" style="animation-delay: ${(index % 50) * 0.03}s" id="movie-${movie.id}" onclick="openMovieDetails(${movie.id})">
            <div class="movie-poster">
                <img src="${posterUrl}" alt="${movie.title} poster" loading="lazy" 
                     onerror="this.onerror=null; this.src='${fallbackUrl}'">
                <span class="movie-rating ${getRatingClass(movie.rating)}">${movie.rating || 'N/A'}</span>
                <span class="movie-language">${movie.language || 'Unknown'}</span>
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-meta">
                    <span>📅 ${movie.year || 'N/A'}</span>
                    <span>🎬 ${movie.industry || 'Cinema'}</span>
                </div>
                <div class="movie-genres">${genreTags}</div>
                <div class="movie-crew">
                    ${movie.director ? `<span>🎥 <strong>${movie.director}</strong></span>` : ''}
                    ${actorsList ? `<span>👥 <strong>${actorsList}</strong></span>` : ''}
                    ${movie.musicDirector ? `<span>🎵 <strong>${movie.musicDirector}</strong></span>` : ''}
                </div>
                <p class="movie-summary">${movie.summary || 'No description available.'}</p>
                <p class="movie-reason">${getMatchReason(movie)}</p>
            </div>
        </article>
    `;
}

// Get rating CSS class
function getRatingClass(rating) {
    if (!rating) return 'below';
    if (rating >= 8.0) return 'excellent';
    if (rating >= 7.0) return 'good';
    if (rating >= 6.0) return 'average';
    return 'below';
}

// Generate match reason text
function getMatchReason(movie) {
    const reasons = [];

    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        if (movie.title.toLowerCase().includes(query)) {
            reasons.push('Title matches your search');
        } else if (movie.director && movie.director.toLowerCase().includes(query)) {
            reasons.push(`Directed by ${movie.director}`);
        } else if (movie.actors && movie.actors.some(a => a.toLowerCase().includes(query))) {
            reasons.push('Features actor from your search');
        } else if (movie.musicDirector && movie.musicDirector.toLowerCase().includes(query)) {
            reasons.push(`Music by ${movie.musicDirector}`);
        }
    }

    if (state.selectedGenre !== 'all') {
        reasons.push(`${capitalizeFirst(state.selectedGenre)} genre`);
    }

    if (state.selectedLanguage !== 'all') {
        reasons.push(`${capitalizeFirst(state.selectedLanguage)} cinema`);
    }

    if (state.selectedDirector !== 'all') {
        reasons.push(`Directed by ${state.selectedDirector}`);
    }

    if (state.selectedActor !== 'all') {
        reasons.push(`Starring ${state.selectedActor}`);
    }

    if (reasons.length === 0) {
        return `Highly rated ${movie.genres?.[0] || 'film'} from ${movie.industry || 'world cinema'}`;
    }

    return reasons.slice(0, 2).join(' • ');
}

// Render active filter tags
function renderActiveFilters() {
    let html = '';

    if (state.searchQuery) {
        html += createFilterTag('🔍', `"${state.searchQuery}"`, 'search');
    }

    if (state.selectedGenre !== 'all') {
        html += createFilterTag('🎭', capitalizeFirst(state.selectedGenre), 'genre');
    }

    if (state.selectedLanguage !== 'all') {
        html += createFilterTag('🌍', capitalizeFirst(state.selectedLanguage), 'language');
    }

    if (state.selectedDirector !== 'all') {
        html += createFilterTag('🎥', state.selectedDirector, 'director');
    }

    if (state.selectedActor !== 'all') {
        html += createFilterTag('👥', state.selectedActor, 'actor');
    }

    if (state.selectedMusicDirector !== 'all') {
        html += createFilterTag('🎵', state.selectedMusicDirector, 'music');
    }

    if (state.selectedYear !== 'all') {
        html += createFilterTag('📅', state.selectedYear, 'year');
    }

    elements.activeFilters.innerHTML = html;
}

// Create filter tag HTML
function createFilterTag(icon, label, type) {
    return `
        <span class="filter-tag">
            ${icon} ${label}
            <button class="remove-filter" onclick="removeFilter('${type}')" aria-label="Remove ${type} filter">×</button>
        </span>
    `;
}

// Remove specific filter
function removeFilter(type) {
    switch (type) {
        case 'search':
            elements.searchInput.value = '';
            state.searchQuery = '';
            toggleSearchClear();
            break;
        case 'genre':
            state.selectedGenre = 'all';
            updateActiveChips(elements.genreFilters, 'all');
            break;
        case 'language':
            state.selectedLanguage = 'all';
            updateActiveChips(elements.languageFilters, 'all');
            break;
        case 'director':
            state.selectedDirector = 'all';
            elements.directorFilter.value = 'all';
            break;
        case 'actor':
            state.selectedActor = 'all';
            elements.actorFilter.value = 'all';
            break;
        case 'music':
            state.selectedMusicDirector = 'all';
            elements.musicFilter.value = 'all';
            break;
        case 'year':
            state.selectedYear = 'all';
            elements.yearFilter.value = 'all';
            break;
    }

    state.currentPage = 1;
    applyFilters();
}

// Reset all filters
function resetAllFilters() {
    elements.searchInput.value = '';
    state.searchQuery = '';
    state.selectedGenre = 'all';
    state.selectedLanguage = 'all';
    state.selectedDirector = 'all';
    state.selectedActor = 'all';
    state.selectedMusicDirector = 'all';
    state.selectedYear = 'all';
    state.currentPage = 1;

    updateActiveChips(elements.genreFilters, 'all');
    updateActiveChips(elements.languageFilters, 'all');
    elements.directorFilter.value = 'all';
    elements.actorFilter.value = 'all';
    elements.musicFilter.value = 'all';
    elements.yearFilter.value = 'all';
    toggleSearchClear();

    applyFilters();
}

// Update results count
function updateResultsCount() {
    elements.movieCount.textContent = state.filteredMovies.length.toLocaleString();
}

// Update load more button
function updateLoadMoreButton() {
    const totalShown = state.currentPage * state.moviesPerPage;
    const remaining = state.filteredMovies.length - totalShown;

    if (remaining > 0) {
        elements.loadMoreContainer.classList.remove('hidden');
        elements.loadMoreCount.textContent = `(${Math.min(remaining, state.moviesPerPage)} more)`;
    } else {
        elements.loadMoreContainer.classList.add('hidden');
    }
}

// Utility: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Utility: Capitalize first letter
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Make functions globally available for onclick handlers
window.removeFilter = removeFilter;
window.resetAllFilters = resetAllFilters;
window.openMovieDetails = openMovieDetails; // Expose to window

// ========================================
// MODAL LOGIC
// ========================================

// Setup Modal Event Listeners
function setupModalListeners() {
    // Close button click
    elements.modalClose.addEventListener('click', closeMovieDetails);

    // Overlay click (close modal)
    elements.movieModal.addEventListener('click', (e) => {
        if (e.target === elements.movieModal) {
            closeMovieDetails();
        }
    });

    // ESC key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !elements.movieModal.classList.contains('hidden')) {
            closeMovieDetails();
        }
    });
}

// Open Movie Details Modal
function openMovieDetails(movieId) {
    const movie = moviesDatabase.find(m => m.id === movieId);
    if (!movie) return;

    // Populate Modal Data
    const posterUrl = movie.poster || 'https://via.placeholder.com/300x450/1a1a25/6366f1?text=No+Poster';
    elements.modalPoster.src = posterUrl;
    elements.modalTitle.textContent = movie.title;
    elements.modalYear.textContent = movie.year || 'N/A';
    elements.modalLanguage.textContent = movie.language || 'Unknown';
    elements.modalRating.textContent = movie.rating || 'N/A';
    elements.modalRating.className = `modal-rating ${getRatingClass(movie.rating)}`;

    // Genres
    elements.modalGenres.innerHTML = (movie.genres || [])
        .map(g => `<span class="genre-tag">${capitalizeFirst(g)}</span>`)
        .join('');

    // Crew
    elements.modalDirector.textContent = movie.director || 'Unknown';
    elements.modalMusic.textContent = movie.musicDirector || 'Unknown';

    // Cast
    elements.modalCast.textContent = (movie.actors || []).join(', ') || 'Cast information unavailable';

    // Summary
    elements.modalSummary.textContent = movie.summary || 'No description available.';

    // Trailer Button
    if (movie.trailerUrl) {
        elements.modalTrailerBtn.href = movie.trailerUrl;
        elements.modalTrailerBtn.style.display = 'inline-flex';
    } else {
        elements.modalTrailerBtn.style.display = 'none';
        elements.modalTrailerBtn.href = '#';
    }

    // Show Modal
    elements.movieModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent scrolling background
}

// Close Movie Details Modal
function closeMovieDetails() {
    elements.movieModal.classList.add('hidden');
    document.body.style.overflow = ''; // Restore scrolling
}
