const SCRIPT_VERSION = "4.9"; // EXACT provided member list & reset date fix

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyAT8L9vDqFHyGB-MybtcLEBgCALuNflTZY",
  authDomain: "red-train-rotation-tool.firebaseapp.com",
  projectId: "red-train-rotation-tool",
  storageBucket: "red-train-rotation-tool.firebasestorage.app",
  messagingSenderId: "178389819926",
  appId: "1:178389819926:web:bd59c273641ab8530ccb37"
};
try { firebase.initializeApp(firebaseConfig); } catch (e) { console.error("Firebase Init Error", e); alert("Could not initialize Firebase."); }
const db = firebase.firestore();
const stateDocRef = db.collection("rotationState").doc("s749_state");

// --- Constants and State ---
const MVP_TECH_DAY = 1; const MVP_VS_DAY = 0; const RANKS = ["Member", "R4", "R5"];
let state = { members: [], rotationState: { currentDate: null, r4r5Index: 0, memberIndex: 0, skippedVips: [], selectedMvps: {}, vipCounts: {}, mvpCounts: {}, alternativeVips: {}, completedSubstituteVipsThisRound: [] }, previousRotationState: null };

// --- Initial Data (EXACTLY from user list - 96 Members) ---
const initialMembers = [
    { name: "LadyLaik", rank: "R5"},         // 1
    { name: "CornFlakes", rank: "R4"},       // 2
    { name: "DaVinnie", rank: "R4"},         // 3
    { name: "Enyaisrave", rank: "R4"},       // 4
    { name: "Johcar", rank: "R4"},           // 5
    { name: "Lyfe", rank: "R4"},             // 6
    { name: "Motherfrogger", rank: "R4"},    // 7
    { name: "NymbleV", rank: "R4"},          // 8
    { name: "Pabs64", rank: "R4"},           // 9
    { name: "Supersebb", rank: "R4"},        // 10
    { name: "АЛЕКС1980", rank: "Member"},    // 11
    { name: "Ado1111", rank: "Member"},      // 12
    { name: "Aminos77", rank: "Member"},     // 13
    { name: "Arczos", rank: "Member"},       // 14
    { name: "B1wizz", rank: "Member"},       // 15
    { name: "Be a wolf", rank: "Member"},    // 16
    { name: "Bekim1", rank: "Member"},       // 17
    { name: "BlackPush", rank: "Member"},    // 18
    { name: "BlackWizardUA", rank: "Member"}, // 19
    { name: "blacky12345", rank: "Member"},  // 20
    { name: "BLÀDE", rank: "Member"},        // 21
    { name: "BOREDOFTHISSHTGAME", rank: "Member"}, // 22
    { name: "Caretta", rank: "Member"},      // 23
    { name: "Chasseur 777", rank: "Member"}, // 24
    { name: "Cocsi29400", rank: "Member"},   // 25
    { name: "Commander BLad", rank: "Member"},// 26
    { name: "Dario217", rank: "Member"},     // 27
    { name: "Darkknight", rank: "Member"},   // 28
    { name: "depechefann", rank: "Member"},  // 29
    { name: "Dfyra", rank: "Member"},        // 30
    { name: "DiamondDixie", rank: "Member"}, // 31
    { name: "diRty freNk", rank: "Member"},  // 32
    { name: "Edx77", rank: "Member"},        // 33
    { name: "Ever4", rank: "Member"},        // 34
    { name: "F L A C", rank: "Member"},      // 35
    { name: "Faluche", rank: "Member"},      // 36
    { name: "FireXice (Bibot)", rank: "Member"}, // 37
    { name: "Foggis", rank: "Member"},       // 38
    { name: "GhósT", rank: "Member"},        // 39
    { name: "Gekkegerrittttt", rank: "Member"},// 40
    { name: "GoFireES", rank: "Member"},     // 41
    { name: "Gorkiules", rank: "Member"},    // 42
    { name: "Gunnovic", rank: "Member"},     // 43
    { name: "ILYES B", rank: "Member"},      // 44
    { name: "IRONHAMMER", rank: "Member"},   // 45
    { name: "Jaista", rank: "Member"},       // 46
    { name: "jarako", rank: "Member"},       // 47
    { name: "jassådu", rank: "Member"},      // 48
    { name: "Jotersan", rank: "Member"},     // 49
    { name: "Juantxo79", rank: "Member"},    // 50
    { name: "Juggernaut x", rank: "Member"}, // 51
    { name: "KezuaL", rank: "Member"},       // 52
    { name: "KFCPov3r", rank: "Member"},     // 53
    { name: "KingStridez", rank: "Member"},  // 54
    { name: "koppies", rank: "Member"},      // 55
    { name: "KPShafty", rank: "Member"},     // 56
    { name: "Kyuchie", rank: "Member"},      // 57
    { name: "Laeta", rank: "Member"},        // 58
    { name: "Leka98", rank: "Member"},       // 59
    { name: "Llama deDrama", rank: "Member"},// 60
    { name: "Lutonian", rank: "Member"},     // 61
    { name: "Mala Mimi", rank: "Member"},    // 62
    { name: "Maytos", rank: "Member"},       // 63
    { name: "Megalomanie", rank: "Member"},  // 64
    { name: "Meloziaa", rank: "Member"},     // 65
    { name: "MRan", rank: "Member"},         // 66
    { name: "NinoDelBono", rank: "Member"},  // 67
    { name: "Nohardfeelz", rank: "Member"},  // 68
    { name: "Novis01", rank: "Member"},      // 69
    { name: "Oliviax", rank: "Member"},      // 70
    { name: "olabaf", rank: "Member"},       // 71
    { name: "oo APACHE oo", rank: "Member"}, // 72
    { name: "Peckap", rank: "Member"},       // 73
    { name: "Prantuan", rank: "Member"},     // 74
    { name: "RaMbo0", rank: "Member"},       // 75
    { name: "Raph911", rank: "Member"},      // 76
    { name: "Rev T", rank: "Member"},        // 77
    { name: "Rikkyyyyy", rank: "Member"},    // 78
    { name: "S A M U R A i", rank: "Member"},// 79
    { name: "Sarajevo Mfrcs", rank: "Member"},// 80
    { name: "SkyWinder", rank: "Member"},    // 81
    { name: "Smâsh", rank: "Member"},        // 82
    { name: "Smugwell", rank: "Member"},     // 83
    { name: "Swisskilla", rank: "Member"},   // 84
    { name: "Temd", rank: "Member"},         // 85
    // { name: "TermiGator", rank: "Member"}, // Removed - Nicht in der letzten Liste
    { name: "TheFloh", rank: "Member"},      // 86
    { name: "theFoxXx", rank: "Member"},     // 87
    { name: "Thirteen Squid", rank: "Member"},// 88
    { name: "Umbra XIII", rank: "Member"},   // 89
    { name: "Vechniy", rank: "Member"},      // 90
    { name: "Villanueva 1", rank: "Member"}, // 91
    { name: "xAishaRosex", rank: "Member"},  // 92
    { name: "xPerseus", rank: "Member"},     // 93
    { name: "Xyz111111", rank: "Member"},    // 94
    { name: "Zoorglub", rank: "Member"},     // 95
    { name: "ЖЭКА", rank: "Member"}         // 96
].map(m => ({ ...m, id: m.id || generateId() })); // Ensure IDs exist

// --- DOM Elements ---
const memberListEl = document.getElementById('member-list'); const addMemberForm = document.getElementById('add-member-form'); const newMemberNameInput = document.getElementById('new-member-name'); const newMemberRankSelect = document.getElementById('new-member-rank'); const memberCountEl = document.getElementById('member-count'); const currentDateEl = document.getElementById('current-date'); const currentDayOfWeekEl = document.getElementById('current-day-of-week'); const currentConductorEl = document.getElementById('current-conductor'); const currentVipEl = document.getElementById('current-vip'); const skippedVipsListEl = document.getElementById('skipped-vips').querySelector('ul'); const scheduleDisplayListEl = document.getElementById('schedule-display').querySelector('ul'); const vipAcceptedBtn = document.getElementById('vip-accepted'); const vipSkippedBtn = document.getElementById('vip-skipped'); const undoAdvanceBtn = document.getElementById('undo-advance'); const mvpSelectionArea = document.getElementById('mvp-selection-area'); const mvpSelect = document.getElementById('mvp-select');
const resetBtn = document.getElementById('reset-data'); const mvpStatsListEl = document.getElementById('mvp-stats').querySelector('ul'); const vipStatsListEl = document.getElementById('vip-stats').querySelector('ul');
const alternativeVipArea = document.getElementById('alternative-vip-area'); const alternativeVipSelect = document.getElementById('alternative-vip-select'); const confirmAlternativeVipBtn = document.getElementById('confirm-alternative-vip'); const originalSkippedVipNameEl = document.getElementById('original-skipped-vip-name');
const lastCompletedDateEl = document.getElementById('last-completed-date'); const lastCompletedConductorEl = document.getElementById('last-completed-conductor'); const lastCompletedVipEl = document.getElementById('last-completed-vip');
const versionEl = document.getElementById('script-version');

// --- Utility Functions ---
function generateId() { return Math.random().toString(36).substring(2, 15); }
function getDayOfWeek(date) { return date.getDay(); } // 0=Sun, 1=Mon
function formatDate(date) { if (!(date instanceof Date) || isNaN(date)) return "Invalid Date"; return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }); }
function getISODateString(date) { if (!(date instanceof Date) || isNaN(date)) { console.error("Invalid date:", date); return new Date().toISOString().split('T')[0]; } return date.toISOString().split('T')[0]; }
function addDays(date, days) { const result = new Date(date); result.setDate(result.getDate() + days); return result; }
function findNextMonday(date) { // Corrected version
    const currentDay = getDayOfWeek(date);
    const daysToAdd = (1 - currentDay + 7) % 7;
    return addDays(date, daysToAdd);
}
function getMemberById(id) { return state.members?.find(m => m?.id === id); }
function getMembersByRank(rank) { if (!Array.isArray(state.members)) return []; if (rank === 'R4/R5') return state.members.filter(m => m && (m.rank === 'R4' || m.rank === 'R5')); return state.members.filter(m => m && m.rank === rank); }

// --- Core Logic ---
function calculateDailyAssignments(targetDateStr, currentR4R5Index, currentMemberIndex, currentSkippedVips, selectedMvpsMap, completedSubstitutes = []) {
    if (!targetDateStr || typeof currentR4R5Index !== 'number' || typeof currentMemberIndex !== 'number' || !Array.isArray(currentSkippedVips) || typeof selectedMvpsMap !== 'object' || !Array.isArray(completedSubstitutes)) { return { date: new Date(), conductor: { id: 'ERR' }, vip: { id: 'ERR'}, effectiveMemberIndex: currentMemberIndex }; }
    const targetDate = new Date(targetDateStr + 'T00:00:00Z'); if (isNaN(targetDate)) { return { date: new Date(), conductor: { id: 'ERR' }, vip: { id: 'ERR'}, effectiveMemberIndex: currentMemberIndex }; }
    const dayOfWeek = getDayOfWeek(targetDate); let conductor = null; let vip = null; const r4r5Members = getMembersByRank('R4/R5'); const memberMembers = getMembersByRank('Member');
    let effectiveMemberIndex = currentMemberIndex;

    if (dayOfWeek === MVP_TECH_DAY) { const k = `${targetDateStr}_Mon`; const id = selectedMvpsMap[k]; conductor = id ? getMemberById(id) : { id: 'MVP_MON_SELECT', name: 'Tech MVP Needed', rank: 'MVP' }; } else if (dayOfWeek === MVP_VS_DAY) { const k = `${targetDateStr}_Sun`; const id = selectedMvpsMap[k]; conductor = id ? getMemberById(id) : { id: 'MVP_SUN_SELECT', name: 'VS MVP Needed', rank: 'MVP' }; } else { conductor = r4r5Members.length > 0 ? r4r5Members[currentR4R5Index % r4r5Members.length] : { id: 'NO_R4R5', name: 'No R4/R5', rank: 'Sys' }; }
    const validSkippedVips = currentSkippedVips.filter(id => getMemberById(id));
    if (validSkippedVips.length > 0) {
        vip = getMemberById(validSkippedVips[0]);
        effectiveMemberIndex = currentMemberIndex;
    } else if (memberMembers.length > 0) {
        let potentialVip = null; let loopCheck = 0; let tempMemberIndex = currentMemberIndex;
        while (!potentialVip && loopCheck < memberMembers.length) {
            const vipIndex = tempMemberIndex % memberMembers.length; const candidate = memberMembers[vipIndex];
            if (candidate && !completedSubstitutes.includes(candidate.id)) {
                potentialVip = candidate;
                effectiveMemberIndex = tempMemberIndex;
            } else { tempMemberIndex++; loopCheck++; }
        }
        if (potentialVip) { vip = potentialVip; } else { vip = { id: 'NO_VALID_MEMBER', name: 'No valid Member left', rank: 'Sys' }; effectiveMemberIndex = currentMemberIndex; }
    } else { vip = { id: 'NO_MEMBERS', name: 'No Members Available', rank: 'Sys' }; effectiveMemberIndex = currentMemberIndex; }

    conductor = conductor || { id: 'ERR_C', name: 'Err C', rank: 'Sys' }; vip = vip || { id: 'ERR_V', name: 'Err V', rank: 'Sys' };
    return { date: targetDate, conductor, vip, effectiveMemberIndex };
}

function advanceRotation(vipAccepted, selectedMvpId = null) { // Handles ACCEPT path ONLY
     if (!state.rotationState?.currentDate) { return false; }
     const currentDateStr = state.rotationState.currentDate; const currentDate = new Date(currentDateStr + 'T00:00:00Z'); const currentDayOfWeek = getDayOfWeek(currentDate);
     const currentR4R5Index = state.rotationState.r4r5Index ?? 0; const currentMemberIndex = state.rotationState.memberIndex ?? 0; const currentSkippedVips = [...(state.rotationState.skippedVips || [])]; const currentVipCounts = { ...(state.rotationState.vipCounts || {}) }; const currentMvpCounts = { ...(state.rotationState.mvpCounts || {}) }; const currentSelectedMvps = { ...(state.rotationState.selectedMvps || {}) };
     const currentAlternativeVips = { ...(state.rotationState.alternativeVips || {}) };
     const currentSubstituteList = [...(state.rotationState.completedSubstituteVipsThisRound || [])];

     const { vip: proposedVip, effectiveMemberIndex } = calculateDailyAssignments(currentDateStr, currentR4R5Index, currentMemberIndex, currentSkippedVips, currentSelectedMvps, currentSubstituteList);
     if (!proposedVip?.id || proposedVip.id.startsWith('NO_') || proposedVip.id.startsWith('ERROR_')) { alert("No valid VIP proposed."); return false; }
     const proposedVipId = proposedVip.id; let nextR4R5Index = currentR4R5Index; let nextMemberIndex = currentMemberIndex; let nextSkippedVips = currentSkippedVips.filter(id => getMemberById(id)); const wasVipFromSkippedList = nextSkippedVips.length > 0 && nextSkippedVips[0] === proposedVipId;
     if (!vipAccepted) { return false; }

     nextMemberIndex = effectiveMemberIndex + 1;

     if (wasVipFromSkippedList) { nextSkippedVips.shift(); }
     currentVipCounts[proposedVipId] = (currentVipCounts[proposedVipId] || 0) + 1;

     const memberMembers = getMembersByRank('Member');
     let finalSubstituteList = currentSubstituteList;
     if (memberMembers.length > 0 && (nextMemberIndex % memberMembers.length === 0) && nextMemberIndex > 0) {
         console.log("ADVANCE ROTATION: Round End detected! Clearing Substitute List.");
         finalSubstituteList = [];
     }

     if (currentDayOfWeek >= 2 && currentDayOfWeek <= 6) { nextR4R5Index = (currentR4R5Index + 1); } if (selectedMvpId) { const member = getMemberById(selectedMvpId); if (member) { const mvpKey = currentDayOfWeek === MVP_TECH_DAY ? `${currentDateStr}_Mon` : `${currentDateStr}_Sun`; currentSelectedMvps[mvpKey] = selectedMvpId; currentMvpCounts[selectedMvpId] = (currentMvpCounts[selectedMvpId] || 0) + 1; } else { console.warn(`MVP ID ${selectedMvpId} not found`); } }
     const nextDate = addDays(currentDate, 1); const nextDateStr = getISODateString(nextDate);
     state.rotationState.currentDate = nextDateStr; state.rotationState.r4r5Index = nextR4R5Index; state.rotationState.memberIndex = nextMemberIndex; state.rotationState.skippedVips = nextSkippedVips; state.rotationState.selectedMvps = currentSelectedMvps; state.rotationState.vipCounts = currentVipCounts; state.rotationState.mvpCounts = currentMvpCounts;
     state.rotationState.alternativeVips = currentAlternativeVips; state.rotationState.completedSubstituteVipsThisRound = finalSubstituteList;
     return true;
}
function updateFirestoreState() { // Updated to save new substitute list
    const stateToSave={ members:state.members||[], rotationState:{ currentDate:state.rotationState.currentDate, r4r5Index:state.rotationState.r4r5Index??0, memberIndex:state.rotationState.memberIndex??0, skippedVips:state.rotationState.skippedVips||[], selectedMvps:state.rotationState.selectedMvps||{}, vipCounts:state.rotationState.vipCounts||{}, mvpCounts:state.rotationState.mvpCounts||{}, alternativeVips: state.rotationState.alternativeVips || {}, completedSubstituteVipsThisRound: state.rotationState.completedSubstituteVipsThisRound || [] } };
    return stateDocRef.set(stateToSave).then(()=>{/* Success */}).catch((e)=>{console.error("FS write FAIL:", e); alert(`Save Error: ${e.message}`); throw e;});
}

// --- Member Management ---
function addMember(event) { event.preventDefault(); const n = newMemberNameInput.value.trim(); const r = newMemberRankSelect.value; if(n&&r){ if(!Array.isArray(state.members)) state.members=[]; if(state.members.some(m=>m?.name.toLowerCase()===n.toLowerCase())){alert(`Exists: ${n}`); return;} const nm={id:generateId(), name:n, rank:r}; state.members.push(nm); sortMembers(); updateFirestoreState(); newMemberNameInput.value='';} else{alert("Name & Rank needed");} }
function removeMember(id) { const m=getMemberById(id); if(!m) return; if(confirm(`Remove ${m.name}?`)){if(!Array.isArray(state.members)) state.members=[]; state.members=state.members.filter(mb=>mb?.id !== id); if(!state.rotationState) state.rotationState={}; if(!Array.isArray(state.rotationState.skippedVips)) state.rotationState.skippedVips=[]; state.rotationState.skippedVips = state.rotationState.skippedVips.filter(sid => sid !== id); if(Array.isArray(state.rotationState.completedSubstituteVipsThisRound)) { state.rotationState.completedSubstituteVipsThisRound = state.rotationState.completedSubstituteVipsThisRound.filter(subId => subId !== id); } updateFirestoreState();} }
function handleRankChange(event) { const sel = event.target; const id = sel.dataset.memberId; const rank = sel.value; const idx = state.members.findIndex(m => m?.id === id); if(idx === -1) { console.error("Not found:", id); return; } const name = state.members[idx].name; if(state.members[idx].rank === rank) return; if(confirm(`Change ${name} rank to ${rank}?`)){ state.members[idx].rank = rank; sortMembers(); updateFirestoreState(); } else { sel.value = state.members[idx].rank; } }
function sortMembers() { if(!Array.isArray(state.members)) return; const order = {'R5':1, 'R4':2, 'Member':3}; state.members.sort((a,b) => { const rA=a?.rank; const rB=b?.rank; const nA=a?.name||""; const nB=b?.name||""; const d=(order[rA]||99)-(order[rB]||99); if(d!==0) return d; return nA.localeCompare(nB); }); }

// --- Rendering Functions ---
function renderMemberList() { memberListEl.innerHTML = ''; if (!Array.isArray(state.members)) { return; } memberCountEl.textContent = state.members.length; sortMembers(); if (state.members.length === 0) { memberListEl.innerHTML = '<li>No members.</li>'; return; } state.members.forEach(member => { if (!member?.id || !member.name || !member.rank) return; const li=document.createElement('li'); li.dataset.memberId = member.id; const info=document.createElement('div'); info.classList.add('member-info'); const nameS=document.createElement('span'); nameS.textContent = member.name; info.appendChild(nameS); const rankS=document.createElement('select'); rankS.classList.add('rank-select-inline'); rankS.dataset.memberId = member.id; RANKS.forEach(r => { const o=document.createElement('option'); o.value=r; o.textContent=r; if(member.rank===r) o.selected=true; rankS.appendChild(o); }); rankS.addEventListener('change', handleRankChange); info.appendChild(rankS); const acts=document.createElement('div'); acts.classList.add('member-actions'); const remB=document.createElement('button'); remB.textContent='Remove'; remB.classList.add('btn-remove'); remB.onclick=()=>removeMember(member.id); acts.appendChild(remB); li.appendChild(info); li.appendChild(acts); memberListEl.appendChild(li); }); }
function renderCurrentDay() { if (!state.rotationState?.currentDate) return; const currentDateStr = state.rotationState.currentDate; const currentDate = new Date(currentDateStr + 'T00:00:00Z'); if (isNaN(currentDate)) { currentDateEl.textContent = "Invalid Date!"; return; } const dayOfWeek = getDayOfWeek(currentDate); const safeSelectedMvps = state.rotationState.selectedMvps || {}; const safeSkippedVips = state.rotationState.skippedVips || []; const safeSubstitutes = state.rotationState.completedSubstituteVipsThisRound || []; const { conductor: calculatedConductor, vip } = calculateDailyAssignments(currentDateStr, state.rotationState.r4r5Index ?? 0, state.rotationState.memberIndex ?? 0, safeSkippedVips, safeSelectedMvps, safeSubstitutes); if (!calculatedConductor || !vip || calculatedConductor.id?.startsWith('ERR')) return; currentDateEl.textContent = formatDate(currentDate); currentDayOfWeekEl.textContent = currentDate.toLocaleDateString('en-US', { weekday: 'long' }); let finalConductor = calculatedConductor; let isMvpSelectionNeeded = false; const mvpKey = dayOfWeek === MVP_TECH_DAY ? `${currentDateStr}_Mon` : `${currentDateStr}_Sun`; if (dayOfWeek === MVP_TECH_DAY || dayOfWeek === MVP_VS_DAY) { const selectedMvpId = safeSelectedMvps[mvpKey]; if (selectedMvpId) { const storedMvp = getMemberById(selectedMvpId); if (storedMvp) { finalConductor = storedMvp; currentConductorEl.textContent = `${finalConductor.name} (${finalConductor.rank})`; mvpSelectionArea.style.display = 'none'; isMvpSelectionNeeded = false; } else { currentConductorEl.textContent = `Stored MVP (ID: ${selectedMvpId}) not found!`; mvpSelectionArea.style.display = 'none'; isMvpSelectionNeeded = false; } } else { currentConductorEl.innerHTML = `<span class="mvp-selection-required">${calculatedConductor.name}</span>`; populateMvpSelect(); mvpSelectionArea.style.display = 'block'; mvpSelect.value = ""; isMvpSelectionNeeded = true; } } else { currentConductorEl.textContent = `${finalConductor.name} (${finalConductor.rank})`; mvpSelectionArea.style.display = 'none'; isMvpSelectionNeeded = false; } const vipName = vip.name || "Unknown"; const vipRank = vip.rank || "N/A"; let isVipActionPossible = false; if (vip.id === 'NO_MEMBERS' || vip.id.startsWith('ERR') || vip.id === 'NO_VALID_MEMBER') { currentVipEl.textContent = vipName; document.getElementById('vip-actions').style.display = 'none'; } else { currentVipEl.textContent = `${vipName} (${vipRank})`; document.getElementById('vip-actions').style.display = 'block'; isVipActionPossible = true; } alternativeVipArea.style.display = 'none'; vipAcceptedBtn.disabled = !isVipActionPossible || isMvpSelectionNeeded; vipSkippedBtn.disabled = !isVipActionPossible || isMvpSelectionNeeded; undoAdvanceBtn.disabled = !state.previousRotationState; }
function populateMvpSelect() { mvpSelect.innerHTML = '<option value="">-- Select MVP --</option>'; if (!Array.isArray(state.members)) return; state.members.forEach(m => { if (!m?.id) return; const o=document.createElement('option'); o.value=m.id; o.textContent=`${m.name} (${m.rank})`; mvpSelect.appendChild(o); }); }
function renderSkippedVips() { skippedVipsListEl.innerHTML = ''; const container = document.getElementById('skipped-vips'); if (!state.rotationState?.skippedVips) { container.querySelector('p').textContent = 'Error loading list.'; return; } const valid = state.rotationState.skippedVips.filter(id => getMemberById(id)); if (valid.length === 0) { container.querySelector('p').textContent = 'Queue is empty.'; return; } container.querySelector('p').textContent = ''; valid.forEach(id => { const m = getMemberById(id); if(m){const li = document.createElement('li'); li.textContent = `${m.name} (${m.rank})`; skippedVipsListEl.appendChild(li);} }); }
function renderSchedule() { // Cleaned up logs
     scheduleDisplayListEl.innerHTML = ''; if (!state.rotationState?.currentDate || !state.members) { scheduleDisplayListEl.innerHTML = '<li>Not ready</li>'; return; } const members = getMembersByRank('Member'); if (members.length === 0) { scheduleDisplayListEl.innerHTML = '<li>No Members</li>'; return; } const skipped = (state.rotationState.skippedVips || []).filter(id => getMemberById(id));
     const substitutes = state.rotationState.completedSubstituteVipsThisRound || [];
     const len = Math.max(7, members.length + skipped.length); let date = new Date(state.rotationState.currentDate + 'T00:00:00Z'); let r4r5Idx = state.rotationState.r4r5Index ?? 0; let memIdx = state.rotationState.memberIndex ?? 0; let tempSkipped = [...skipped]; let tempMvps = JSON.parse(JSON.stringify(state.rotationState.selectedMvps || {}));

     for (let i = 0; i < len; i++) {
          if (isNaN(date)) { console.error("Invalid date in schedule render loop"); break; } const dateStr = getISODateString(date); const day = getDayOfWeek(date);
          const { conductor, vip, effectiveMemberIndex } = calculateDailyAssignments(dateStr, r4r5Idx, memIdx, tempSkipped, tempMvps, substitutes);

          // Rendering
          if (conductor.id?.startsWith('ERR') || vip.id?.startsWith('ERR') || vip.id === 'NO_VALID_MEMBER') { /* Skip render */ }
          else { const li = document.createElement('li'); li.classList.add(i === 0 ? 'current-day' : null); const dS = document.createElement('span'); dS.classList.add('schedule-date'); dS.textContent = formatDate(date); const cS = document.createElement('span'); cS.classList.add('schedule-conductor'); const cN = conductor.name || "?"; const cR = conductor.rank || "N/A"; if (conductor.id === 'MVP_MON_SELECT' || conductor.id === 'MVP_SUN_SELECT') { const k = day === MVP_TECH_DAY ? `${dateStr}_Mon` : `${dateStr}_Sun`; if (tempMvps[k]) { const mvp = getMemberById(tempMvps[k]); cS.textContent = `C: ${mvp?.name || '?'} (MVP)`; } else { cS.innerHTML = `<span class="mvp-selection-required">${cN}</span>`; } } else { cS.textContent = `C: ${cN} (${cR})`; } const vS = document.createElement('span'); vS.classList.add('schedule-vip'); const vN = vip.name || "?"; const vR = vip.rank || "N/A"; if (vip.id === 'NO_MEMBERS' || vip.id.startsWith('ERR') || vip.id === 'NO_VALID_MEMBER') { vS.textContent = vN; } else { vS.textContent = `VIP: ${vN} (${vR})`; if (tempSkipped.length > 0 && tempSkipped[0] === vip.id) vS.textContent += ' (Skipped)'; } li.appendChild(dS); li.appendChild(cS); li.appendChild(vS); scheduleDisplayListEl.appendChild(li); }

          // Simulation Step
          let vipProcessed = false;
          if (vip?.id && !vip.id.startsWith('NO_') && !vip.id.startsWith('ERROR_') && vip.id !== 'NO_VALID_MEMBER') {
              vipProcessed = true;
              const wasVipFromSkippedList = tempSkipped.length > 0 && tempSkipped[0] === vip.id;
              if (wasVipFromSkippedList) { tempSkipped.shift(); }
          }
          if (vipProcessed) { memIdx = effectiveMemberIndex + 1; }
          else { memIdx = effectiveMemberIndex; }
          if (day >= 2 && day <= 6) { r4r5Idx++; }
          date = addDays(date, 1);
     }
}

function renderStatistics() { mvpStatsListEl.innerHTML = ''; vipStatsListEl.innerHTML = ''; if (!state.members?.length) { mvpStatsListEl.innerHTML = '<li>No members</li>'; vipStatsListEl.innerHTML = '<li>No members</li>'; return; } const mvpC = state.rotationState.mvpCounts || {}; const vipC = state.rotationState.vipCounts || {}; const sorted = [...state.members].sort((a, b) => (a?.name || "").localeCompare(b?.name || "")); let hasMvp = false; sorted.forEach(m => { if (!m?.id || !m.name) return; const c = mvpC[m.id] || 0; if (c > 0) hasMvp = true; const li = document.createElement('li'); li.textContent = m.name; const s = document.createElement('span'); s.classList.add('stats-count'); s.textContent = c; li.appendChild(s); mvpStatsListEl.appendChild(li); }); if (!hasMvp && sorted.length > 0) mvpStatsListEl.innerHTML = '<li>No MVPs yet.</li>'; let hasVip = false; sorted.forEach(m => { if (!m?.id || !m.name) return; const c = vipC[m.id] || 0; if (c > 0) hasVip = true; const li = document.createElement('li'); li.textContent = m.name; const s = document.createElement('span'); s.classList.add('stats-count'); s.textContent = c; li.appendChild(s); vipStatsListEl.appendChild(li); }); if (!hasVip && sorted.length > 0) vipStatsListEl.innerHTML = '<li>No VIPs yet.</li>'; if (sorted.length === 0) { mvpStatsListEl.innerHTML = '<li>No members</li>'; vipStatsListEl.innerHTML = '<li>No members</li>'; } }
function renderLastCompletedDay() {
    lastCompletedDateEl.textContent = "---"; lastCompletedConductorEl.textContent = "---"; lastCompletedVipEl.textContent = "---";
    if (!state.rotationState?.currentDate || !state.previousRotationState?.currentDate) return;
    const lastDateStr = state.previousRotationState.currentDate; const lastDate = new Date(lastDateStr + 'T00:00:00Z'); if (isNaN(lastDate)) return;
    const lastDayOfWeek = getDayOfWeek(lastDate); const lastR4R5Index = state.previousRotationState.r4r5Index ?? 0; const lastMemberIndex = state.previousRotationState.memberIndex ?? 0; const lastSkippedVips = state.previousRotationState.skippedVips || [];
    const currentSelectedMvps = state.rotationState.selectedMvps || {};
    const currentAlternativeVips = state.rotationState.alternativeVips || {};
    lastCompletedDateEl.textContent = formatDate(lastDate); let conductorName = "---";
    if (lastDayOfWeek === MVP_TECH_DAY || lastDayOfWeek === MVP_VS_DAY) {
        const mvpKey = lastDayOfWeek === MVP_TECH_DAY ? `${lastDateStr}_Mon` : `${lastDateStr}_Sun`;
        const selectedMvpId = currentSelectedMvps[mvpKey];
        if (selectedMvpId) { const mvp = getMemberById(selectedMvpId); conductorName = mvp ? `${mvp.name} (MVP)` : `Selected MVP (ID: ${selectedMvpId})`; }
        else { conductorName = "(MVP selection missing?)"; }
    } else { const r4r5 = getMembersByRank('R4/R5'); if (r4r5.length > 0) { const c = r4r5[lastR4R5Index % r4r5.length]; conductorName = c ? `${c.name} (${c.rank})` : "Error R4/R5"; } else { conductorName = "No R4/R5"; } }
    lastCompletedConductorEl.textContent = conductorName;
    const alternativeVipId = currentAlternativeVips[lastDateStr];
    if (alternativeVipId) { const altVip = getMemberById(alternativeVipId); lastCompletedVipEl.textContent = altVip ? `${altVip.name} (${altVip.rank}) (Substitute)` : `Unknown Substitute (ID: ${alternativeVipId})`; }
    else { const { vip: proposedVip } = calculateDailyAssignments(lastDateStr, lastR4R5Index, lastMemberIndex, lastSkippedVips, {}); if (proposedVip?.id && !proposedVip.id.startsWith('NO_') && !proposedVip.id.startsWith('ERROR_')) { const currentSkipped = state.rotationState.skippedVips || []; const wasJustSkipped = currentSkipped.includes(proposedVip.id) && !lastSkippedVips.includes(proposedVip.id); lastCompletedVipEl.textContent = `${proposedVip.name} (${proposedVip.rank}) ${wasJustSkipped ? '(Skipped)' : '(Accepted)'}`; } else { lastCompletedVipEl.textContent = proposedVip?.name || "---"; } }
}
function render() { /* Removed theme logic & debug logs */ renderMemberList(); renderSkippedVips(); renderCurrentDay(); renderSchedule(); renderStatistics(); renderLastCompletedDay(); undoAdvanceBtn.disabled = !state.previousRotationState; if (versionEl) { versionEl.textContent = SCRIPT_VERSION; } }

// --- New/Updated Functions ---
function handleMvpDropdownChange() { if (mvpSelectionArea.style.display === 'block') { const selVal = mvpSelect.value; const enable = selVal !== ""; const vipEl = document.getElementById('current-vip'); const vipTxt = vipEl ? vipEl.textContent : ""; const vipOK = !(vipTxt.includes("No Members") || vipTxt.includes("Error") || vipTxt.includes("No valid Member")); vipAcceptedBtn.disabled = !enable || !vipOK; vipSkippedBtn.disabled = !enable || !vipOK; } else { vipAcceptedBtn.disabled = true; vipSkippedBtn.disabled = true; } }
function populateAlternativeVipSelect() { alternativeVipSelect.innerHTML = '<option value="">-- No Alternative VIP --</option>'; const members = getMembersByRank('Member'); const substitutes = state.rotationState.completedSubstituteVipsThisRound || []; members.forEach(m => { if (!m?.id || substitutes.includes(m.id)) return; const o = document.createElement('option'); o.value = m.id; o.textContent = `${m.name} (${m.rank})`; alternativeVipSelect.appendChild(o); }); }
async function handleConfirmAlternativeVip() { // Counts alt VIP
     const alternativeVipId = alternativeVipSelect.value; const originallySkippedVipId = alternativeVipArea.dataset.originalVipId; const selectedMvpIdForToday = alternativeVipArea.dataset.selectedMvpId;
     if (!originallySkippedVipId) { console.error("Original skipped VIP ID missing!"); return; }
     confirmAlternativeVipBtn.disabled = true; alternativeVipSelect.disabled = true; undoAdvanceBtn.disabled = true;
     const currentDateStr = state.rotationState.currentDate; const currentDate = new Date(currentDateStr + 'T00:00:00Z'); const currentDayOfWeek = getDayOfWeek(currentDate); const currentR4R5Index = state.rotationState.r4r5Index ?? 0; const currentMemberIndex = state.rotationState.memberIndex ?? 0; const currentSkippedVips = [...(state.rotationState.skippedVips || [])].filter(id => getMemberById(id));
     const currentSelectedMvps = { ...(state.rotationState.selectedMvps || {}) }; const currentVipCounts = { ...(state.rotationState.vipCounts || {}) }; const currentMvpCounts = { ...(state.rotationState.mvpCounts || {}) };
     const currentAlternativeVips = { ...(state.rotationState.alternativeVips || {})};
     const currentSubstituteList = [...(state.rotationState.completedSubstituteVipsThisRound || [])];

     if (!currentSkippedVips.includes(originallySkippedVipId)) { currentSkippedVips.unshift(originallySkippedVipId); }
     if (selectedMvpIdForToday) { const member = getMemberById(selectedMvpIdForToday); if (member) { currentMvpCounts[selectedMvpIdForToday] = (currentMvpCounts[selectedMvpIdForToday] || 0) + 1; const mvpKey = currentDayOfWeek === MVP_TECH_DAY ? `${currentDateStr}_Mon` : `${currentDateStr}_Sun`; currentSelectedMvps[mvpKey] = selectedMvpIdForToday; } else { console.warn(`ConfirmAltVIP: MVP ID ${selectedMvpIdForToday} not found`); } }
     if (alternativeVipId) { const altVipMember = getMemberById(alternativeVipId); if (altVipMember) { currentVipCounts[alternativeVipId] = (currentVipCounts[alternativeVipId] || 0) + 1; currentAlternativeVips[currentDateStr] = alternativeVipId; if (!currentSubstituteList.includes(alternativeVipId)) { currentSubstituteList.push(alternativeVipId); } } else { console.warn(`ConfirmAltVIP: Alternative VIP ID ${alternativeVipId} not found`); } }

     const memberMembers = getMembersByRank('Member'); let finalSubstituteList = currentSubstituteList;
     const { effectiveMemberIndex: hypotheticalNextIndexStart } = calculateDailyAssignments(currentDateStr, currentR4R5Index, currentMemberIndex, [], {}, []);
     if (memberMembers.length > 0 && ((hypotheticalNextIndexStart + 1) % memberMembers.length === 0) && hypotheticalNextIndexStart >= 0 ) { console.log(`HANDLE CONFIRM ALT VIP: Round End detected! Clearing Substitute List.`); finalSubstituteList = []; }

     let nextR4R5Index = currentR4R5Index; if (currentDayOfWeek >= 2 && currentDayOfWeek <= 6) { nextR4R5Index = (currentR4R5Index + 1); } const nextDate = addDays(currentDate, 1); const nextDateStr = getISODateString(nextDate);
     try { state.previousRotationState = JSON.parse(JSON.stringify(state.rotationState)); } catch (e) { console.error("Undo store error:", e); state.previousRotationState = null; }
     state.rotationState.currentDate = nextDateStr; state.rotationState.r4r5Index = nextR4R5Index; state.rotationState.memberIndex = currentMemberIndex; state.rotationState.skippedVips = currentSkippedVips; state.rotationState.selectedMvps = currentSelectedMvps; state.rotationState.vipCounts = currentVipCounts; state.rotationState.mvpCounts = currentMvpCounts;
     state.rotationState.alternativeVips = currentAlternativeVips; state.rotationState.completedSubstituteVipsThisRound = finalSubstituteList;
     try { await updateFirestoreState(); alternativeVipArea.style.display = 'none'; } catch (error) { console.error("Save fail after alt VIP:", error); alert("Error saving. Check console."); confirmAlternativeVipBtn.disabled = false; alternativeVipSelect.disabled = false; }
}

// --- Event Listeners ---
addMemberForm.addEventListener('submit', addMember);
vipAcceptedBtn.addEventListener('click', () => handleVipAction(true));
vipSkippedBtn.addEventListener('click', () => handleVipAction(false));
mvpSelect.addEventListener('change', handleMvpDropdownChange);
confirmAlternativeVipBtn.addEventListener('click', handleConfirmAlternativeVip);
async function handleVipAction(accepted) {
     if (!state.rotationState?.currentDate) { alert("State not loaded"); return; }
    const currentDateStr = state.rotationState.currentDate; const currentDate = new Date(currentDateStr + 'T00:00:00Z'); const dayOfWeek = getDayOfWeek(currentDate); let selectedMvpId = null;
    if (dayOfWeek === MVP_TECH_DAY || dayOfWeek === MVP_VS_DAY) { const mvpKey = dayOfWeek === MVP_TECH_DAY ? `${currentDateStr}_Mon` : `${currentDateStr}_Sun`; const existingMvp = state.rotationState.selectedMvps?.[mvpKey]; if (!existingMvp) { selectedMvpId = mvpSelect.value; if (!selectedMvpId) { alert("Select MVP"); return; } } else { selectedMvpId = existingMvp; } }
    vipAcceptedBtn.disabled = true; vipSkippedBtn.disabled = true; undoAdvanceBtn.disabled = true; alternativeVipArea.style.display = 'none';
    if (accepted) { // ACCEPT PATH
        try { state.previousRotationState = JSON.parse(JSON.stringify(state.rotationState)); } catch (e) { console.error("Undo store error:", e); state.previousRotationState = null; }
        const success = advanceRotation(true, selectedMvpId);
        if (success) { try { await updateFirestoreState(); undoAdvanceBtn.disabled = !state.previousRotationState; } catch (error) { console.error("handleVipAction(Accept): Save FAIL:", error); alert("Error saving. Check console!"); renderCurrentDay(); } } else { renderCurrentDay(); }
    } else { // SKIP PATH
        const { vip: proposedVip } = calculateDailyAssignments( currentDateStr, state.rotationState.r4r5Index ?? 0, state.rotationState.memberIndex ?? 0, state.rotationState.skippedVips || [], state.rotationState.selectedMvps || {}, state.rotationState.completedSubstituteVipsThisRound || [] ); if (!proposedVip?.id || proposedVip.id.startsWith('NO_') || proposedVip.id.startsWith('ERROR_')) { alert("Cannot process skip: No valid VIP was proposed."); renderCurrentDay(); return; }
        alternativeVipArea.dataset.originalVipId = proposedVip.id; alternativeVipArea.dataset.selectedMvpId = selectedMvpId || ""; originalSkippedVipNameEl.textContent = proposedVip.name || "The proposed VIP";
        populateAlternativeVipSelect(); alternativeVipArea.style.display = 'block'; confirmAlternativeVipBtn.disabled = false; alternativeVipSelect.disabled = false;
    }
}
undoAdvanceBtn.addEventListener('click', async () => { if (!state.previousRotationState) { alert("No undo state."); return; } if (confirm("Undo last advancement?")) { undoAdvanceBtn.disabled = true; try { if (typeof state.previousRotationState !== 'object' || state.previousRotationState === null) { throw new Error("Invalid undo data."); } state.rotationState = JSON.parse(JSON.stringify(state.previousRotationState)); state.previousRotationState = null; await updateFirestoreState(); } catch (error) { console.error("Undo error:", error); alert("Undo error: " + error.message); } } });
// Theme Toggle Listener Removed
resetBtn.addEventListener('click', async () => {
    if (confirm("!! WARNING !! Reset ALL data? This cannot be undone!")) {
        console.warn("Resetting data!"); resetBtn.disabled = true;
        const resetDateStr = "2025-04-21"; // Fixed start date
        console.log("Resetting state to start date:", resetDateStr);

        state.members = initialMembers.map(m => ({...m, id: m.id || generateId()})); // Use updated list
        state.rotationState = { currentDate: resetDateStr, r4r5Index: 0, memberIndex: 0, skippedVips: [], selectedMvps: {}, vipCounts: {}, mvpCounts: {}, alternativeVips: {}, completedSubstituteVipsThisRound: [] };
        state.previousRotationState = null;
        try { await updateFirestoreState(); alert(`Data has been reset to defaults, starting from ${formatDate(new Date(resetDateStr + 'T00:00:00Z'))}.`); }
        catch (error) { console.error("Reset error:", error); alert("Error resetting data."); resetBtn.disabled = false; }
    }
});

// --- Initialization and Realtime Updates ---
stateDocRef.onSnapshot((doc) => {
    console.log("FS data received/updated."); let needsInitialSetup=false; let needsDateUpdate=false;
    const fixedStartDate = "2025-04-21";

    if(doc.exists){
        const data=doc.data(); const localPrev=state.previousRotationState; const loadedMembers=(data.members||[]).map(m=>({...m, id: m.id||generateId()})); const loadedRotState=data.rotationState||{};
        state={ members:loadedMembers, rotationState:{
            currentDate:loadedRotState.currentDate||null, r4r5Index:loadedRotState.r4r5Index??0, memberIndex:loadedRotState.memberIndex??0, skippedVips:loadedRotState.skippedVips||[], selectedMvps:loadedRotState.selectedMvps||{}, vipCounts:loadedRotState.vipCounts||{}, mvpCounts:loadedRotState.mvpCounts||{},
            alternativeVips: loadedRotState.alternativeVips || {},
            completedSubstituteVipsThisRound: loadedRotState.completedSubstituteVipsThisRound || []
        }, previousRotationState:localPrev };
        if(!state.rotationState.currentDate||isNaN(new Date(state.rotationState.currentDate+'T00:00:00Z'))){
             console.warn("Loaded state missing or has invalid currentDate. Setting to fixed start date.");
             needsDateUpdate=true;
        }
    } else { console.log("No FS doc. Initial setup..."); needsInitialSetup=true; }

    if(needsInitialSetup||needsDateUpdate){
        const startDate = fixedStartDate;
        console.log(`Setup/Update: Initial=${needsInitialSetup}, DateUpdate=${needsDateUpdate}. Setting start date to: ${startDate}`);

        if(needsInitialSetup){
             // Use the provided initialMembers list and ensure IDs are generated/kept
             state={ members:initialMembers.map(m=>({...m, id: m.id || generateId()})), rotationState:{currentDate:startDate, r4r5Index:0, memberIndex:0, skippedVips:[], selectedMvps:{}, vipCounts:{}, mvpCounts:{}, alternativeVips:{}, completedSubstituteVipsThisRound:[]}, previousRotationState:null };
             updateFirestoreState().catch(err=>console.error("Initial save FAIL:", err));
        } else if(needsDateUpdate){
            state.rotationState.currentDate=startDate;
            if (!state.rotationState.alternativeVips) { state.rotationState.alternativeVips = {}; }
            if (!state.rotationState.completedSubstituteVipsThisRound) { state.rotationState.completedSubstituteVipsThisRound = []; }
            updateFirestoreState().catch(err=>console.error("Date update save FAIL:", err));
        }
    }
    render(); resetBtn.disabled=false;
}, (error) => { console.error("FS Listener ERROR:", error); alert(`FATAL DB ERROR (${error.message}). Check connection, config, rules, console.`); document.getElementById('vip-actions').style.display='none'; /* ... disable more UI on error ... */ });
// --- Initial Theme Render Removed ---
