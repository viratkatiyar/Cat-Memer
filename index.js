import { catsData } from './data.js'

// Emoji map for cat emotions
const emotionEmojis = {
    moody: '😤',
    insomniac: '🥱',
    confused: '😵‍💫',
    dominant: '😼',
    happy: '😺',
    hungry: '🍕',
    relaxed: '💤',
    scared: '🙀',
    sad: '😿'
}

// DOM Elements
const emotionRadios = document.getElementById('emotion-radios')
const getImageBtn = document.getElementById('get-image-btn')
const surpriseBtn = document.getElementById('surprise-btn')
const gifsOnlyOption = document.getElementById('gifs-only-option')
const emotionSearch = document.getElementById('emotion-search')

// Modal Elements
const memeModalBackdrop = document.getElementById('meme-modal-backdrop')
const memeModalInner = document.getElementById('meme-modal-inner')
const memeModalCloseBtn = document.getElementById('meme-modal-close-btn')
const modalEmotionBadge = document.getElementById('modal-emotion-badge')
const downloadMemeBtn = document.getElementById('download-meme-btn')
const copyLinkBtn = document.getElementById('copy-link-btn')
const nextMemeBtn = document.getElementById('next-meme-btn')

// Header Action Elements
const themeToggleBtn = document.getElementById('theme-toggle-btn')
const themeIcon = document.getElementById('theme-icon')
const soundToggleBtn = document.getElementById('sound-toggle-btn')
const soundIcon = document.getElementById('sound-icon')
const toast = document.getElementById('toast')
const toastMessage = document.getElementById('toast-message')

// State Variables
let currentCatObject = null
let soundEnabled = true

// --------------------------------------------------------------------------
// 1. Initial Setup & Event Listeners
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    initTheme()
    renderEmotionsRadios(catsData)
    initConfetti()
})

emotionRadios.addEventListener('change', highlightCheckedOption)
getImageBtn.addEventListener('click', renderCat)
surpriseBtn.addEventListener('click', renderSurpriseCat)
memeModalCloseBtn.addEventListener('click', closeModal)
memeModalBackdrop.addEventListener('click', (e) => {
    if (e.target === memeModalBackdrop) closeModal()
})

// Keyboard Accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && memeModalBackdrop.classList.contains('active')) {
        closeModal()
    }
})

// Search Filter Input
emotionSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase()
    const pills = document.querySelectorAll('.radio-pill')
    pills.forEach(pill => {
        const emotionText = pill.dataset.emotion.toLowerCase()
        if (emotionText.includes(searchTerm)) {
            pill.style.display = 'flex'
        } else {
            pill.style.display = 'none'
        }
    })
})

// Theme Switcher Logic
themeToggleBtn.addEventListener('click', toggleTheme)

function initTheme() {
    const savedTheme = localStorage.getItem('cat_memer_theme') || 'dark'
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-theme')
        document.body.classList.add('light-theme')
        themeIcon.className = 'fa-solid fa-sun'
    } else {
        document.body.classList.remove('light-theme')
        document.body.classList.add('dark-theme')
        themeIcon.className = 'fa-solid fa-moon'
    }
}

function toggleTheme() {
    if (document.body.classList.contains('dark-theme')) {
        document.body.classList.remove('dark-theme')
        document.body.classList.add('light-theme')
        themeIcon.className = 'fa-solid fa-sun'
        localStorage.setItem('cat_memer_theme', 'light')
    } else {
        document.body.classList.remove('light-theme')
        document.body.classList.add('dark-theme')
        themeIcon.className = 'fa-solid fa-moon'
        localStorage.setItem('cat_memer_theme', 'dark')
    }
}

// Sound FX Toggle Logic
soundToggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled
    if (soundEnabled) {
        soundIcon.className = 'fa-solid fa-volume-high'
        playMeowSound()
        showToast('Sound Effects Enabled 🔊')
    } else {
        soundIcon.className = 'fa-solid fa-volume-xmark'
        showToast('Sound Effects Muted 🔇')
    }
})

// --------------------------------------------------------------------------
// 2. Emotion Radio Rendering & Highlighting
// --------------------------------------------------------------------------
function highlightCheckedOption(e) {
    const pills = document.getElementsByClassName('radio-pill')
    for (let pill of pills) {
        pill.classList.remove('highlight')
    }
    const targetInput = document.getElementById(e.target.id)
    if (targetInput) {
        targetInput.closest('.radio-pill').classList.add('highlight')
        playClickSound()
    }
}

function getEmotionsArray(cats) {
    const emotionsArray = []
    for (let cat of cats) {
        for (let emotion of cat.emotionTags) {
            if (!emotionsArray.includes(emotion)) {
                emotionsArray.push(emotion)
            }
        }
    }
    return emotionsArray
}

function renderEmotionsRadios(cats) {
    let radioItems = ''
    const emotions = getEmotionsArray(cats)
    
    emotions.forEach((emotion, index) => {
        const emoji = emotionEmojis[emotion] || '🐱'
        const isChecked = index === 0 ? 'checked' : ''
        const highlightClass = index === 0 ? 'highlight' : ''

        radioItems += `
            <label class="radio-pill ${highlightClass}" data-emotion="${emotion}" for="${emotion}">
                <span class="emoji">${emoji}</span>
                <span class="emotion-title">${emotion}</span>
                <input
                    type="radio"
                    id="${emotion}"
                    value="${emotion}"
                    name="emotions"
                    ${isChecked}
                >
            </label>`
    })
    
    emotionRadios.innerHTML = radioItems
}

// --------------------------------------------------------------------------
// 3. Cat Selection & Modal Functions
// --------------------------------------------------------------------------
function getMatchingCatsArray() {
    const selectedRadio = document.querySelector('input[name="emotions"]:checked')
    if (!selectedRadio) return catsData

    const selectedEmotion = selectedRadio.value
    const isGif = gifsOnlyOption.checked

    return catsData.filter(cat => {
        if (isGif) {
            return cat.emotionTags.includes(selectedEmotion) && cat.isGif
        } else {
            return cat.emotionTags.includes(selectedEmotion)
        }
    })
}

function getSingleCatObject() {
    const catsArray = getMatchingCatsArray()

    if (catsArray.length === 0) {
        // Fallback if GIF filter has no match for selected emotion
        const fallbackArray = catsData.filter(cat => {
            const selectedRadio = document.querySelector('input[name="emotions"]:checked')
            return selectedRadio ? cat.emotionTags.includes(selectedRadio.value) : true
        })
        return fallbackArray[Math.floor(Math.random() * fallbackArray.length)]
    }

    const randomNumber = Math.floor(Math.random() * catsArray.length)
    return catsArray[randomNumber]
}

function renderCat() {
    currentCatObject = getSingleCatObject()
    if (!currentCatObject) return
    displayCatModal(currentCatObject)
}

function renderSurpriseCat() {
    const randomNumber = Math.floor(Math.random() * catsData.length)
    currentCatObject = catsData[randomNumber]
    displayCatModal(currentCatObject)
}

function displayCatModal(catObject) {
    const emotionName = catObject.emotionTags[0] || 'happy'
    const emoji = emotionEmojis[emotionName] || '🐱'
    modalEmotionBadge.textContent = `${emoji} ${emotionName.toUpperCase()} CAT`

    memeModalInner.innerHTML = `
        <img 
            class="cat-img" 
            src="./images/${catObject.image}"
            alt="${catObject.alt}"
            id="cat-meme-img"
        >
    `

    memeModalBackdrop.classList.add('active')
    playMeowSound()
    triggerConfetti()
}

function closeModal() {
    memeModalBackdrop.classList.remove('active')
}

// Modal Actions
nextMemeBtn.addEventListener('click', () => {
    renderCat()
})

downloadMemeBtn.addEventListener('click', () => {
    if (!currentCatObject) return
    const link = document.createElement('a')
    link.href = `./images/${currentCatObject.image}`
    link.download = `Cat_Meme_${currentCatObject.image}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Meme Download Started! 📥')
})

copyLinkBtn.addEventListener('click', () => {
    if (!currentCatObject) return
    const fullUrl = `${window.location.origin}${window.location.pathname.replace('index.html', '')}images/${currentCatObject.image}`
    navigator.clipboard.writeText(fullUrl).then(() => {
        showToast('Image URL Copied! 📋')
    }).catch(() => {
        showToast('Copied filename: ' + currentCatObject.image)
    })
})

function showToast(message) {
    toastMessage.textContent = message
    toast.classList.add('show')
    setTimeout(() => {
        toast.classList.remove('show')
    }, 2500)
}

// --------------------------------------------------------------------------
// 4. Synthesized Sound FX (Web Audio API)
// --------------------------------------------------------------------------
function playMeowSound() {
    if (!soundEnabled) return
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        if (!AudioCtx) return
        const ctx = new AudioCtx()

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        // Pitch modulation resembling a meow chirp
        osc.frequency.setValueAtTime(450, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.15)
        osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.35)

        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start()
        osc.stop(ctx.currentTime + 0.35)
    } catch (e) {
        console.warn('Audio Context disabled or not supported', e)
    }
}

function playClickSound() {
    if (!soundEnabled) return
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        if (!AudioCtx) return
        const ctx = new AudioCtx()

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(600, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05)

        gain.gain.setValueAtTime(0.08, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start()
        osc.stop(ctx.currentTime + 0.05)
    } catch (e) {
        // Ignore audio errors
    }
}

// --------------------------------------------------------------------------
// 5. Canvas Particle Confetti FX
// --------------------------------------------------------------------------
let confettiCanvas, confettiCtx, particles = []

function initConfetti() {
    confettiCanvas = document.getElementById('confetti-canvas')
    if (!confettiCanvas) return
    confettiCtx = confettiCanvas.getContext('2d')
    resizeConfettiCanvas()
    window.addEventListener('resize', resizeConfettiCanvas)
}

function resizeConfettiCanvas() {
    if (!confettiCanvas) return
    confettiCanvas.width = window.innerWidth
    confettiCanvas.height = window.innerHeight
}

function triggerConfetti() {
    if (!confettiCanvas || !confettiCtx) return
    particles = []
    const colors = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b']

    for (let i = 0; i < 40; i++) {
        particles.push({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2 - 50,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.7) * 12,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1,
            rotation: Math.random() * 360,
            vRot: (Math.random() - 0.5) * 10
        })
    }
    requestAnimationFrame(updateConfetti)
}

function updateConfetti() {
    if (!confettiCtx) return
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height)

    let activeParticles = false
    particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.3 // gravity
        p.alpha -= 0.02
        p.rotation += p.vRot

        if (p.alpha > 0) {
            activeParticles = true
            confettiCtx.save()
            confettiCtx.globalAlpha = p.alpha
            confettiCtx.translate(p.x, p.y)
            confettiCtx.rotate((p.rotation * Math.PI) / 180)
            confettiCtx.fillStyle = p.color
            confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
            confettiCtx.restore()
        }
    })

    if (activeParticles) {
        requestAnimationFrame(updateConfetti)
    } else {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height)
    }
}
