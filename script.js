// Initial State Structure
const createInitialState = () => ({
    atkLv: 0,
    defLv: 0,
    hpLv: 0,
    remCount: 34,
    maxCount: 34,
    leaves: 1000000
});

// Presets (5 slots)
let presets = Array(5).fill(null).map(() => createInitialState());
let currentPresetIndex = 0;

// Local Storage
function saveState() {
    localStorage.setItem('goldenMapleState', JSON.stringify({
        presets,
        currentPresetIndex
    }));
}

function loadState() {
    const saved = localStorage.getItem('goldenMapleState');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.presets && Array.isArray(parsed.presets)) {
                presets = parsed.presets;
            }
            if (typeof parsed.currentPresetIndex === 'number') {
                currentPresetIndex = parsed.currentPresetIndex;
            }
        } catch (e) {
            console.error("Failed to parse saved state", e);
        }
    }
}

// Load saved state on initialization
loadState();

// DOM Elements
const DOM = {
    presets: document.querySelectorAll('.preset-btn'),

    // Stats
    lvAtk: document.getElementById('lv-atk'),
    valAtk: document.getElementById('val-atk'),
    probAtk: document.getElementById('prob-atk'),

    lvDef: document.getElementById('lv-def'),
    valDef: document.getElementById('val-def'),
    probDef: document.getElementById('prob-def'),

    lvHp: document.getElementById('lv-hp'),
    valHp: document.getElementById('val-hp'),
    probHp: document.getElementById('prob-hp'),

    // Info
    totalLv: document.getElementById('total-lv'),
    successRate: document.getElementById('success-rate'),
    remCount: document.getElementById('rem-count'),
    maxCount: document.getElementById('max-count'),

    // Actions
    btnEnhance: document.getElementById('btn-enhance'),
    costEnhanceOwned: document.getElementById('cost-enhance-owned'),
    costEnhanceReq: document.getElementById('cost-enhance-req'),

    btnReset: document.getElementById('btn-reset'),
    costResetOwned: document.getElementById('cost-reset-owned'),
    costResetReq: document.getElementById('cost-reset-req'),

    // Settings Modal
    btnOpenSettings: document.getElementById('btn-open-settings'),
    settingsModal: document.getElementById('settings-modal'),
    inputLeaves: document.getElementById('input-leaves'),
    inputMaxCount: document.getElementById('input-max-count'),
    btnSettingsCancel: document.getElementById('btn-settings-cancel'),
    btnSettingsSave: document.getElementById('btn-settings-save'),

    effectContainer: document.getElementById('effect-container')
};

// Show Effect Animation
function showEffect(type, text) {
    DOM.effectContainer.innerHTML = ''; // Clear previous effects to prevent visual overlap
    const el = document.createElement('div');
    el.classList.add('effect-message');
    if (type === 'success') {
        el.classList.add('effect-success');
    } else if (type === 'fail') {
        el.classList.add('effect-fail');
    } else if (type === 'reset') {
        el.classList.add('effect-reset');
    }
    el.innerText = text;
    DOM.effectContainer.appendChild(el);

    // Remove element after animation ends (1.5s)
    setTimeout(() => {
        el.remove();
    }, 1500);
}

// Helper: Get current state
function getState() {
    return presets[currentPresetIndex];
}

// Preset Switching
DOM.presets.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        // Update active class
        DOM.presets.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentPresetIndex = index;
        saveState();
        updateUI();
    });
});

// Calculation Logic
function getWeight(level) {
    const rem = level % 5;
    if (rem === 0) return 20;
    if (rem === 1) return 17;
    if (rem === 2) return 14;
    if (rem === 3) return 11;
    if (rem === 4) return 8;
    return 0;
}

function getStatProbabilities(state) {
    const wAtk = getWeight(state.atkLv);
    const wDef = getWeight(state.defLv);
    const wHp = getWeight(state.hpLv);
    const totalW = wAtk + wDef + wHp;

    return {
        atk: totalW === 0 ? 0 : (wAtk / totalW) * 100,
        def: totalW === 0 ? 0 : (wDef / totalW) * 100,
        hp: totalW === 0 ? 0 : (wHp / totalW) * 100,
        wAtk, wDef, wHp, totalW
    };
}

function getTotalLevelInfo(totalLv) {
    if (totalLv >= 0 && totalLv <= 4) return { success: 100, cost: 1 };
    if (totalLv >= 5 && totalLv <= 9) return { success: 90, cost: 3 };
    if (totalLv >= 10 && totalLv <= 14) return { success: 80, cost: 5 };
    if (totalLv >= 15 && totalLv <= 19) return { success: 70, cost: 10 };
    if (totalLv >= 20 && totalLv <= 24) return { success: 60, cost: 15 };
    if (totalLv >= 25 && totalLv <= 29) return { success: 50, cost: 20 };
    if (totalLv >= 30 && totalLv <= 34) return { success: 40, cost: 25 };
    if (totalLv >= 35 && totalLv <= 39) return { success: 30, cost: 30 };
    if (totalLv >= 40 && totalLv <= 44) return { success: 20, cost: 35 };
    if (totalLv >= 45 && totalLv <= 49) return { success: 10, cost: 40 };
    if (totalLv >= 50) return { success: 1, cost: 50 };
    return { success: 0, cost: 0 };
}

// Update UI
function updateUI() {
    const state = getState();

    // Update active preset button based on currentPresetIndex
    DOM.presets.forEach((b, i) => {
        if (i === currentPresetIndex) {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });

    // Stats Calculations
    const probs = getStatProbabilities(state);

    // Total Level
    const totalLv = state.atkLv + state.defLv + state.hpLv;
    const totalInfo = getTotalLevelInfo(totalLv);

    // Update Stats UI
    DOM.lvAtk.innerText = state.atkLv;
    DOM.valAtk.innerText = state.atkLv * 3;
    DOM.probAtk.innerText = probs.atk.toFixed(2);

    DOM.lvDef.innerText = state.defLv;
    DOM.valDef.innerText = state.defLv * 3;
    DOM.probDef.innerText = probs.def.toFixed(2);

    DOM.lvHp.innerText = state.hpLv;
    DOM.valHp.innerText = state.hpLv * 3;
    DOM.probHp.innerText = probs.hp.toFixed(2);

    // Update Info UI
    DOM.totalLv.innerText = totalLv;
    DOM.successRate.innerText = totalInfo.success;
    DOM.remCount.innerText = state.remCount;
    DOM.maxCount.innerText = state.maxCount;

    // Update Cost UI
    DOM.costEnhanceOwned.innerText = state.leaves;
    DOM.costEnhanceReq.innerText = totalInfo.cost;

    DOM.costResetOwned.innerText = state.leaves;
    DOM.costResetReq.innerText = 30; // Fixed reset cost
}

// Actions
DOM.btnEnhance.addEventListener('click', () => {
    const state = getState();
    if (state.remCount <= 0) {
        showEffect('fail', '남은 강화 횟수가 없습니다.');
        return;
    }

    const totalLv = state.atkLv + state.defLv + state.hpLv;
    const totalInfo = getTotalLevelInfo(totalLv);

    if (state.leaves < totalInfo.cost) {
        alert("황금 단풍잎이 부족합니다.");
        return;
    }

    // Deduct cost and count
    state.leaves -= totalInfo.cost;
    state.remCount -= 1;

    // Check success
    const randSuccess = Math.random() * 100;
    if (randSuccess <= totalInfo.success) {
        // Success
        const probs = getStatProbabilities(state);
        const randStat = Math.random() * probs.totalW;

        if (randStat < probs.wAtk) {
            state.atkLv += 1;
        } else if (randStat < probs.wAtk + probs.wDef) {
            state.defLv += 1;
        } else {
            state.hpLv += 1;
        }
        showEffect('success', '강화 성공!');
    } else {
        // Failed
        showEffect('fail', '강화 실패');
    }

    // Propagate leaves changes to all presets since it's an account-wide currency, or keep per-preset.
    // The prompt says "현재 강화 레벨과 남은 강화 횟수와 강화 시 소모량, 황금단풍잎 보유량 등 모든 상태가 각각 저장되어 있는 슬롯".
    // So they are isolated.
    saveState();
    updateUI();
});

DOM.btnReset.addEventListener('click', () => {
    const state = getState();
    const RESET_COST = 30;

    if (state.leaves < RESET_COST) {
        alert("초기화 비용이 부족합니다.");
        return;
    }

    state.leaves -= RESET_COST;
    state.atkLv = 0;
    state.defLv = 0;
    state.hpLv = 0;
    state.remCount = state.maxCount;

    showEffect('reset', '초기화 완료!');

    saveState();
    updateUI();
});

// Settings Modal
DOM.btnOpenSettings.addEventListener('click', () => {
    const state = getState();
    DOM.inputLeaves.value = state.leaves;
    DOM.inputMaxCount.value = state.maxCount;
    DOM.settingsModal.classList.add('show');
});

DOM.btnSettingsCancel.addEventListener('click', () => {
    DOM.settingsModal.classList.remove('show');
});

DOM.btnSettingsSave.addEventListener('click', () => {
    const state = getState();
    const newLeaves = parseInt(DOM.inputLeaves.value, 10);
    const newMaxCount = parseInt(DOM.inputMaxCount.value, 10);

    if (isNaN(newLeaves) || newLeaves < 0) {
        alert("유효한 단풍잎 개수를 입력하세요.");
        return;
    }

    if (isNaN(newMaxCount) || newMaxCount < 1 || newMaxCount > 50) {
        alert("최대 강화 횟수는 1에서 50 사이여야 합니다.");
        return;
    }

    state.leaves = newLeaves;
    state.maxCount = newMaxCount;

    // The prompt says: "남은 강화 횟수는 설정 버튼 추가 및 설정 UI를 구현하고, 설정에서 임의로 변경 가능하게 할 것"
    // So if they change max, we probably reset current to max, or let them set current?
    // To be safe, let's just reset the remCount to maxCount or clamp it.
    if (state.remCount > state.maxCount) {
        state.remCount = state.maxCount;
    } else {
        // Resetting the rem count based on max count is an intuitive behavior for this kind of setting.
        state.remCount = state.maxCount;
    }

    DOM.settingsModal.classList.remove('show');
    saveState();
    updateUI();
});

// Initialize
updateUI();
