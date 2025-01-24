const syncCheckbox = document.getElementById('syncCheckbox');
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
    dropzone.textContent = 'Drag an image here';
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

function resetButtonStates() {
    document.querySelectorAll('.selection-container .button').forEach(button => {
        button.classList.remove('selected');
    });
}

function handleImageCountSelection(imageCount) {
    const isImageLoaded = imgContainers.some(({ img }) => img.src && img.style.display === 'block');

    if (isImageLoaded) {
        const userConfirmed = confirm("Current images will clear OK？");
        if (!userConfirmed) {
            return;
        }
    }

    resetButtonStates();
    const buttonId = imageCount === 2 ? 'twoImagesButton' :
                     imageCount === 3 ? 'threeImagesButton' : 
                     'fourImagesButton';
    document.getElementById(buttonId).classList.add('selected');

    screenshotArea.innerHTML = '';
    imgContainers = [];

    for (let i = 1; i <= imageCount; i++) {
        const layoutClass = imageCount === 2 ? 'half' : 
                            imageCount === 3 ? 'third' : 'quarter';
        createImageWrapper(i, layoutClass);
    }

    imgContainers.forEach(({ img }) => {
        img.addEventListener('mousedown', (e) => handleMouseDown(e, img));
        img.addEventListener('wheel', (e) => handleWheel(e, img));
    });
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

    dropzone.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imgElement.src = e.target.result;
                    imgElement.style.display = 'block';
                    dropzone.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });

        input.click();
    });
}

function syncImages(referenceImage, deltaX, deltaY) {
    if (!syncCheckbox.checked) return;

    imgContainers.forEach(({ img }) => {
        if (img !== referenceImage) {
            const currentLeft = parseFloat(img.style.left || 0);
            const currentTop = parseFloat(img.style.top || 0);
            img.style.left = `${currentLeft + deltaX}px`;
            img.style.top = `${currentTop + deltaY}px`;
        }
    });
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

/*
function handleWheel(e, imgElement) {
    e.preventDefault();
    scale += e.deltaY * -0.01;
    scale = Math.min(Math.max(1.0, scale), 16);
    imgElement.style.transform = `scale(${scale})`;

    if (syncCheckbox.checked) {
        syncImages(imgElement, 0, 0);
    }
}
*/
// ズーム時の同期
function handleWheel(e, imgElement) {
    e.preventDefault();
    scale += e.deltaY * -0.01;
    scale = Math.min(Math.max(1.0, scale), 16);

    imgContainers.forEach(({ img }) => {
        img.style.transform = `scale(${scale})`;
    });
}
///*
function resetImages() {

const childElements = screenshotArea.children; // 子要素をすべて取得

　　 let rect_width = 0;
    Array.from(childElements).forEach((child, index) => {
        const rect = child.getBoundingClientRect(); // 要素の位置とサイズを取得
        console.log(`Child ${index + 1}:`);
        console.log(`  Width: ${rect.width}px`);
        console.log(`  Height: ${rect.height}px`);
        rect_width = rect.width;
    });

    scale = 1;
    imgContainers.forEach(({ img }) => {
        img.style.transform = `scale(${scale})`;
        //img.style.left = '0';
        //img.style.top = '0';

    const container = document.getElementById('screenshotArea');
    const containerWidth = rect_width; //container.clientWidth; // コンテナの幅
    const containerHeight = container.clientHeight; // コンテナの高さ

    //const imgWidth = img.naturalWidth; // 画像の実際の幅
    //const imgHeight = img.naturalHeight; // 画像の実際の高さ
    const imgWidth = img.clientWidth; // 画像の実際の幅
    const imgHeight = img.clientHeight; // 画像の実際の高さ

    console.log(`Document imgWidth: ${imgWidth}px`);

    const centerX = (containerWidth - imgWidth) / 2; // 中央位置 (X)
    const centerY = (containerHeight - imgHeight)/ 2;//imgHeight / 2 //(containerHeight - imgHeight) / 2; // 中央位置 (Y)

    console.log(`Document width: ${centerX}px`);
    console.log(`Document width: ${centerY}px`);    

        img.style.left = `${centerX}px`;
        img.style.top = `${centerY}px`;
    //imgElement.style.left = `${centerX}px`;
    //imgElement.style.top = `${centerY}px`;
    });

}
//*/

/*
// 画像ごとの初期状態を記録するオブジェクト
let initialStates = new Map();

function initDragAndDrop(dropzone, imgElement) {
    dropzone.addEventListener('dragover', handleDragOver);
    dropzone.addEventListener('dragleave', handleDragLeave);
    dropzone.addEventListener('drop', (e) => handleDrop(e, imgElement, dropzone));

    dropzone.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imgElement.src = e.target.result;
                    imgElement.style.display = 'block';
                    dropzone.style.display = 'none';

                    // 初期位置とサイズを記録
                    imgElement.onload = () => {
                        initialStates.set(imgElement, {
                            left: imgElement.style.left || '0px',
                            top: imgElement.style.top || '0px',
                            scale: 1,
                        });
                    };
                };
                reader.readAsDataURL(file);
            }
        });

        input.click();
    });
}

// リセット時に初期状態を復元する関数
function resetImages() {
    imgContainers.forEach(({ img }) => {
        const initialState = initialStates.get(img);
        if (initialState) {
            img.style.left = initialState.left;
            img.style.top = initialState.top;
            img.style.transform = `scale(${initialState.scale})`;
        }
    });
}
*/

resetButton.addEventListener('click', resetImages);

/*
screenshotButton.addEventListener('click', function() {
    html2canvas(screenshotArea).then(canvas => {
        const link = document.createElement('a');
        link.download = 'screenshot.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});
*/
let originalState = null; 

screenshotButton.addEventListener('click', async function () {
    try {
        // スクリーンショットを撮る
        const canvas = await html2canvas(screenshotArea);

        // スクリーンショット画像をダウンロードとして保存
        const link = document.createElement('a');
        link.download = 'screenshot.png';
        link.href = canvas.toDataURL('image/png');
        link.click();

        // 画像をクリップボードにコピー
        canvas.toBlob(async (blob) => {
            if (!blob) {
                console.error("Blob生成に失敗しました");
                return;
            }

            const clipboardItem = new ClipboardItem({ 'image/png': blob });
            try {
                await navigator.clipboard.write([clipboardItem]);
                console.log('Cpied to Clipboard');
                alert('Screenshot was copied!');
            } catch (error) {
                console.error('Failed Cpied to Clipboard:', error);
                alert('Failed to copy Clipboard');
            }
        });
    } catch (error) {
        console.error('Failed to copy Clipboard:', error);
        alert('Failed to copy Clipboard');
    }
});

// キーボードによるSync Imagesのオン/オフ
document.addEventListener('keydown', (e) => {
    // 任意のキー（例: スペースキー）でチェックボックスを切り替え
    if (e.code === 'Space') {
        e.preventDefault(); // デフォルトのスペースキー動作を無効化
        syncCheckbox.checked = !syncCheckbox.checked;

        // ユーザへの視覚的なフィードバック（必要なら追加）
        if (syncCheckbox.checked) {
            console.log('Sync Images: ON');
        } else {
            console.log('Sync Images: OFF');
        }
    }
});


const mirrorCheckbox = document.getElementById('mirrorCheckbox');

// ミラーリングを適用する関数
function applyMirrorEffect() {
    if (!mirrorCheckbox.checked) return;

    // imgContainers[0]: 左側の画像, imgContainers[1]: 右側の画像
    if (imgContainers.length >= 2) {
        const rightImg = imgContainers[1].img; // 右側の画像
        const leftImg = imgContainers[0].img;  // 左側の画像

        if (rightImg.src) {
            // 右側画像のソースを左側画像にコピー
            leftImg.src = rightImg.src;

            // 右側画像の位置とスケールを左側画像に適用
            leftImg.style.transform = rightImg.style.transform;
            leftImg.style.left = rightImg.style.left;
            leftImg.style.top = rightImg.style.top;

            // 左側画像を表示
            leftImg.style.display = 'block';

            // 左側のドロップゾーンを非表示
            imgContainers[0].dropzone.style.display = 'none';
        }
    }
}

/*
// チェックボックスの状態変更時にミラーリングを適用
mirrorCheckbox.addEventListener('change', () => {
    if (mirrorCheckbox.checked) {
        applyMirrorEffect();
    }
});
*/
mirrorCheckbox.addEventListener('change', () => {
    const leftImg = imgContainers[0]?.img; // 左側の画像
    const rightImg = imgContainers[1]?.img; // 右側の画像

    if (mirrorCheckbox.checked) {
        // ミラー機能を適用
        if (leftImg && rightImg && rightImg.src) {
            // 元の状態を保存
            originalState = {
                src: leftImg.src,
                left: leftImg.style.left,
                top: leftImg.style.top,
                transform: leftImg.style.transform
            };

            // ミラー処理
            leftImg.src = rightImg.src;
            leftImg.style.transform = rightImg.style.transform;
            leftImg.style.left = rightImg.style.left;
            leftImg.style.top = rightImg.style.top;

            // ドロップゾーンを非表示
            imgContainers[0].dropzone.style.display = 'none';
            leftImg.style.display = 'block';
        }
    } else {
        // 元の状態に戻す
        if (leftImg && originalState) {
            leftImg.src = originalState.src;
            leftImg.style.transform = originalState.transform;
            leftImg.style.left = originalState.left;
            leftImg.style.top = originalState.top;

            // ドロップゾーンを表示
            imgContainers[0].dropzone.style.display = originalState.src ? 'none' : 'block';
        }
    }
});




twoImagesButton.addEventListener('click', () => handleImageCountSelection(2));
threeImagesButton.addEventListener('click', () => handleImageCountSelection(3));
fourImagesButton.addEventListener('click', () => handleImageCountSelection(4));

// ================
// initial settings

syncCheckbox.checked = true;

document.addEventListener('DOMContentLoaded', () => {
    handleImageCountSelection(2);
});
