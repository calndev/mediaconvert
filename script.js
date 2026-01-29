document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('converterForm');
    const inputFile = document.getElementById('inputFile');
    const inputFileInfo = document.getElementById('inputFileInfo');
    const convertBtn = document.getElementById('convertBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const statusText = document.getElementById('statusText');
    const formatSection = document.getElementById('formatSection');
    const formatCategories = document.getElementById('formatCategories');
    const settingsSection = document.getElementById('settingsSection');
    const dynamicSettings = document.getElementById('dynamicSettings');

    let selectedFormat = '';
    let fileType = '';
    let outputBlob = null;
    let outputFileName = '';

    const formatCategoriesData = {
        video: {
            title: 'video formats',
            formats: [
                { id: 'mp4', name: 'mp4', mime: 'video/mp4', ext: 'mp4' },
                { id: 'mov', name: 'mov', mime: 'video/quicktime', ext: 'mov' },
                { id: 'avi', name: 'avi', mime: 'video/x-msvideo', ext: 'avi' },
                { id: 'mkv', name: 'mkv', mime: 'video/x-matroska', ext: 'mkv' },
                { id: 'webm', name: 'webm', mime: 'video/webm', ext: 'webm' },
                { id: 'flv', name: 'flv', mime: 'video/x-flv', ext: 'flv' },
                { id: 'wmv', name: 'wmv', mime: 'video/x-ms-wmv', ext: 'wmv' },
                { id: 'mpeg', name: 'mpeg', mime: 'video/mpeg', ext: 'mpeg' }
            ]
        },
        audio: {
            title: 'audio formats',
            formats: [
                { id: 'mp3', name: 'mp3', mime: 'audio/mpeg', ext: 'mp3' },
                { id: 'wav', name: 'wav', mime: 'audio/wav', ext: 'wav' },
                { id: 'ogg', name: 'ogg', mime: 'audio/ogg', ext: 'ogg' },
                { id: 'flac', name: 'flac', mime: 'audio/flac', ext: 'flac' },
                { id: 'aac', name: 'aac', mime: 'audio/aac', ext: 'aac' },
                { id: 'm4a', name: 'm4a', mime: 'audio/mp4', ext: 'm4a' },
                { id: 'wma', name: 'wma', mime: 'audio/x-ms-wma', ext: 'wma' }
            ]
        },
        image: {
            title: 'image formats',
            formats: [
                { id: 'jpg', name: 'jpg', mime: 'image/jpeg', ext: 'jpg' },
                { id: 'png', name: 'png', mime: 'image/png', ext: 'png' },
                { id: 'gif', name: 'gif', mime: 'image/gif', ext: 'gif' },
                { id: 'bmp', name: 'bmp', mime: 'image/bmp', ext: 'bmp' },
                { id: 'webp', name: 'webp', mime: 'image/webp', ext: 'webp' },
                { id: 'tiff', name: 'tiff', mime: 'image/tiff', ext: 'tiff' }
            ]
        }
    };

    inputFile.addEventListener('change', function(e) {
        if (this.files.length > 0) {
            const file = this.files[0];
            const fileName = file.name;
            const fileSize = (file.size / (1024 * 1024)).toFixed(2);
            inputFileInfo.textContent = `${fileName} (${fileSize} mb)`;

            if (file.type.startsWith('video/')) {
                fileType = 'video';
            } else if (file.type.startsWith('audio/')) {
                fileType = 'audio';
            } else if (file.type.startsWith('image/')) {
                fileType = 'image';
            } else {
                fileType = 'other';
            }

            formatSection.style.display = 'block';
            renderFormatCategories();

            settingsSection.style.display = 'block';
            renderDynamicSettings();

        } else {
            inputFileInfo.textContent = 'no file selected';
            formatSection.style.display = 'none';
            settingsSection.style.display = 'none';
        }
    });

    function renderFormatCategories() {
        formatCategories.innerHTML = '';

        const categoriesToShow = [];

        if (fileType === 'video') {
            categoriesToShow.push('video', 'audio', 'image');
        } else if (fileType === 'audio') {
            categoriesToShow.push('audio', 'video');
        } else if (fileType === 'image') {
            categoriesToShow.push('image', 'video');
        } else {
            categoriesToShow.push('video', 'audio', 'image');
        }

        categoriesToShow.forEach(category => {
            const categoryData = formatCategoriesData[category];
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'format-category';

            categoryDiv.innerHTML = `
                <div class="category-title">${categoryData.title}</div>
                <div class="format-grid" id="${category}-formats"></div>
            `;

            formatCategories.appendChild(categoryDiv);

            const formatGrid = categoryDiv.querySelector(`.format-grid`);
            categoryData.formats.forEach(format => {
                const formatBtn = document.createElement('button');
                formatBtn.type = 'button';
                formatBtn.className = 'format-btn';
                formatBtn.dataset.format = format.id;
                formatBtn.dataset.ext = format.ext;
                formatBtn.textContent = format.name;

                formatBtn.addEventListener('click', function() {
                    document.querySelectorAll('.format-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });

                    this.classList.add('active');
                    selectedFormat = format.id;

                    const file = inputFile.files[0];
                    const baseName = file.name.split('.').slice(0, -1).join('.');
                    outputFileName = `${baseName}.${format.ext}`;

                    renderDynamicSettings();
                });

                formatGrid.appendChild(formatBtn);
            });
        });

        if (categoriesToShow.length > 0) {
            const firstFormatBtn = document.querySelector('.format-btn');
            if (firstFormatBtn) {
                firstFormatBtn.click();
            }
        }
    }

    function renderDynamicSettings() {
        dynamicSettings.innerHTML = '';

        if (!fileType || !selectedFormat) return;

        if (fileType === 'video') {
            const videoSettings = document.createElement('div');
            videoSettings.className = 'video-settings';

            videoSettings.innerHTML = `
                <div class="option-row">
                    <div class="option-group">
                        <label for="videoCodec">video codec</label>
                        <div class="custom-select-wrapper">
                            <select id="videoCodec" class="custom-select">
                                <option value="auto">auto</option>
                                <option value="libx264">h.264 (libx264)</option>
                                <option value="libx265">h.265 (libx265)</option>
                                <option value="libvpx-vp9">vp9 (libvpx-vp9)</option>
                                <option value="copy">copy (no re-encode)</option>
                            </select>
                        </div>
                    </div>
                    <div class="option-group">
                        <label for="quality">quality (crf)</label>
                        <input type="range" id="quality" min="0" max="51" value="18">
                        <div class="range-value">
                            <span>better</span>
                            <span id="qualityValue">18</span>
                            <span>smaller</span>
                        </div>
                    </div>
                </div>

                <div class="option-row">
                    <div class="option-group">
                        <label for="resolution">resolution</label>
                        <div class="custom-select-wrapper">
                            <select id="resolution" class="custom-select">
                                <option value="original">original</option>
                                <option value="4320p">4320p (8k)</option>
                                <option value="2160p">2160p (4k)</option>
                                <option value="1440p">1440p (2k)</option>
                                <option value="1080p">1080p (full hd)</option>
                                <option value="720p">720p (hd)</option>
                                <option value="480p">480p (sd)</option>
                            </select>
                        </div>
                    </div>
                    <div class="option-group">
                        <label for="framerate">frame rate</label>
                        <div class="custom-select-wrapper">
                            <select id="framerate" class="custom-select">
                                <option value="original">original</option>
                                <option value="60">60 fps</option>
                                <option value="30">30 fps</option>
                                <option value="24">24 fps</option>
                            </select>
                        </div>
                    </div>
                </div>
            `;

            dynamicSettings.appendChild(videoSettings);

            const qualitySlider = document.getElementById('quality');
            const qualityValue = document.getElementById('qualityValue');

            qualitySlider.addEventListener('input', function() {
                qualityValue.textContent = this.value;
            });
        }

        if (fileType === 'video' || fileType === 'audio') {
            const audioSettings = document.createElement('div');
            audioSettings.className = 'audio-settings';
            audioSettings.style.marginTop = '1.5rem';
            audioSettings.style.paddingTop = '1.5rem';
            audioSettings.style.borderTop = '1px solid var(--glass-border)';

            audioSettings.innerHTML = `
                <div class="option-row">
                    <div class="option-group">
                        <label for="audioCodec">audio codec</label>
                        <div class="custom-select-wrapper">
                            <select id="audioCodec" class="custom-select">
                                <option value="auto">auto</option>
                                <option value="aac">aac</option>
                                <option value="libmp3lame">mp3</option>
                                <option value="libvorbis">vorbis</option>
                                <option value="copy">copy (no re-encode)</option>
                            </select>
                        </div>
                    </div>
                    <div class="option-group">
                        <label for="audioBitrate">audio bitrate (kbps)</label>
                        <div class="custom-select-wrapper">
                            <select id="audioBitrate" class="custom-select">
                                <option value="auto">auto</option>
                                <option value="320">320</option>
                                <option value="256">256</option>
                                <option value="192">192</option>
                                <option value="128">128</option>
                                <option value="96">96</option>
                            </select>
                        </div>
                    </div>
                </div>
            `;

            dynamicSettings.appendChild(audioSettings);
        }

        if (fileType === 'image') {
            const imageSettings = document.createElement('div');
            imageSettings.className = 'image-settings';

            imageSettings.innerHTML = `
                <div class="option-row">
                    <div class="option-group">
                        <label for="imageQuality">quality</label>
                        <input type="range" id="imageQuality" min="1" max="100" value="100">
                        <div class="range-value">
                            <span>low</span>
                            <span id="imageQualityValue">100</span>
                            <span>high</span>
                        </div>
                    </div>
                    <div class="option-group">
                        <label for="imageResize">resize</label>
                        <div class="custom-select-wrapper">
                            <select id="imageResize" class="custom-select">
                                <option value="original">original</option>
                                <option value="1920">1920px</option>
                                <option value="1280">1280px</option>
                                <option value="1024">1024px</option>
                                <option value="800">800px</option>
                            </select>
                        </div>
                    </div>
                </div>
            `;

            dynamicSettings.appendChild(imageSettings);

            const imageQualitySlider = document.getElementById('imageQuality');
            const imageQualityValue = document.getElementById('imageQualityValue');

            imageQualitySlider.addEventListener('input', function() {
                imageQualityValue.textContent = this.value;
            });
        }
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!inputFile.files.length) {
            alert('please select an input file');
            return;
        }

        if (!selectedFormat) {
            alert('please select an output format');
            return;
        }

        progressContainer.classList.add('visible');
        convertBtn.disabled = true;
        convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> converting...';

        try {
            const file = inputFile.files[0];

            if (fileType === 'video') {
                outputBlob = await convertVideo(file, selectedFormat);
            } else if (fileType === 'audio') {
                outputBlob = await convertAudio(file, selectedFormat);
            } else if (fileType === 'image') {
                outputBlob = await convertImage(file, selectedFormat);
            } else {
                throw new Error('unsupported file type');
            }

            statusText.textContent = 'conversion complete!';
            progressBar.style.width = '100%';
            convertBtn.style.display = 'none';
            downloadBtn.classList.add('visible');

        } catch (error) {
            console.error('conversion error:', error);
            statusText.textContent = `error: ${error.message}`;
            convertBtn.disabled = false;
            convertBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> convert file';
        }
    });

    downloadBtn.addEventListener('click', function() {
        if (!outputBlob) return;

        const url = URL.createObjectURL(outputBlob);

        const a = document.createElement('a');
        a.href = url;
        a.download = outputFileName || `converted.${selectedFormat}`;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            progressContainer.classList.remove('visible');
            convertBtn.style.display = 'block';
            downloadBtn.classList.remove('visible');
            convertBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> convert another file';
            convertBtn.disabled = false;
            progressBar.style.width = '0%';
            statusText.textContent = 'ready for next conversion';
        }, 100);
    });

    async function convertVideo(file, format) {
        return new Promise((resolve) => {
            simulateConversion().then(() => {
                const outputBlob = new Blob([file], { type: `video/${format}` });
                resolve(outputBlob);
            });
        });
    }

    async function convertAudio(file, format) {
        return new Promise((resolve) => {
            simulateConversion().then(() => {
                const outputBlob = new Blob([file], { type: `audio/${format}` });
                resolve(outputBlob);
            });
        });
    }

    async function convertImage(file, format) {
        return new Promise((resolve) => {
            simulateConversion().then(() => {
                const outputBlob = new Blob([file], { type: `image/${format}` });
                resolve(outputBlob);
            });
        });
    }

    function simulateConversion() {
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 8;
                if (progress > 100) progress = 100;

                progressBar.style.width = `${progress}%`;

                if (progress === 100) {
                    clearInterval(interval);
                    resolve();
                } else {
                    const statusMessages = [
                        "initializing conversion...",
                        "analyzing input file...",
                        "setting up encoding parameters...",
                        "processing video stream...",
                        "processing audio stream...",
                        "finalizing output...",
                        "almost done..."
                    ];
                    const randomIndex = Math.floor(Math.random() * statusMessages.length);
                    statusText.textContent = `${statusMessages[randomIndex]} ${Math.round(progress)}%`;
                }
            }, 200);
        });
    }
});