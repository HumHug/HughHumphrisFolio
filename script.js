const modal = document.getElementById('project-modal');
const modalTitle = document.getElementById('modal-title');
const modalVideo = document.getElementById('modal-video');
const modalVideoEmbed = document.getElementById('modal-video-embed');
const modalDescription = document.getElementById('modal-description');
const modalGallerySection = document.getElementById('modal-gallery-section');
const modalGallery = document.getElementById('modal-gallery');
const imageLightbox = document.getElementById('image-lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxCloseButton = document.querySelector('.image-lightbox-close');
const contactModal = document.getElementById('contact-modal');
const contactLink = document.getElementById('contact-link');
const contactModalCloseButton = document.getElementById('contact-modal-close');

function getGalleryImages(galleryValue) {
    if (!galleryValue) return [];
    return galleryValue
        .split('|')
        .map((item) => {
            const parts = item.split('::');
            const src = (parts.shift() || '').trim();
            const caption = parts.join('::').trim();
            if (!src) return null;
            return { src, caption };
        })
        .filter(Boolean);
}

function getEmbedSrc(embedValue) {
    if (!embedValue) return '';

    const raw = embedValue.trim();

    if (raw.includes('youtube.com/watch')) {
        const [, query] = raw.split('?');
        const params = new URLSearchParams(query || '');
        const videoId = params.get('v');
        if (!videoId) return raw;
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }

    if (raw.includes('youtu.be/')) {
        const idPart = raw.split('youtu.be/')[1] || '';
        const videoId = idPart.split('?')[0].split('&')[0].trim();
        if (!videoId) return raw;
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }

    if (raw.includes('vimeo.com/') && !raw.includes('player.vimeo.com/video/')) {
        const idPart = raw.split('vimeo.com/')[1] || '';
        const videoId = idPart.split('?')[0].split('/')[0].trim();
        if (!videoId) return raw;
        return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }

    return raw;
}

function openImageLightbox(imageSrc, imageAlt, captionText) {
    lightboxImage.src = imageSrc;
    lightboxImage.alt = imageAlt;
    lightboxCaption.textContent = captionText || '';
    lightboxCaption.hidden = !captionText;
    imageLightbox.classList.add('active');
    imageLightbox.setAttribute('aria-hidden', 'false');
}

function closeImageLightbox() {
    imageLightbox.classList.remove('active');
    imageLightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.src = '';
    lightboxCaption.textContent = '';
    lightboxCaption.hidden = true;
}

function renderGallery(images, title) {
    modalGallery.innerHTML = '';

    if (images.length === 0) {
        modalGallerySection.hidden = true;
        return;
    }

    modalGallerySection.hidden = false;

    images.forEach((imageItem, index) => {
        const captionText = imageItem.caption || `Work in progress ${index + 1}`;
        const imageSrc = imageItem.src;

        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';

        const thumbButton = document.createElement('button');
        thumbButton.type = 'button';
        thumbButton.className = 'gallery-thumb';
        thumbButton.setAttribute('aria-label', `Open image ${index + 1} for ${title}`);

        const thumbImage = document.createElement('img');
        thumbImage.src = imageSrc;
        thumbImage.alt = `${title} - ${captionText}`;

        thumbButton.appendChild(thumbImage);
        thumbButton.addEventListener('click', () => {
            openImageLightbox(imageSrc, thumbImage.alt, captionText);
        });

        const caption = document.createElement('p');
        caption.className = 'gallery-caption';
        caption.textContent = captionText;

        galleryItem.appendChild(thumbButton);
        galleryItem.appendChild(caption);
        modalGallery.appendChild(galleryItem);
    });
}

function openProject(title, videoSrc, embedSrc, description, galleryImages) {
    modalTitle.textContent = title;
    modalDescription.textContent = description;
    renderGallery(galleryImages, title);

    if (embedSrc) {
        modalVideo.pause();
        modalVideo.removeAttribute('src');
        modalVideo.load();
        modalVideo.style.display = 'none';

        modalVideoEmbed.src = getEmbedSrc(embedSrc);
        modalVideoEmbed.style.display = 'block';
    } else if (videoSrc) {
        modalVideoEmbed.src = '';
        modalVideoEmbed.style.display = 'none';

        modalVideo.src = videoSrc;
        modalVideo.style.display = 'block';
        modalVideo.currentTime = 0;
        modalVideo.play().catch(() => {});
    } else {
        modalVideoEmbed.src = '';
        modalVideoEmbed.style.display = 'none';

        modalVideo.pause();
        modalVideo.removeAttribute('src');
        modalVideo.load();
        modalVideo.style.display = 'none';
    }

    modal.classList.add('active');
    syncBodyModalState();
}

function closeModal() {
    modal.classList.remove('active');
    closeImageLightbox();
    syncBodyModalState();

    modalVideo.pause();
    modalVideo.currentTime = 0;
    modalVideoEmbed.src = '';
}

function syncBodyModalState() {
    const hasActiveModal =
        modal.classList.contains('active') ||
        (contactModal && contactModal.classList.contains('active'));

    if (hasActiveModal) {
        document.body.classList.add('modal-open');
        return;
    }

    document.body.classList.remove('modal-open');
}

function openContactModal() {
    if (!contactModal) return;
    if (modal.classList.contains('active')) {
        closeModal();
    }
    if (contactStatus) {
        contactStatus.textContent = '';
    }
    contactModal.classList.add('active');
    contactModal.setAttribute('aria-hidden', 'false');
    syncBodyModalState();
}

function closeContactModal() {
    if (!contactModal) return;
    contactModal.classList.remove('active');
    contactModal.setAttribute('aria-hidden', 'true');
    syncBodyModalState();
}

const projects = document.querySelectorAll('.project');

projects.forEach((project) => {
    const title = project.dataset.title || 'Project';
    const videoSrc = project.dataset.video || '';
    const embedSrc = project.dataset.videoEmbed || '';
    const description = project.dataset.description || '';
    const galleryImages = getGalleryImages(project.dataset.gallery || '');

    project.addEventListener('click', () => {
        openProject(title, videoSrc, embedSrc, description, galleryImages);
    });

    const video = project.querySelector('video');
    if (!video) return;

    project.addEventListener('mouseenter', () => {
        if (!modal.classList.contains('active')) {
            video.play().catch(() => {});
        }
    });

    project.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
    });
});

modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

if (contactModal) {
    contactModal.addEventListener('click', (event) => {
        if (event.target === contactModal) {
            closeContactModal();
        }
    });
}

imageLightbox.addEventListener('click', (event) => {
    if (event.target === imageLightbox) {
        closeImageLightbox();
    }
});

lightboxCloseButton.addEventListener('click', closeImageLightbox);

if (contactLink) {
    contactLink.addEventListener('click', (event) => {
        event.preventDefault();
        openContactModal();
    });
}

if (contactModalCloseButton) {
    contactModalCloseButton.addEventListener('click', closeContactModal);
}

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    if (imageLightbox.classList.contains('active')) {
        closeImageLightbox();
        return;
    }

    if (modal.classList.contains('active')) {
        closeModal();
        return;
    }

    if (contactModal && contactModal.classList.contains('active')) {
        closeContactModal();
    }
});

const contactForm = document.getElementById('contact-form');
const contactStatus = document.getElementById('contact-status');
const contactNameInput = document.getElementById('contact-name');
const contactEmailInput = document.getElementById('contact-email');
const contactMessageInput = document.getElementById('contact-message');

if (contactForm && contactStatus && contactNameInput && contactEmailInput && contactMessageInput) {
    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = contactNameInput.value.trim();
        const email = contactEmailInput.value.trim();
        const message = contactMessageInput.value.trim();
        const recipient = contactForm.dataset.recipient || 'hello@example.com';

        if (!name || !email || !message) {
            contactStatus.textContent = 'Please complete all fields before sending.';
            return;
        }

        const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
        const body = encodeURIComponent(
            `Name: ${name}\nEmail: ${email}\n\n${message}`
        );

        window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
        contactStatus.textContent = 'Opening your email app...';
    });
}

const funHexButton = document.getElementById('fun-hex-button');
const funHello = document.getElementById('fun-hello');
let funHexClickCount = 0;

function playHexAnimation(className) {
    if (!funHexButton) return;
    funHexButton.classList.remove('spin', 'spin-fast');
    void funHexButton.offsetWidth;
    funHexButton.classList.add(className);
}

function emitHexSparks() {
    if (!funHexButton) return;

    const rect = funHexButton.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const sparkCount = 68;

    for (let i = 0; i < sparkCount; i += 1) {
        const spark = document.createElement('span');
        spark.className = 'fun-spark';
        spark.style.left = `${centerX}px`;
        spark.style.top = `${centerY}px`;

        const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.3;
        const distance = 40 + Math.random() * 130;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        const sparkSize = 2 + Math.random() * 4.5;
        const sparkDuration = 0.9 + Math.random() * 0.9;
        spark.style.setProperty('--dx', `${dx.toFixed(1)}px`);
        spark.style.setProperty('--dy', `${dy.toFixed(1)}px`);
        spark.style.setProperty('--spark-size', `${sparkSize.toFixed(1)}px`);
        spark.style.setProperty('--spark-duration', `${sparkDuration.toFixed(2)}s`);

        document.body.appendChild(spark);
        spark.addEventListener('animationend', () => spark.remove(), { once: true });
    }
}

function showFunHello() {
    if (!funHello) return;
    funHello.classList.remove('show');
    void funHello.offsetWidth;
    funHello.classList.add('show');
}

if (funHexButton) {
    funHexButton.addEventListener('click', () => {
        funHexClickCount += 1;

        if (funHexClickCount % 3 === 0) {
            playHexAnimation('spin-fast');
            emitHexSparks();
            showFunHello();
            return;
        }

        playHexAnimation('spin');
    });
}

const lastEditedDate = document.getElementById('last-edited-date');

if (lastEditedDate) {
    const today = new Date();
    lastEditedDate.textContent = today.toLocaleDateString('en-AU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}
