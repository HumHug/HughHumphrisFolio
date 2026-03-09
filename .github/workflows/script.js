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
    document.body.classList.add('modal-open');
}

function closeModal() {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
    closeImageLightbox();

    modalVideo.pause();
    modalVideo.currentTime = 0;
    modalVideoEmbed.src = '';
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

imageLightbox.addEventListener('click', (event) => {
    if (event.target === imageLightbox) {
        closeImageLightbox();
    }
});

lightboxCloseButton.addEventListener('click', closeImageLightbox);

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    if (imageLightbox.classList.contains('active')) {
        closeImageLightbox();
        return;
    }

    if (modal.classList.contains('active')) {
        closeModal();
    }
});
