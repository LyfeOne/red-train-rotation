const SCRIPT_VERSION = "3.7"; // Set to next version on change

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
const initialMembers = [ /* --- Member list --- */
    { name: "LadyLaik", rank: "R5"}, { name: "Enyaisrave", rank: "R4"}, { name: "Johcar", rank: "R4"}, { name: "DaVinnie", rank: "R4"}, { name: "CornFlakes", rank: "R4"}, { name: "Lyfe", rank: "R4"}, { name: "Motherfrogger", rank: "R4"}, { name: "Pabs64", rank: "R4"}, { name: "Supersebb", rank: "R4"}, { name: "Munky", rank: "R4"}, { name: "NymbleV", rank: "R4"}, { name: "R1/R2/R3 Team", rank: "Member"}, { name: "Smugwell", rank: "Member"}, { name: "MRAN", rank: "Member"}, { name: "Chris", rank: "Member"}, { name: "Leka98", rank: "Member"}, { name: "Darkknight", rank: "Member"}, { name: "Rikkyyyyy", rank: "Member"}, { name: "Gekkegerrittttt", rank: "Member"}, { name: "Ever4", rank: "Member"}, { name: "KFCPov3r", rank: "Member"}, { name: "F L A C", rank: "Member"}, { name: "Jotersan", rank: "Member"}, { name: "Novis01", rank: "Member"}, { name: "Gorkiules", rank: "Member"}, { name: "Jaista", rank: "Member"}, { name: "Megalomanie", rank: "Member"}, { name: "АЛЕКС1980", rank: "Member"}, { name: "TheFloh", rank: "Member"}, { name: "Caretta", rank: "Member"}, { name: "Swisskilla", rank: "Member"}, { name: "Llama deDrama", rank: "Member"}, { name: "oo APACHE oo", rank: "Member"}, { name: "GoFireES", rank: "Member"}, { name: "Foggis", rank: "Member"}, { name: "Paracitus", rank: "Member"}, { name: "IRONHAMMER", rank: "Member"}, { name: "jarako", rank: "Member"}, { name: "Be a wolf", rank: "Member"}, { name: "Commander Blad", rank: "Member"}, { name: "ILYES B", rank: "Member"}, { name: "KingStridez", rank: "Member"}, { name: "diRty freNk", rank: "Member"}, { name: "PavlosP", rank: "Member"}, { name: "Chasseur 777", rank: "Member"}, { name: "Raph911", rank: "Member"}, { name: "B1wizz", rank: "Member"}, { name: "Thirteen Squid", rank: "Member"}, { name: "ЖЭКА", rank: "Member"}, { name: "SkyWinder", rank: "Member"}, { name: "FireXice (Bibot)", rank: "Member"}, { name: "GhósT", rank: "Member"}, { name: "Juantxo79", rank: "Member"}, { name: "Kezual", rank: "Member"}, { name: "Maytos", rank: "Member"}, { name: "jassådu", rank: "Member"}, { name: "Temd", rank: "Member"}, { name: "olabaf", rank: "Member"}, { name: "Faluche", rank: "Member"}, { name: "xPerseus", rank: "Member"}, { name: "Lutonian", rank: "Member"}, { name: "Juggernaut x", rank: "Member"}, { name: "Umbra XIII", rank: "Member"}, { name: "BLÀDE", rank: "Member"}, { name: "koppies", rank: "Member"}, { name: "Cocsi29400", rank: "Member"}, { name: "Nohardfeelz", rank: "Member"}, { name: "Vechniy", rank: "Member"}, { name: "theFoxXx", rank: "Member"}, { name: "S A M U R A i", rank: "Member"}, { name: "Dfyra", rank: "Member"}, { name: "Meloziaa", rank: "Member"}, { name: "Aminos77", rank: "Member"}, { name: "Rev T", rank: "Member"}, { name: "BlackWizardUA", rank: "Member"}, { name: "Bekim1", rank: "Member"}, { name: "Edx777", rank: "Member"}, { name: "Laeta", rank: "Member"}, { name: "Kyuchie", rank: "Member"}, { name: "depechefann", rank: "Member"}, { name: "BlackPush", rank: "Member"}, { name: "Gunnovic", rank: "Member"}, { name: "NinoDelBono", rank: "Member"}, { name: "Dario217", rank: "Member"}
].map(m => ({ ...m, id: generateId() }));

// --- DOM Elements ---
const memberListEl = document.getElementById('member-list'); const addMemberForm = document.getElementById('add-member-form'); const newMemberNameInput = document.getElementById('new-member-name'); const newMemberRankSelect = document.getElementById('new-member-rank'); const memberCountEl = document.getElementById('member-count'); const currentDateEl = document.getElementById('current-date'); const currentDayOfWeekEl = document.getElementById('current-day-of-week'); const currentConductorEl = document.getElementById('current-conductor'); const currentVipEl = document.getElementById('current-vip'); const skippedVipsListEl = document.getElementById('skipped-vips').querySelector('ul'); const scheduleDisplayListEl = document.getElementById('schedule-display').querySelector('ul'); const vipAcceptedBtn = document.getElementById('vip-accepted'); const vipSkippedBtn = document.getElementById('vip-skipped'); const undoAdvanceBtn = document.getElementById('undo-advance'); const mvpSelectionArea = document.getElementById('mvp-selection-area'); const mvpSelect = document.getElementById('mvp-select');
// const themeToggleBtn = document.getElementById('theme-toggle'); // Removed
const resetBtn = document.getElementById('reset-data'); const mvpStatsListEl = document.getElementById('mvp-stats').querySelector('ul'); const vipStatsListEl = document.getElementById('vip-stats').querySelector('ul');
const alternativeVipArea = document.getElementById('alternative-vip-area'); const alternativeVipSelect = document.getElementById('alternative-vip-select'); const confirmAlternativeVipBtn = document.getElementById('confirm-alternative-vip'); const originalSkippedVipNameEl = document.getElementById('original-skipped-vip-name');
const lastCompletedDateEl = document.getElementById('last-completed-date'); const lastCompletedConductorEl = document.getElementById('last-completed-conductor'); const lastCompletedVipEl = document.getElementById('last-completed-vip');
const versionEl = document.getElementById('script-version');

// --- Utility Functions ---
function generateId() { return Math.random().toString(36).substring(2, 15); }
function getDayOfWeek(date) { return date.getDay(); }
function formatDate(date) { if (!(date instanceof Date) || isNaN(date)) return "Invalid Date"; return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }); }
function getISODateString(date) { if (!(date instanceof Date) || isNaN(date)) { console.error("Invalid date:", date); return new Date().toISOString().split('T')[0]; } return date.toISOString().split('T')[0]; }
function addDays(date, days) { const result = new Date(date); result.setDate(result.getDate() + days); return result; }
function findNextMonday(date) { const d = getDayOfWeek(date); const diff = (8 - d) % 7; return addDays(date, diff === 0 ? 7 : diff); }
function getMemberById(id) { return state.members?.find(m => m?.id === id); }
function getMembersByRank(rank) { if (!Array.isArray(state.members)) return []; if (rank === 'R4/R5') return state.members.filter(m => m && (m.rank === 'R4' || m.rank === 'R5')); return state.members.filter(m => m && m.rank === rank); }

// --- Core Logic ---
// Gibt jetzt { date, conductor, vip, effectiveMemberIndex } zurück
function calculateDailyAssignments(targetDateStr, currentR4R5Index, currentMemberIndex, currentSkippedVips, selectedMvpsMap, completedSubstitutes = []) {
    if (!targetDateStr || typeof currentR4R5Index !== 'number' || typeof currentMemberIndex !== 'number' || !Array.isArray(currentSkippedVips) || typeof selectedMvpsMap !== 'object' || !Array.isArray(completedSubstitutes)) { console.error("Invalid params"); return { date: new Date(), conductor: { id: 'ERR', name: 'Error' }, vip: { id: 'ERR', name: 'Error'}, effectiveMemberIndex: currentMemberIndex }; }
    const targetDate = new Date(targetDateStr + 'T00:00:00Z'); if (isNaN(targetDate)) { console.error("Invalid date"); return { date: new Date(), conductor: { id: 'ERR', name: 'Error' }, vip: { id: 'ERR', name: 'Error'}, effectiveMemberIndex: currentMemberIndex }; }
    const dayOfWeek = getDayOfWeek(targetDate); let conductor = null; let vip = null; const r4r5Members = getMembersByRank('R4/R5'); const memberMembers = getMembersByRank('Member');
    let effectiveMemberIndex = currentMemberIndex; // Startwert

    // --- Conductor Logic (unverändert) ---
    if (dayOfWeek === MVP_TECH_DAY) { const k = `${targetDateStr}_Mon`; const id = selectedMvpsMap[k]; conductor = id ? getMemberById(id) : { id: 'MVP_MON_SELECT', name: 'Tech MVP Needed', rank: 'MVP' }; } else if (dayOfWeek === MVP_VS_DAY) { const k = `${targetDateStr}_Sun`; const id = selectedMvpsMap[k]; conductor = id ? getMemberById(id) : { id: 'MVP_SUN_SELECT', name: 'VS MVP Needed', rank: 'MVP' }; } else { conductor = r4r5Members.length > 0 ? r4r5Members[currentR4R5Index % r4r5Members.length] : { id: 'NO_R4R5', name: 'No R4/R5', rank: 'Sys' }; }

    // --- VIP Logic (angepasst, um effectiveMemberIndex zu setzen) ---
    const validSkippedVips = currentSkippedVips.filter(id => getMemberById(id));
    if (validSkippedVips.length > 0) {
        vip = getMemberById(validSkippedVips[0]);
        console.log(`CalcAssign: Using skipped VIP: ${vip?.name}`);
        // Der *effektive* Index, der in DIESER Runde verwendet wurde, ist der, der übersprungen wurde.
        // Die Simulation erhöht ihn dann für die nächste Runde.
        effectiveMemberIndex = currentMemberIndex;
    } else if (memberMembers.length > 0) {
        let potentialVip = null; let loopCheck = 0; let tempMemberIndex = currentMemberIndex;
        while (!potentialVip && loopCheck < memberMembers.length) {
            const vipIndex = tempMemberIndex % memberMembers.length; const candidate = memberMembers[vipIndex];
            if (candidate && !completedSubstitutes.includes(candidate.id)) {
                potentialVip = candidate;
                effectiveMemberIndex = tempMemberIndex; // Speichere den Index des tatsächlich ausgewählten VIPs
                console.log(`CalcAssign: Using effectiveMemberIndex ${vipIndex}: ${potentialVip?.name} (Not sub)`);
            } else { console.log(`CalcAssign: Skipping index ${vipIndex} (${candidate?.name}) - was sub or invalid.`); tempMemberIndex++; loopCheck++; }
        }
        if (potentialVip) { vip = potentialVip; } else { console.warn("CalcAssign: All remaining members were subs or invalid."); vip = { id: 'NO_VALID_MEMBER', name: 'No valid Member left', rank: 'Sys' }; effectiveMemberIndex = currentMemberIndex; /* Behalte alten Index bei Fehler */ }
    } else { vip = { id: 'NO_MEMBERS', name: 'No Members Available', rank: 'Sys' }; effectiveMemberIndex = currentMemberIndex; /* Behalte alten Index */}

    conductor = conductor || { id: 'ERR_C', name: 'Err C', rank: 'Sys' }; vip = vip || { id: 'ERR_V', name: 'Err V', rank: 'Sys' };
    // Rückgabeobjekt erweitert
    return { date: targetDate, conductor, vip, effectiveMemberIndex };
}

function advanceRotation(vipAccepted, selectedMvpId = null) { // Handles ACCEPT path ONLY
     console.log(`ADVANCE ROTATION (ACCEPT PATH): mvpId=${selectedMvpId}`); if (!state.rotationState?.currentDate) { console.error("State missing"); return false; }
     const currentDateStr = state.rotationState.currentDate; const currentDate = new Date(currentDateStr + 'T00:00:00Z'); const currentDayOfWeek = getDayOfWeek(currentDate);
     const currentR4R5Index = state.rotationState.r4r5Index ?? 0; const currentMemberIndex = state.rotationState.memberIndex ?? 0; const currentSkippedVips = [...(state.rotationState.skippedVips || [])]; const currentVipCounts = { ...(state.rotationState.vipCounts || {}) }; const currentMvpCounts = { ...(state.rotationState.mvpCounts || {}) }; const currentSelectedMvps = { ...(state.rotationState.selectedMvps || {}) };
     const currentAlternativeVips = { ...(state.rotationState.alternativeVips || {}) };
     const currentSubstituteList = [...(state.rotationState.completedSubstituteVipsThisRound || [])];

     const { vip: proposedVip, effectiveMemberIndex } = calculateDailyAssignments(currentDateStr, currentR4R5Index, currentMemberIndex, currentSkippedVips, currentSelectedMvps, currentSubstituteList); // Get effective index
     if (!proposedVip?.id || proposedVip.id.startsWith('NO_') || proposedVip.id.startsWith('ERROR_')) { console.warn("No valid VIP"); alert("No valid VIP proposed."); return false; }
     const proposedVipId = proposedVip.id; let nextR4R5Index = currentR4R5Index; let nextMemberIndex = currentMemberIndex; let nextSkippedVips = currentSkippedVips.filter(id => getMemberById(id)); const wasVipFromSkippedList = nextSkippedVips.length > 0 && nextSkippedVips[0] === proposedVipId;
     if (!vipAccepted) { console.error("advanceRotation called incorrectly for skip path."); return false; }

     // Set next member index based on the *effective* index used this turn + 1
     nextMemberIndex = effectiveMemberIndex + 1;
     console.log(`AdvanceRotation: Setting next member index based on effective index ${effectiveMemberIndex} -> ${nextMemberIndex}`);

     if (wasVipFromSkippedList) { nextSkippedVips.shift(); }
     // Don't need the 'else' for nextMemberIndex increment anymore, handled above based on effective index

     currentVipCounts[proposedVipId] = (currentVipCounts[proposedVipId] || 0) + 1; console.log(`VIP Count Inc: ${proposedVip.name} -> ${currentVipCounts[proposedVipId]}`);

     const memberMembers = getMembersByRank('Member');
     let finalSubstituteList = currentSubstituteList;
     // Check if the *next* member index wraps around
     if (memberMembers.length > 0 && (nextMemberIndex % memberMembers.length === 0) && nextMemberIndex > 0) {
         console.log("ADVANCE ROTATION: Round End detected! Clearing Substitute List.");
         finalSubstituteList = [];
     }

     if (currentDayOfWeek >= 2 && currentDayOfWeek <= 6) { nextR4R5Index = (currentR4R5Index + 1); } if (selectedMvpId) { const member = getMemberById(selectedMvpId); if (member) { const mvpKey = currentDayOfWeek === MVP_TECH_DAY ? `${currentDateStr}_Mon` : `${currentDateStr}_Sun`; currentSelectedMvps[mvpKey] = selectedMvpId; currentMvpCounts[selectedMvpId] = (currentMvpCounts[selectedMvpId] || 0) + 1; console.log(`MVP Count Inc: ${member.name} -> ${currentMvpCounts[selectedMvpId]}`); } else { console.warn(`MVP ID ${selectedMvpId} not found`); } }
     const nextDate = addDays(currentDate, 1); const nextDateStr = getISODateString(nextDate);
     state.rotationState.currentDate = nextDateStr; state.rotationState.r4r5Index = nextR4R5Index; state.rotationState.memberIndex = nextMemberIndex; state.rotationState.skippedVips = nextSkippedVips; state.rotationState.selectedMvps = currentSelectedMvps; state.rotationState.vipCounts = currentVipCounts; state.rotationState.mvpCounts = currentMvpCounts;
     state.rotationState.alternativeVips = currentAlternativeVips; state.rotationState.completedSubstituteVipsThisRound = finalSubstituteList;
     console.log("Advance Rotation ACCEPT successful. New state (local):", JSON.parse(JSON.stringify(state.rotationState))); return true;
}
function updateFirestoreState() { // Updated to save new substitute list
    const stateToSave={ members:state.members||[], rotationState:{ currentDate:state.rotationState.currentDate, r4r5Index:state.rotationState.r4r5Index??0, memberIndex:state.rotationState.memberIndex??0, skippedVips:state.rotationState.skippedVips||[], selectedMvps:state.rotationState.selectedMvps||{}, vipCounts:state.rotationState.vipCounts||{}, mvpCounts:state.rotationState.mvpCounts||{}, alternativeVips: state.rotationState.alternativeVips || {}, completedSubstituteVipsThisRound: state.rotationState.completedSubstituteVipsThisRound || [] } };
    console.log("Attempting FS write:", JSON.parse(JSON.stringify(stateToSave))); return stateDocRef.set(stateToSave).then(()=>{console.log("FS write OK");}).catch((e)=>{console.error("FS write FAIL:", e); alert(`Save Error: ${e.message}`); throw e;});
}

// --- Member Management ---
function addMember(event) { event.preventDefault(); const n = newMemberNameInput.value.trim(); const r = newMemberRankSelect.value; if(n&&r){ if(!Array.isArray(state.members)) state.members=[]; if(state.members.some(m=>m?.name.toLowerCase()===n.toLowerCase())){alert(`Exists: ${n}`); return;} const nm={id:generateId(), name:n, rank:r}; state.members.push(nm); sortMembers(); updateFirestoreState(); newMemberNameInput.value='';} else{alert("Name & Rank needed");} }
function removeMember(id) { const m=getMemberById(id); if(!m) return; if(confirm(`Remove ${m.name}?`)){if(!Array.isArray(state.members)) state.members=[]; state.members=state.members.filter(mb=>mb?.id !== id); if(!state.rotationState) state.rotationState={}; if(!Array.isArray(state.rotationState.skippedVips)) state.rotationState.skippedVips=[]; state.rotationState.skippedVips = state.rotationState.skippedVips.filter(sid => sid !== id); if(Array.isArray(state.rotationState.completedSubstituteVipsThisRound)) { state.rotationState.completedSubstituteVipsThisRound = state.rotationState.completedSubstituteVipsThisRound.filter(subId => subId !== id); } updateFirestoreState();} }
function handleRankChange(event) { const sel = event.target; const id = sel.dataset.memberId; const rank = sel.value; const idx = state.members.findIndex(m => m?.id === id); if(idx === -1) { console.error("Not found:", id); return; } const name = state.members[idx].name; if(state.members[idx].rank === rank) return; if(confirm(`Change ${name} rank to ${rank}?`)){ state.members[idx].rank = rank; console.log(`Rank Change: ${name} -> ${rank}`); sortMembers(); updateFirestoreState(); } else { sel.value = state.members[idx].rank; } }
function sortMembers() { if(!Array.isArray(state.members)) return; const order = {'R5':1, 'R4':2, 'Member':3}; state.members.sort((a,b) => { const rA=a?.rank; const rB=b?.rank; const nA=a?.name||""; const nB=b?.name||""; const d=(order[rA]||99)-(order[rB]||99); if(d!==0) return d; return nA.localeCompare(nB); }); }

// --- Rendering Functions ---
function renderMemberList() { memberListEl.innerHTML = ''; if (!Array.isArray(state.members)) { return; } memberCountEl.textContent = state.members.length; sortMembers(); if (state.members.length === 0) { memberListEl.innerHTML = '<li>No members.</li>'; return; } state.members.forEach(member => { if (!member?.id || !member.name || !member.rank) return; const li=document.createElement('li'); li.dataset.memberId = member.id; const info=document.createElement('div'); info.classList.add('member-info'); const nameS=document.createElement('span'); nameS.textContent = member.name; info.appendChild(nameS); const rankS=document.createElement('select'); rankS.classList.add('rank-select-inline'); rankS.dataset.memberId = member.id; RANKS.forEach(r => { const o=document.createElement('option'); o.value=r; o.textContent=r; if(member.rank===r) o.selected=true; rankS.appendChild(o); }); rankS.addEventListener('change', handleRankChange); info.appendChild(rankS); const acts=document.createElement('div'); acts.classList.add('member-actions'); const remB=document.createElement('button'); remB.textContent='Remove'; remB.classList.add('btn-remove'); remB.onclick=()=>removeMember(member.id); acts.appendChild(remB); li.appendChild(info); li.appendChild(acts); memberListEl.appendChild(li); }); }
function renderCurrentDay() { if (!state.rotationState?.currentDate) return; const currentDateStr = state.rotationState.currentDate; const currentDate = new Date(currentDateStr + 'T00:00:00Z'); if (isNaN(currentDate)) { currentDateEl.textContent = "Invalid Date!"; return; } const dayOfWeek = getDayOfWeek(currentDate); const safeSelectedMvps = state.rotationState.selectedMvps || {}; const safeSkippedVips = state.rotationState.skippedVips || []; const safeSubstitutes = state.rotationState.completedSubstituteVipsThisRound || []; const { conductor: calculatedConductor, vip } = calculateDailyAssignments(currentDateStr, state.rotationState.r4r5Index ?? 0, state.rotationState.memberIndex ?? 0, safeSkippedVips, safeSelectedMvps, safeSubstitutes); if (!calculatedConductor || !vip || calculatedConductor.id?.startsWith('ERR')) return; currentDateEl.textContent = formatDate(currentDate); currentDayOfWeekEl.textContent = currentDate.toLocaleDateString('en-US', { weekday: 'long' }); let finalConductor = calculatedConductor; let isMvpSelectionNeeded = false; const mvpKey = dayOfWeek === MVP_TECH_DAY ? `${currentDateStr}_Mon` : `${currentDateStr}_Sun`; if (dayOfWeek === MVP_TECH_DAY || dayOfWeek === MVP_VS_DAY) { const selectedMvpId = safeSelectedMvps[mvpKey]; if (selectedMvpId) { const storedMvp = getMemberById(selectedMvpId); if (storedMvp) { finalConductor = storedMvp; currentConductorEl.textContent = `${finalConductor.name} (${finalConductor.rank})`; mvpSelectionArea.style.display = 'none'; isMvpSelectionNeeded = false; } else { currentConductorEl.textContent = `Stored MVP (ID: ${selectedMvpId}) not found!`; mvpSelectionArea.style.display = 'none'; isMvpSelectionNeeded = false; } } else { currentConductorEl.innerHTML = `<span class="mvp-selection-required">${calculatedConductor.name}</span>`; populateMvpSelect(); mvpSelectionArea.style.display = 'block'; mvpSelect.value = ""; isMvpSelectionNeeded = true; } } else { currentConductorEl.textContent = `${finalConductor.name} (${finalConductor.rank})`; mvpSelectionArea.style.display = 'none'; isMvpSelectionNeeded = false; } const vipName = vip.name || "Unknown"; const vipRank = vip.rank || "N/A"; let isVipActionPossible = false; if (vip.id === 'NO_MEMBERS' || vip.id.startsWith('ERR') || vip.id === 'NO_VALID_MEMBER') { currentVipEl.textContent = vipName; document.getElementById('vip-actions').style.display = 'none'; } else { currentVipEl.textContent = `${vipName} (${vipRank})`; document.getElementById('vip-actions').style.display = 'block'; isVipActionPossible = true; } alternativeVipArea.style.display = 'none'; vipAcceptedBtn.disabled = !isVipActionPossible || isMvpSelectionNeeded; vipSkippedBtn.disabled = !isVipActionPossible || isMvpSelectionNeeded; undoAdvanceBtn.disabled = !state.previousRotationState; }
function populateMvpSelect() { mvpSelect.innerHTML = '<option value="">-- Select MVP --</option>'; if (!Array.isArray(state.members)) return; state.members.forEach(m => { if (!m?.id) return; const o=document.createElement('option'); o.value=m.id; o.textContent=`${m.name} (${m.rank})`; mvpSelect.appendChild(o); }); }
function renderSkippedVips() { skippedVipsListEl.innerHTML = ''; const container = document.getElementById('skipped-vips'); if (!state.rotationState?.skippedVips) { container.querySelector('p').textContent = 'Error loading list.'; return; } const valid = state.rotationState.skippedVips.filter(id => getMemberById(id)); if (valid.length === 0) { container.querySelector('p').textContent = 'Queue is empty.'; return; } container.querySelector('p').textContent = ''; valid.forEach(id => { const m = getMemberById(id); if(m){const li = document.createElement('li'); li.textContent = `${m.name} (${m.rank})`; skippedVipsListEl.appendChild(li);} }); }
function renderSchedule() { // Uses effectiveMemberIndex logic
     scheduleDisplayListEl.innerHTML = ''; if (!state.rotationState?.currentDate || !state.members) { scheduleDisplayListEl.innerHTML = '<li>Not ready</li>'; return; } const members = getMembersByRank('Member'); if (members.length === 0) { scheduleDisplayListEl.innerHTML = '<li>No Members</li>'; return; } const skipped = (state.rotationState.skippedVips || []).filter(id => getMemberById(id));
     const substitutes = state.rotationState.completedSubstituteVipsThisRound || [];
     const len = Math.max(7, members.length + skipped.length); let date = new Date(state.rotationState.currentDate + 'T00:00:00Z'); let r4r5Idx = state.rotationState.r4r5Index ?? 0; let memIdx = state.rotationState.memberIndex ?? 0; let tempSkipped = [...skipped]; let tempMvps = JSON.parse(JSON.stringify(state.rotationState.selectedMvps || {}));
     console.log(`renderSchedule START: Date=${getISODateString(date)}, R4R5=${r4r5Idx}, Mem=${memIdx}, Skipped=`, tempSkipped.map(id => getMemberById(id)?.name || id), `Substitutes=`, substitutes.map(id => getMemberById(id)?.name || id));

     for (let i = 0; i < len; i++) {
          if (isNaN(date)) { console.error("Invalid date in schedule render loop"); break; }
          const dateStr = getISODateString(date);
          const day = getDayOfWeek(date);
          console.log(`renderSchedule Loop ${i}: Simulating for ${dateStr} (weekday: ${day}) with MemIdx=${memIdx}, R4R5Idx=${r4r5Idx}, TempSkipped=[${tempSkipped.map(id=>getMemberById(id)?.name).join(',')}]`);

          // Hole Ergebnis inklusive des effektiv genutzten Index
          const { conductor, vip, effectiveMemberIndex } = calculateDailyAssignments(dateStr, r4r5Idx, memIdx, tempSkipped, tempMvps, substitutes);

          // --- Rendering ---
          if (conductor.id?.startsWith('ERR') || vip.id?.startsWith('ERR') || vip.id === 'NO_VALID_MEMBER') { console.warn(`Sched Err/No Valid ${dateStr}, VIP ID: ${vip?.id}`); }
          else { const li = document.createElement('li'); li.classList.add(i === 0 ? 'current-day' : null); const dS = document.createElement('span'); dS.classList.add('schedule-date'); dS.textContent = formatDate(date); const cS = document.createElement('span'); cS.classList.add('schedule-conductor'); const cN = conductor.name || "?"; const cR = conductor.rank || "N/A"; if (conductor.id === 'MVP_MON_SELECT' || conductor.id === 'MVP_SUN_SELECT') { const k = day === MVP_TECH_DAY ? `${dateStr}_Mon` : `${dateStr}_Sun`; if (tempMvps[k]) { const mvp = getMemberById(tempMvps[k]); cS.textContent = `C: ${mvp?.name || '?'} (MVP)`; } else { cS.innerHTML = `<span class="mvp-selection-required">${cN}</span>`; } } else { cS.textContent = `C: ${cN} (${cR})`; } const vS = document.createElement('span'); vS.classList.add('schedule-vip'); const vN = vip.name || "?"; const vR = vip.rank || "N/A"; if (vip.id === 'NO_MEMBERS' || vip.id.startsWith('ERR') || vip.id === 'NO_VALID_MEMBER') { vS.textContent = vN; } else { vS.textContent = `VIP: ${vN} (${vR})`; if (tempSkipped.length > 0 && tempSkipped[0] === vip.id) vS.textContent += ' (Skipped)'; } li.appendChild(dS); li.appendChild(cS); li.appendChild(vS); scheduleDisplayListEl.appendChild(li); }
          // --- Ende Rendering ---

          // --- Simulation Step (REVISED v10 - Using effectiveMemberIndex) ---
          console.log(`>>> Sim ${i} VIP Check: Proposed VIP=${vip?.id} (${vip?.name}), Effective MemIdx Used=${effectiveMemberIndex}, TempSkipped Before Shift = [${tempSkipped.map(id => getMemberById(id)?.name || id).join(', ')}]`);
          let vipProcessed = false;

          if (vip?.id && !vip.id.startsWith('NO_') && !vip.id.startsWith('ERROR_') && vip.id !== 'NO_VALID_MEMBER') {
              vipProcessed = true;
              const wasVipFromSkippedList = tempSkipped.length > 0 && tempSkipped[0] === vip.id;
              if (wasVipFromSkippedList) {
                  const removed = tempSkipped.shift();
                  console.log(`>>> Sim ${i} NextDay Prep: Removed skipped ${getMemberById(removed)?.name}. Remaining tempSkipped=[${tempSkipped.map(id => getMemberById(id)?.name || id).join(', ')}]`);
              } else {
                  console.log(`>>> Sim ${i} NextDay Prep: Regular VIP ${vip.name} processed.`);
              }
          } else {
              console.log(`>>> Sim ${i} NextDay Prep: No valid VIP processed this iteration.`);
          }

          // Setze den Member Index für die NÄCHSTE Iteration basierend auf dem EFFEKTIVEN Index DIESER Iteration
          if (vipProcessed) {
               // Erhöhe den *effektiv genutzten* Index für die nächste Runde
               memIdx = effectiveMemberIndex + 1;
               console.log(`>>> Sim ${i} NextDay Prep: Setting NEXT MemIdx to ${memIdx} (based on effective index ${effectiveMemberIndex} + 1).`);
          } else {
              // Wenn kein VIP verarbeitet wurde, bleibt der Index für die nächste Runde gleich
              // Korrektur: Muss der Index sein, der in die Berechnung einging, nicht zwangsläufig der effektive
              memIdx = currentMemberIndex; // Verwende den Index, mit dem die Berechnung gestartet wurde
              console.log(`>>> Sim ${i} NextDay Prep: Keeping MemIdx at ${memIdx} for next loop (no VIP processed).`);
          }

          // Advance R4/R5 Index (unverändert)
          if (day >= 2 && day <= 6) { console.log(`>>> Sim ${i} NextDay Prep: Advancing R4R5Idx from ${r4r5Idx}.`); r4r5Idx++; } else { console.log(`>>> Sim ${i} NextDay Prep: NOT advancing R4R5Idx.`); }

          date = addDays(date, 1);
          console.log(`>>> Sim ${i} NextDay Prep: Next loop state -> Date=${getISODateString(date)}, R4R5=${r4r5Idx}, Mem=${memIdx}, Skipped=[${tempSkipped.map(id => getMemberById(id)?.name || id).join(', ')}]`);
          // --- End Simulation Step ---
     }
     console.log("renderSchedule END");
}

function renderStatistics() { mvpStatsListEl.innerHTML = ''; vipStatsListEl.innerHTML = ''; if (!state.members?.length) { mvpStatsListEl.innerHTML = '<li>No members</li>'; vipStatsListEl.innerHTML = '<li>No members</li>'; return; } const mvpC = state.rotationState.mvpCounts || {}; const vipC = state.rotationState.vipCounts || {}; const sorted = [...state.members].sort((a, b) => (a?.name || "").localeCompare(b?.name || "")); let hasMvp = false; sorted.forEach(m => { if (!m?.id || !m.name) return; const c = mvpC[m.id] || 0; if (c > 0) hasMvp = true; const li = document.createElement('li'); li.textContent = m.name; const s = document.createElement('span'); s.classList.add('stats-count'); s.textContent = c; li.appendChild(s); mvpStatsListEl.appendChild(li); }); if (!hasMvp && sorted.length > 0) mvpStatsListEl.innerHTML = '<li>No MVPs yet.</li>'; let hasVip = false; sorted.forEach(m => { if (!m?.id || !m.name) return; const c = vipC[m.id] || 0; if (c > 0) hasVip = true; const li = document.createElement('li'); li.textContent = m.name; const s = document.createElement('span'); s.classList.add('stats-count'); s.textContent = c; li.appendChild(s); vipStatsListEl.appendChild(li); }); if (!hasVip && sorted.length > 0) vipStatsListEl.innerHTML = '<li>No VIPs yet.</li>'; if (sorted.length === 0) { mvpStatsListEl.innerHTML = '<li>No members</li>'; vipStatsListEl.innerHTML = '<li>No members</li>'; } }
function renderLastCompletedDay() { // Corrected MVP lookup & Alt VIP display
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
        else { conductorName = "(MVP selection missing?)"; console.warn(`renderLastCompletedDay: MVP ID for key ${mvpKey} on date ${lastDateStr} not found.`); }
    } else { const r4r5 = getMembersByRank('R4/R5'); if (r4r5.length > 0) { const c = r4r5[lastR4R5Index % r4r5.length]; conductorName = c ? `${c.name} (${c.rank})` : "Error R4/R5"; } else { conductorName = "No R4/R5"; } }
    lastCompletedConductorEl.textContent = conductorName;
    // VIP Display: Check for alternative first
    const alternativeVipId = currentAlternativeVips[lastDateStr];
    if (alternativeVipId) { const altVip = getMemberById(alternativeVipId); lastCompletedVipEl.textContent = altVip ? `${altVip.name} (${altVip.rank}) (Substitute)` : `Unknown Substitute (ID: ${alternativeVipId})`; }
    else { const { vip: proposedVip } = calculateDailyAssignments(lastDateStr, lastR4R5Index, lastMemberIndex, lastSkippedVips, {}); if (proposedVip?.id && !proposedVip.id.startsWith('NO_') && !proposedVip.id.startsWith('ERROR_')) { const currentSkipped = state.rotationState.skippedVips || []; const wasJustSkipped = currentSkipped.includes(proposedVip.id) && !lastSkippedVips.includes(proposedVip.id); lastCompletedVipEl.textContent = `${proposedVip.name} (${proposedVip.rank}) ${wasJustSkipped ? '(Skipped)' : '(Accepted)'}`; } else { lastCompletedVipEl.textContent = proposedVip?.name || "---"; } }
}
function render() { console.log("Rendering UI..."); /* Theme logic removed */ renderMemberList(); renderSkippedVips(); renderCurrentDay(); renderSchedule(); renderStatistics(); renderLastCompletedDay(); undoAdvanceBtn.disabled = !state.previousRotationState; if (versionEl) { versionEl.textContent = SCRIPT_VERSION; } }

// --- New/Updated Functions ---
function handleMvpDropdownChange() { if (mvpSelectionArea.style.display === 'block') { const selVal = mvpSelect.value; const enable = selVal !== ""; console.log(`MVP Dropdown changed. Val: "${selVal}". Enable: ${enable}`); const vipEl = document.getElementById('current-vip'); const vipTxt = vipEl ? vipEl.textContent : ""; const vipOK = !(vipTxt.includes("No Members") || vipTxt.includes("Error") || vipTxt.includes("No valid Member")); vipAcceptedBtn.disabled = !enable || !vipOK; vipSkippedBtn.disabled = !enable || !vipOK; } else { vipAcceptedBtn.disabled = true; vipSkippedBtn.disabled = true; } }
function populateAlternativeVipSelect() { alternativeVipSelect.innerHTML = '<option value="">-- No Alternative VIP --</option>'; const members = getMembersByRank('Member'); const substitutes = state.rotationState.completedSubstituteVipsThisRound || []; members.forEach(m => { if (!m?.id || substitutes.includes(m.id)) return; const o = document.createElement('option'); o.value = m.id; o.textContent = `${m.name} (${m.rank})`; alternativeVipSelect.appendChild(o); }); }
async function handleConfirmAlternativeVip() { // Corrected to store selected MVP ID and alternative VIP ID & count alt VIP
     console.log("--- handleConfirmAlternativeVip START ---"); const alternativeVipId = alternativeVipSelect.value; const originallySkippedVipId = alternativeVipArea.dataset.originalVipId; const selectedMvpIdForToday = alternativeVipArea.dataset.selectedMvpId;
     if (!originallySkippedVipId) { console.error("Original skipped VIP ID missing!"); return; }
     confirmAlternativeVipBtn.disabled = true; alternativeVipSelect.disabled = true; undoAdvanceBtn.disabled = true;
     const currentDateStr = state.rotationState.currentDate; const currentDate = new Date(currentDateStr + 'T00:00:00Z'); const currentDayOfWeek = getDayOfWeek(currentDate); const currentR4R5Index = state.rotationState.r4r5Index ?? 0; const currentMemberIndex = state.rotationState.memberIndex ?? 0; const currentSkippedVips = [...(state.rotationState.skippedVips || [])].filter(id => getMemberById(id));
     const currentSelectedMvps = { ...(state.rotationState.selectedMvps || {}) }; const currentVipCounts = { ...(state.rotationState.vipCounts || {}) }; const currentMvpCounts = { ...(state.rotationState.mvpCounts || {}) };
     const currentAlternativeVips = { ...(state.rotationState.alternativeVips || {})};
     const currentSubstituteList = [...(state.rotationState.completedSubstituteVipsThisRound || [])];

     if (!currentSkippedVips.includes(originallySkippedVipId)) { currentSkippedVips.unshift(originallySkippedVipId); }
     // MVP Count & Map Handling
     if (selectedMvpIdForToday) { const member = getMemberById(selectedMvpIdForToday); if (member) { currentMvpCounts[selectedMvpIdForToday] = (currentMvpCounts[selectedMvpIdForToday] || 0) + 1; console.log(`ConfirmAltVIP: MVP Count Inc: ${member.name} -> ${currentMvpCounts[selectedMvpIdForToday]}`); const mvpKey = currentDayOfWeek === MVP_TECH_DAY ? `${currentDateStr}_Mon` : `${currentDateStr}_Sun`; currentSelectedMvps[mvpKey] = selectedMvpIdForToday; console.log(`ConfirmAltVIP: Storing MVP ID ${selectedMvpIdForToday} for key ${mvpKey}`); } else { console.warn(`ConfirmAltVIP: MVP ID ${selectedMvpIdForToday} not found`); } }
     // Alternative VIP Count & Map & Substitute List Handling
     if (alternativeVipId) { const altVipMember = getMemberById(alternativeVipId); if (altVipMember) { currentVipCounts[alternativeVipId] = (currentVipCounts[alternativeVipId] || 0) + 1; console.log(`ConfirmAltVIP: ALTERNATIVE VIP Count Inc: ${altVipMember.name} -> ${currentVipCounts[alternativeVipId]}`); currentAlternativeVips[currentDateStr] = alternativeVipId; console.log(`ConfirmAltVIP: Storing Alternative VIP ${alternativeVipId} for date ${currentDateStr}`); if (!currentSubstituteList.includes(alternativeVipId)) { currentSubstituteList.push(alternativeVipId); } } else { console.warn(`ConfirmAltVIP: Alternative VIP ID ${alternativeVipId} not found`); } }

     // --- Round End Check & Clear Substitutes ---
     const memberMembers = getMembersByRank('Member');
     let finalSubstituteList = currentSubstituteList;
     // Get the effective index that *would* have been used if no skip occurred (for round end check)
     const { effectiveMemberIndex: hypotheticalNextIndexStart } = calculateDailyAssignments(currentDateStr, currentR4R5Index, currentMemberIndex, [], {}, []); // Berechne ohne Skip/Sub

     if (memberMembers.length > 0 && ((hypotheticalNextIndexStart + 1) % memberMembers.length === 0) && hypotheticalNextIndexStart >= 0 ) {
          // If processing the LAST member in the list (even if they were skipped/substituted), clear for the next round.
          console.log(`HANDLE CONFIRM ALT VIP: Round End detected based on Member Index ${hypotheticalNextIndexStart}! Clearing Substitute List.`);
          finalSubstituteList = [];
     }
     // --- End Round End Check ---

     // Calculate next state indices
     let nextR4R5Index = currentR4R5Index; if (currentDayOfWeek >= 2 && currentDayOfWeek <= 6) { nextR4R5Index = (currentR4R5Index + 1); }
     const nextDate = addDays(currentDate, 1); const nextDateStr = getISODateString(nextDate);
     try { state.previousRotationState = JSON.parse(JSON.stringify(state.rotationState)); console.log("Stored undo state."); } catch (e) { console.error("Undo store error:", e); state.previousRotationState = null; }
     // Update local state
     state.rotationState.currentDate = nextDateStr; state.rotationState.r4r5Index = nextR4R5Index;
     state.rotationState.memberIndex = currentMemberIndex; // Keep same Member index
     state.rotationState.skippedVips = currentSkippedVips; state.rotationState.selectedMvps = currentSelectedMvps; state.rotationState.vipCounts = currentVipCounts; state.rotationState.mvpCounts = currentMvpCounts;
     state.rotationState.alternativeVips = currentAlternativeVips;
     state.rotationState.completedSubstituteVipsThisRound = finalSubstituteList; // Set potentially cleared list
     console.log("Advancing day after skip. New local state:", JSON.parse(JSON.stringify(state.rotationState)));
     // Save to Firestore
     try { await updateFirestoreState(); console.log("FS updated after alt VIP."); alternativeVipArea.style.display = 'none'; } catch (error) { console.error("Save fail after alt VIP:", error); alert("Error saving. Check console."); confirmAlternativeVipBtn.disabled = false; alternativeVipSelect.disabled = false; }
     console.log("--- handleConfirmAlternativeVip END ---");
}

// --- Event Listeners ---
addMemberForm.addEventListener('submit', addMember);
vipAcceptedBtn.addEventListener('click', () => handleVipAction(true)); console.log("DEBUG: Listener vipAcceptedBtn OK");
vipSkippedBtn.addEventListener('click', () => handleVipAction(false)); console.log("DEBUG: Listener vipSkippedBtn OK");
mvpSelect.addEventListener('change', handleMvpDropdownChange); console.log("DEBUG: Listener mvpSelect OK");
confirmAlternativeVipBtn.addEventListener('click', handleConfirmAlternativeVip); console.log("DEBUG: Listener confirmAlternativeVipBtn OK");
async function handleVipAction(accepted) { // Handles branching between Accept and Skip paths
    console.log(`--- handleVipAction START --- Accepted: ${accepted}`); if (!state.rotationState?.currentDate) { alert("State not loaded"); return; }
    const currentDateStr = state.rotationState.currentDate; const currentDate = new Date(currentDateStr + 'T00:00:00Z'); const dayOfWeek = getDayOfWeek(currentDate); let selectedMvpId = null;
    if (dayOfWeek === MVP_TECH_DAY || dayOfWeek === MVP_VS_DAY) { const mvpKey = dayOfWeek === MVP_TECH_DAY ? `${currentDateStr}_Mon` : `${currentDateStr}_Sun`; const existingMvp = state.rotationState.selectedMvps?.[mvpKey]; if (!existingMvp) { selectedMvpId = mvpSelect.value; if (!selectedMvpId) { alert("Select MVP"); return; } } else { console.log("MVP already selected"); selectedMvpId = existingMvp; } }
    vipAcceptedBtn.disabled = true; vipSkippedBtn.disabled = true; undoAdvanceBtn.disabled = true; alternativeVipArea.style.display = 'none';
    if (accepted) { // --- ACCEPT PATH ---
        try { state.previousRotationState = JSON.parse(JSON.stringify(state.rotationState)); console.log("Stored prev state for undo."); } catch (e) { console.error("Undo store error:", e); state.previousRotationState = null; }
        console.log(`handleVipAction(Accept): MVP ID to pass: ${selectedMvpId}`); const success = advanceRotation(true, selectedMvpId);
        if (success) { console.log("handleVipAction(Accept): Saving state..."); try { await updateFirestoreState(); undoAdvanceBtn.disabled = !state.previousRotationState; console.log("handleVipAction(Accept): Save OK"); } catch (error) { console.error("handleVipAction(Accept): Save FAIL:", error); alert("Error saving. Check console!"); renderCurrentDay(); } } else { console.warn("handleVipAction(Accept): advanceRotation failed"); renderCurrentDay(); }
    } else { // --- SKIP PATH ---
        console.log("handleVipAction(Skip): Showing alternative VIP selection."); const { vip: proposedVip } = calculateDailyAssignments( currentDateStr, state.rotationState.r4r5Index ?? 0, state.rotationState.memberIndex ?? 0, state.rotationState.skippedVips || [], state.rotationState.selectedMvps || {}, state.rotationState.completedSubstituteVipsThisRound || [] ); if (!proposedVip?.id || proposedVip.id.startsWith('NO_') || proposedVip.id.startsWith('ERROR_')) { alert("Cannot process skip: No valid VIP was proposed."); renderCurrentDay(); return; }
        alternativeVipArea.dataset.originalVipId = proposedVip.id; alternativeVipArea.dataset.selectedMvpId = selectedMvpId || ""; originalSkippedVipNameEl.textContent = proposedVip.name || "The proposed VIP";
        populateAlternativeVipSelect(); alternativeVipArea.style.display = 'block'; confirmAlternativeVipBtn.disabled = false; alternativeVipSelect.disabled = false;
    } console.log("--- handleVipAction END ---");
}
undoAdvanceBtn.addEventListener('click', async () => { if (!state.previousRotationState) { alert("No undo state."); return; } if (confirm("Undo last advancement?")) { undoAdvanceBtn.disabled = true; try { if (typeof state.previousRotationState !== 'object' || state.previousRotationState === null) { throw new Error("Invalid undo data."); } state.rotationState = JSON.parse(JSON.stringify(state.previousRotationState)); state.previousRotationState = null; console.log("Rolled back state:", JSON.parse(JSON.stringify(state.rotationState))); await updateFirestoreState(); console.log("FS updated after undo."); } catch (error) { console.error("Undo error:", error); alert("Undo error: " + error.message); } } }); console.log("DEBUG: Listener undoAdvanceBtn OK");
// Theme Toggle Listener Removed
resetBtn.addEventListener('click', async () => { // Updated to clear new lists/maps
    if (confirm("!! WARNING !! Reset ALL data?")) {
        console.warn("Resetting data!"); resetBtn.disabled = true; const today = new Date(); const nextM = findNextMonday(today); const nextMStr = getISODateString(nextM);
        state.members = initialMembers.map(m => ({...m}));
        state.rotationState = { currentDate: nextMStr, r4r5Index: 0, memberIndex: 0, skippedVips: [], selectedMvps: {}, vipCounts: {}, mvpCounts: {}, alternativeVips: {}, completedSubstituteVipsThisRound: [] }; // <-- Reset new fields
        state.previousRotationState = null;
        try { await updateFirestoreState(); console.log("FS reset OK."); alert("Data reset."); }
        catch (error) { console.error("Reset error:", error); alert("Reset error."); resetBtn.disabled = false; }
    }
}); console.log("DEBUG: Listener resetBtn OK");

// --- Initialization and Realtime Updates ---
stateDocRef.onSnapshot((doc) => { // Updated to load new lists/maps
    console.log("FS data received/updated."); let needsInitialSetup=false; let needsDateUpdate=false;
    if(doc.exists){
        const data=doc.data(); console.log("Raw FS data:",data); const localPrev=state.previousRotationState; const loadedMembers=(data.members||[]).map(m=>({...m, id: m.id||generateId()})); const loadedRotState=data.rotationState||{};
        state={ members:loadedMembers, rotationState:{
            currentDate:loadedRotState.currentDate||null, r4r5Index:loadedRotState.r4r5Index??0, memberIndex:loadedRotState.memberIndex??0, skippedVips:loadedRotState.skippedVips||[], selectedMvps:loadedRotState.selectedMvps||{}, vipCounts:loadedRotState.vipCounts||{}, mvpCounts:loadedRotState.mvpCounts||{},
            alternativeVips: loadedRotState.alternativeVips || {},
            completedSubstituteVipsThisRound: loadedRotState.completedSubstituteVipsThisRound || [] // <-- Load
        }, previousRotationState:localPrev };
        if(!state.rotationState.currentDate||isNaN(new Date(state.rotationState.currentDate+'T00:00:00Z'))){ console.warn("Loaded state missing/invalid date."); needsDateUpdate=true; }
    } else { console.log("No FS doc. Initial setup..."); needsInitialSetup=true; }
    if(needsInitialSetup||needsDateUpdate){
        console.log(`Setup: Initial=${needsInitialSetup}, DateUpdate=${needsDateUpdate}`); const today=new Date(); const nextM=findNextMonday(today); const nextMStr=getISODateString(nextM);
        if(needsInitialSetup){
             state={ members:initialMembers.map(m=>({...m})), rotationState:{currentDate:nextMStr, r4r5Index:0, memberIndex:0, skippedVips:[], selectedMvps:{}, vipCounts:{}, mvpCounts:{}, alternativeVips:{}, completedSubstituteVipsThisRound:[]}, previousRotationState:null }; // <-- Init empty
             console.log("Init state, date:", nextMStr); updateFirestoreState().catch(err=>console.error("Initial save FAIL:", err));
        } else if(needsDateUpdate){
            state.rotationState.currentDate=nextMStr;
            if (!state.rotationState.alternativeVips) { state.rotationState.alternativeVips = {}; }
            if (!state.rotationState.completedSubstituteVipsThisRound) { state.rotationState.completedSubstituteVipsThisRound = []; } // Ensure exists
            console.log("Updating date to:", nextMStr); updateFirestoreState().catch(err=>console.error("Date update save FAIL:", err));
        }
    }
    console.log("Final local state:", JSON.parse(JSON.stringify(state))); render(); resetBtn.disabled=false;
}, (error) => { console.error("FS Listener ERROR:", error); alert(`FATAL DB ERROR (${error.message}). Check connection, config, rules, console.`); document.getElementById('vip-actions').style.display='none'; /* ... disable more UI on error ... */ });
// --- Initial Theme Render Removed ---
