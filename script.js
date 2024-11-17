const syncCheckbox = document.getElementById('syncCheckbox');
const overlayCheckbox = document.getElementById('overlayCheckbox');
const resetButton = document.getElementById('resetButton');
const screenshotButton = document.getElementById('screenshotButton');
const screenshotArea = document.getElementById('screenshotArea');
const twoImagesButton = document.getElementById('twoImagesButton');
const threeImagesButton = document.getElementById('threeImagesButton');
const fourImagesButton = document.getElementById('fourImagesButton');

let scale = 1;
let isDragging = false;
let startX, startY;
let currentImage = null;
let imgContainers = [];

function createImageWrapper(id, layoutClass) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('image-wrapper', layoutClass);
    
    const dropzone = document.createElement('div');
    dropzone.classList.add('dropzone');
    dropzone.textContent = '画像をここにドラッグ';
    wrapper.appendChild(dropzone);

    const img = document.createElement('img');
    img.id = `image${id}`;
    img.alt = `Image ${id}`;
    img.style.display = 'none';
    wrapper.appendChild(img);

    screenshotArea.appendChild(wrapper);

    initDragAndDrop(dropzone, img);
    imgContainers.push({ img, dropzone });
}

function handleImageCountSelection(imageCount) {
    // 既存の画像領域をクリア
    screenshotArea.innerHTML = '';
    imgContainers = [];
    document.querySelector('.overlay-option').style.display = (imageCount === 2) ? 'block' : 'none';

    // 指定された枚数の画像領域を作成
    for (let i = 1; i <= imageCount; i++) {
        if (imageCount === 2) {
            createImageWrapper(i, 'half'); // 左右に分割
        } else if (imageCount === 3) {
            createImageWrapper(i, 'third'); // 3分割: 左、中、右
        } else if (imageCount === 4) {
            createImageWrapper(i, 'quarter'); // 4分割: 左上、右上、左下、右下
        }
    }

    // イベントリスナーの再設定
    imgContainers.forEach(({ img }) => {
        img.addEventListener('mousedown', (e) => handleMouseDown(e, img));
        img.addEventListener('wheel', (e) => handleWheel(e, img));
    });
}

function syncImages(movedImage, deltaX, deltaY) {
    if (syncCheckbox.checked || overlayCheckbox.checked) {
        imgContainers.forEach(({ img }) => {
            if (img !== movedImage) {
                img.style.transform = movedImage.style.transform;
                img.style.left = `${parseFloat(movedImage.style.left || 0)}px`;
                img.style.top = `${parseFloat(movedImage.style.top || 0)}px`;
            }
        });
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.style.border = '2px dashed #777';
}

function handleDragLeave(e) {
    e.currentTarget.style.border = '';
}

function handleDrop(e, imgElement, dropzoneElement) {
    e.preventDefault();
    e.currentTarget.style.border = '';
    const file = e.dataTransfer.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        imgElement.src = event.target.result;
        imgElement.style.display = 'block';
        dropzoneElement.style.display = 'none';
    }

    reader.readAsDataURL(file);
}

function initDragAndDrop(dropzone, imgElement) {
    dropzone.addEventListener('dragover', handleDragOver);
    dropzone.addEventListener('dragleave', handleDragLeave);
    dropzone.addEventListener('drop', (e) => handleDrop(e, imgElement, dropzone));
}

function handleMouseDown(e, imgElement) {
    isDragging = true;
    currentImage = imgElement;
    startX = e.pageX - imgElement.offsetLeft;
    startY = e.pageY - imgElement.offsetTop;
    e.preventDefault();
}

window.addEventListener('mouseup', function() {
    isDragging = false;
    currentImage = null;
});

window.addEventListener('mousemove', function(e) {
    if (isDragging && currentImage) {
        const deltaX = e.pageX - startX - (parseFloat(currentImage.style.left || 0));
        const deltaY = e.pageY - startY - (parseFloat(currentImage.style.top || 0));

        currentImage.style.left = `${e.pageX - startX}px`;
        currentImage.style.top = `${e.pageY - startY}px`;

        syncImages(currentImage, deltaX, deltaY);
    }
});

function handleWheel(e, imgElement) {
    e.preventDefault();
    scale += e.deltaY * -0.01;
    scale = Math.min(Math.max(1.0, scale), 16);
    imgElement.style.transform = `scale(${scale})`;

    if (syncCheckbox.checked || overlayCheckbox.checked) {
        syncImages(imgElement, 0, 0);
    }
}

function resetImages() {
    scale = 1;
    imgContainers.forEach(({ img }) => {
        img.style.transform = `scale(${scale})`;
        img.style.left = '0';
        img.style.top = '0';
    });
}

resetButton.addEventListener('click', resetImages);

screenshotButton.addEventListener('click', function() {
    html2canvas(screenshotArea).then(canvas => {
        const link = document.createElement('a');
        link.download = 'screenshot.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});

twoImagesButton.addEventListener('click', () => handleImageCountSelection(2));
threeImagesButton.addEventListener('click', () => handleImageCountSelection(3));
fourImagesButton.addEventListener('click', () => handleImageCountSelection(4));

overlayCheckbox.addEventListener('change', function() {
    const overlayEnabled = overlayCheckbox.checked;
    const [leftImage, rightImage] = imgContainers.map(({ img }) => img);
    
    if (overlayEnabled) {
        rightImage.style.position = 'absolute';
        rightImage.style.zIndex = '1';
        syncImages(rightImage, 0, 0); // 右の画像に左の画像を同期
    } else {
        rightImage.style.position = 'relative';
        rightImage.style.zIndex = '0';
    }
});

// 初期状態として2枚の画像表示領域を作成
handleImageCountSelection(2);
