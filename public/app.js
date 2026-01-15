const meetingInput = document.getElementById('meetingInput');
const charCount = document.getElementById('charCount');
const processBtn = document.getElementById('processBtn');
const btnText = document.querySelector('.btn-text');
const loader = document.querySelector('.loader');
const statusMessage = document.getElementById('statusMessage');
const statusTitle = document.getElementById('statusTitle');
const statusDesc = document.getElementById('statusDesc');
const notionLink = document.getElementById('notionLink');

// Character count update
meetingInput.addEventListener('input', () => {
    const length = meetingInput.value.length;
    charCount.textContent = `${length.toLocaleString()} 자`;
});

// Main process function
processBtn.addEventListener('click', async () => {
    const text = meetingInput.value.trim();
    if (!text) {
        alert('내용을 입력해주세요.');
        return;
    }

    setLoading(true);
    hideStatus();

    try {
        const response = await fetch('/api/process-note', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        const data = await response.json();

        if (response.ok) {
            showStatus('success', '성공!', '회의록이 정리되어 노션에 저장되었습니다.');
            if (data.notionUrl) {
                notionLink.href = data.notionUrl;
                notionLink.classList.remove('hidden');
            }
            meetingInput.value = ''; // Clear input on success
            charCount.textContent = '0 자';
        } else {
            const errorMsg = data.details ? `[${data.code || 'ERROR'}] ${data.details}` : '알 수 없는 문제가 발생했습니다.';
            console.error('Server Error Detail:', data);
            showStatus('error', '오류 발생', errorMsg);
        }

    } catch (error) {
        showStatus('error', '네트워크 오류', '서버에 연결할 수 없거나 응답이 올바르지 않습니다.');
        console.error('Fetch Error:', error);
    } finally {
        setLoading(false);
    }
});

function setLoading(isLoading) {
    processBtn.disabled = isLoading;
    if (isLoading) {
        btnText.textContent = 'Saving...';
        loader.style.display = 'block';
    } else {
        btnText.textContent = 'Save';
        loader.style.display = 'none';
    }
}

function showStatus(type, title, description) {
    statusMessage.className = `status-message visible ${type}`;
    statusTitle.textContent = title;
    statusDesc.textContent = description;

    // Auto hide error after 5 seconds, keep success
    // Auto hide error after 5 seconds, keep success
    // if (type === 'error') {
    //     setTimeout(hideStatus, 5000);
    // }
}

function hideStatus() {
    statusMessage.classList.remove('visible');
    notionLink.classList.add('hidden');
    notionLink.href = '#';
}
