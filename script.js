const SCRIPT_VERSION = "2.5"; // EXACT provided member list (100 members) & reset date fix

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
let state = { members: [], rotationState: { currentDate: null, r4r5Index: 0, memberIndex: 0, skippedVips: [], selectedMvps: {}, vipCounts: {}, mvpCounts: {}, alternativeVips: {}, completedSubstituteVipsThisRound: [], dailyHistory: {} }, previousRotationState: null };

// --- Initial Data (EXACTLY from user's Firebase Export - 100 Members) ---
const initialMembers = [
    { id: "mf9ak24ndb", name: "LadyLaik", rank: "R5"},
    { id: "17or009unuq", name: "CornFlakes", rank: "R4"},
    { id: "y7bgj573fek", name: "DaVinnie", rank: "R4"},
    { id: "xiyhgmhv5us", name: "Enyaisrave", rank: "R4"},
    { id: "e6sbv10is3b", name: "Hobo Munky", rank: "R4"},
    { id: "mcoh4jnbf1", name: "Johcar", rank: "R4"},
    { id: "4gz5l9vuaks", name: "Lyfe", rank: "R4"},
    { id: "kbb9ledj23a", name: "Motherfrogger", rank: "R4"},
    { id: "m9m6cx319n", name: "NymbleV", rank: "R4"},
    { id: "08o6hk7qx8r9", name: "Pabs64", rank: "R4"},
    { id: "4kkz4hlpwfb", name: "Supersebb", rank: "R4"},
    { id: "3zzvu8xqw25", name: "Ado1111", rank: "Member"},
    { id: "p958l8m1klb", name: "Aminos77", rank: "Member"},
    { id: "b0waqcq4ct6", name: "Arczos", rank: "Member"},
    { id: "898cmm00929", name: "B1wizz", rank: "Member"},
    { id: "rxyql4n86u", name: "Be a wolf", rank: "Member"},
    { id: "vzjuvot2k5l", name: "Bekim1", rank: "Member"},
    { id: "jta8ykzkx2a", name: "BlackPush", rank: "Member"},
    { id: "4gzoev8gh9m", name: "BlackWizardUA", rank: "Member"},
    { id: "adxeco08vyb", name: "blacky12345", rank: "Member"},
    { id: "owetho42tpi", name: "BLÀDE", rank: "Member"},
    { id: "pl0x5dr9fqg", name: "BOREDOFTHISSHTGAME", rank: "Member"},
    { id: "ij11pygwdlj", name: "Caretta", rank: "Member"},
    { id: "ddnuxx34ikm", name: "Chasseur 777", rank: "Member"},
    { id: "xgv988396p", name: "Cocsi29400", rank: "Member"},
    { id: "ssno7klhdre", name: "Commander BLad", rank: "Member"},
    { id: "tp8sxmr9kal", name: "Dario217", rank: "Member"},
    { id: "qv0ctxpv9", name: "Darkknight", rank: "Member"},
    { id: "q5hskqfj6n", name: "depechefann", rank: "Member"},
    { id: "lu3bkraus1f", name: "Dfyra", rank: "Member"},
    { id: "q0hj7kg11i", name: "DiamondDixie", rank: "Member"},
    { id: "jgtrr1rfnno", name: "diRty freNk", rank: "Member"},
    { id: "lgen6jizxm", name: "Edx77", rank: "Member"},
    { id: "yzp6bkab5fd", name: "Ever4", rank: "Member"},
    { id: "hzewkgctmyt", name: "F L A C", rank: "Member"},
    { id: "qxro6ks5dv", name: "Faluche", rank: "Member"},
    { id: "z066vfsi2z", name: "FireXice (Bibot)", rank: "Member"},
    { id: "eceta2415l6", name: "Foggis", rank: "Member"},
    { id: "znpjany9e5", name: "Gekkegerrittttt", rank: "Member"},
    { id: "twffpd4bxqd", name: "GhósT", rank: "Member"},
    { id: "cnoiz03cu5c", name: "GoFireES", rank: "Member"},
    { id: "l71ele4rx6", name: "Gorkiules", rank: "Member"},
    { id: "hxd0a7b01u7", name: "Gunnovic", rank: "Member"},
    { id: "76txnlwge13", name: "Héra217", rank: "Member"},
    { id: "c7h4559t0u", name: "ILYES B", rank: "Member"},
    { id: "iezog2x1k98", name: "IRONHAMMER", rank: "Member"},
    { id: "swf8dcbx57g", name: "Jadja", rank: "Member"},
    { id: "vfxbrz6aqro", name: "Jaista", rank: "Member"},
    { id: "f3tzz8kbroe", name: "jarako", rank: "Member"},
    { id: "s1jfd2hpig", name: "jassådu", rank: "Member"},
    { id: "mzt51lx4pi", name: "Jotersan", rank: "Member"},
    { id: "k15ficxkbqb", name: "Juantxo79", rank: "Member"},
    { id: "dbfnak347o7", name: "Juggernaut x", rank: "Member"},
    { id: "smyeljtjps", name: "KezuaL", rank: "Member"},
    { id: "w2jdb50iuim", name: "KFCPov3r", rank: "Member"},
    { id: "9akuqzpbc5m", name: "KingStridez", rank: "Member"},
    { id: "ps4gofl5b0i", name: "koppies", rank: "Member"},
    { id: "is5du2cdxf", name: "KPShafty", rank: "Member"},
    { id: "qik0m29g18i", name: "Kyuchie", rank: "Member"},
    { id: "nr7i72pa02n", name: "Laeta", rank: "Member"},
    { id: "g89sizmn4am", name: "Leka98", rank: "Member"},
    { id: "ba160nnybwv", name: "Llama deDrama", rank: "Member"},
    { id: "painwrjp29d", name: "Lutonian", rank: "Member"},
    { id: "hu1x7lx3nys", name: "Mala Mimi", rank: "Member"},
    { id: "72lvd6yudfu", name: "Maytos", rank: "Member"},
    { id: "bqlp5lbpbva", name: "Megalomanie", rank: "Member"},
    { id: "t06pnjo97o", name: "Meloziaa", rank: "Member"},
    { id: "zmwzmo4qzma", name: "MorguiZeh", rank: "Member"},
    { id: "yu21z2f6608", name: "MRan", rank: "Member"},
    { id: "00x971cur744", name: "NinoDelBono", rank: "Member"},
    { id: "hywj3qnnwts", name: "Nohardfeelz", rank: "Member"},
    { id: "lakoazf1ku", name: "Novis01", rank: "Member"},
    { id: "8s0ti9edh9x", name: "Oliviax", rank: "Member"},
    { id: "5hqzrmp09bg", name: "olabaf", rank: "Member"},
    { id: "wy1euux7vn", name: "oo APACHE oo", rank: "Member"},
    { id: "cszaqufve1k", name: "Peckap", rank: "Member"},
    { id: "uzp94ynbfta", name: "Prantuan", rank: "Member"},
    { id: "dhic1v9lls", name: "RaMbo0", rank: "Member"},
    { id: "db7g8r8pucp", name: "Raph911", rank: "Member"},
    { id: "k8kyateu8tb", name: "Rev T", rank: "Member"},
    { id: "y3v188ikskh", name: "Rikkyyyyy", rank: "Member"},
    { id: "7twrqg71r5", name: "S A M U R A i", rank: "Member"},
    { id: "4gqfx5vss2p", name: "Sarajevo Mfrcs", rank: "Member"},
    { id: "wzhrjmo8d8", name: "SkyWinder", rank: "Member"},
    { id: "k6hctcv5pkg", name: "Smâsh", rank: "Member"},
    { id: "a4wjmizgce", name: "Smugwell", rank: "Member"},
    { id: "ju1ut2s7pp8", name: "Swisskilla", rank: "Member"},
    { id: "myedunkwsyp", name: "Temd", rank: "Member"},
    { id: "p6ubvonqfn8", name: "TheFloh", rank: "Member"},
    { id: "wm39sn901g", name: "theFoxXx", rank: "Member"},
    { id: "zeduqp22byj", name: "Thirteen Squid", rank: "Member"},
    { id: "62wm82wumwa", name: "Umbra XIII", rank: "Member"},
    { id: "61tel2tbc9", name: "Vechniy", rank: "Member"},
    { id: "qqtu4u2rj3", name: "Velvet Thunder 11", rank: "Member"},
    { id: "nw8mrpfby68", name: "Villanueva 1", rank: "Member"},
    { id: "vsgs52vbnfo", name: "xPerseus", rank: "Member"},
    { id: "kbmf8uiamuh", name: "Xyz111111", rank: "Member"},
    { id: "2w7n0cgq6cu", name: "Zoorglub", rank: "Member"},
    { id: "zc6ordygl3g", name: "АЛЕКС1980", rank: "Member"},
    { id: "dum47vk6xt9", name: "ЖЭКА", rank: "Member"}
].map(m => ({ ...m, id: m.id || generateId() })); // Use provided ID if available

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
     const currentDailyHistory = { ...(state.rotationState.dailyHistory || {}) };

     const { conductor: proposedConductor, vip: proposedVip, effectiveMemberIndex } = calculateDailyAssignments(currentDateStr, currentR4R5Index, currentMemberIndex, currentSkippedVips, currentSelectedMvps, currentSubstituteList);
     if (!proposedVip?.id || proposedVip.id.startsWith('NO_') || proposedVip.id.startsWith('ERROR_')) { alert("No valid VIP proposed."); return false; }
     const proposedVipId = proposedVip.id; let nextR4R5Index = currentR4R5Index; let nextMemberIndex = currentMemberIndex; let nextSkippedVips = currentSkippedVips.filter(id => getMemberById(id)); const wasVipFromSkippedList = nextSkippedVips.length > 0 && nextSkippedVips[0] === proposedVipId;
     if (!vipAccepted) { return false; }

     nextMemberIndex = effectiveMemberIndex + 1;
     if (wasVipFromSkippedList) { nextSkippedVips.shift(); }
     currentVipCounts[proposedVipId] = (currentVipCounts[proposedVipId] || 0) + 1;

     const memberMembers = getMembersByRank('Member'); let finalSubstituteList = currentSubstituteList;
     if (memberMembers.length > 0 && (nextMemberIndex % memberMembers.length === 0) && nextMemberIndex > 0) { finalSubstituteList = []; }

     let finalConductorId = proposedConductor.id;
     if (currentDayOfWeek >= 2 && currentDayOfWeek <= 6) { nextR4R5Index = (currentR4R5Index + 1); } if (selectedMvpId) { const member = getMemberById(selectedMvpId); if (member) { const mvpKey = currentDayOfWeek === MVP_TECH_DAY ? `${currentDateStr}_Mon` : `${currentDateStr}_Sun`; currentSelectedMvps[mvpKey] = selectedMvpId; currentMvpCounts[selectedMvpId] = (currentMvpCounts[selectedMvpId] || 0) + 1; finalConductorId = selectedMvpId; } else { console.warn(`MVP ID ${selectedMvpId} not found`); } }

     recordDailyHistory(currentDateStr, finalConductorId, proposedVipId, 'Accepted');

     const nextDate = addDays(currentDate, 1); const nextDateStr = getISODateString(nextDate);
     state.rotationState.currentDate = nextDateStr; state.rotationState.r4r5Index = nextR4R5Index; state.rotationState.memberIndex = nextMemberIndex; state.rotationState.skippedVips = nextSkippedVips; state.rotationState.selectedMvps = currentSelectedMvps; state.rotationState.vipCounts = currentVipCounts; state.rotationState.mvpCounts = currentMvpCounts;
     state.rotationState.alternativeVips = currentAlternativeVips; state.rotationState.completedSubstituteVipsThisRound = finalSubstituteList;
     state.rotationState.dailyHistory = currentDailyHistory;
     return true;
}
function updateFirestoreState() { // Updated to save history
    const stateToSave={ members:state.members||[], rotationState:{ currentDate:state.rotationState.currentDate, r4r5Index:state.rotationState.r4r5Index??0, memberIndex:state.rotationState.memberIndex??0, skippedVips:state.rotationState.skippedVips||[], selectedMvps:state.rotationState.selectedMvps||{}, vipCounts:state.rotationState.vipCounts||{}, mvpCounts:state.rotationState.mvpCounts||{}, alternativeVips: state.rotationState.alternativeVips || {}, completedSubstituteVipsThisRound: state.rotationState.completedSubstituteVipsThisRound || [], dailyHistory: state.rotationState.dailyHistory || {} } };
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
function renderSchedule() { // Renders past days from history and future days via simulation
     scheduleDisplayListEl.innerHTML = ''; if (!state.rotationState?.currentDate || !state.members) { scheduleDisplayListEl.innerHTML = '<li>Not ready</li>'; return; }
     const members = getMembersByRank('Member'); const skipped = (state.rotationState.skippedVips || []).filter(id => getMemberById(id)); const substitutes = state.rotationState.completedSubstituteVipsThisRound || [];
     const history = state.rotationState.dailyHistory || {};
     const today = new Date(state.rotationState.currentDate + 'T00:00:00Z');

     const daysToShowPast = 3;
     const daysToShowFuture = Math.max(7, members.length + skipped.length); // Show reasonable future length

     let r4r5Idx = state.rotationState.r4r5Index ?? 0; let memIdx = state.rotationState.memberIndex ?? 0; let tempSkipped = [...skipped]; let tempMvps = JSON.parse(JSON.stringify(state.rotationState.selectedMvps || {}));

     // Render past days
     for (let i = daysToShowPast; i >= 1; i--) {
         const pastDate = addDays(today, -i); const pastDateStr = getISODateString(pastDate);
         const historyEntry = history[pastDateStr];
         const li = document.createElement('li'); li.classList.add('past-day');
         const dS = document.createElement('span'); dS.classList.add('schedule-date'); dS.textContent = formatDate(pastDate);
         const cS = document.createElement('span'); cS.classList.add('schedule-conductor');
         const vS = document.createElement('span'); vS.classList.add('schedule-vip');
         if (historyEntry) {
             cS.textContent = `C: ${historyEntry.conductorName} (${historyEntry.conductorRank || 'N/A'})`;
             let vipStatusText = historyEntry.status ? `(${historyEntry.status})` : '';
             vS.textContent = `VIP: ${historyEntry.vipName} (${historyEntry.vipRank || 'N/A'}) ${vipStatusText}`;
         } else { cS.textContent = `C: (No history)`; vS.textContent = `VIP: (No history)`; }
         li.appendChild(dS); li.appendChild(cS); li.appendChild(vS); scheduleDisplayListEl.appendChild(li);
     }

     // Render current and future days
     let date = new Date(today); // Start simulation from today
     for (let i = 0; i < daysToShowFuture; i++) {
          if (isNaN(date)) { break; } const dateStr = getISODateString(date); const day = getDayOfWeek(date); const isCurrentDay = (i === 0);
          const { conductor, vip, effectiveMemberIndex } = calculateDailyAssignments(dateStr, r4r5Idx, memIdx, tempSkipped, tempMvps, substitutes);

          // Rendering
          if (conductor.id?.startsWith('ERR') || vip.id?.startsWith('ERR') || vip.id === 'NO_VALID_MEMBER') { /* Skip */ }
          else { const li = document.createElement('li'); if(isCurrentDay) li.classList.add('current-day'); const dS = document.createElement('span'); dS.classList.add('schedule-date'); dS.textContent = formatDate(date); const cS = document.createElement('span'); cS.classList.add('schedule-conductor'); const cN = conductor.name || "?"; const cR = conductor.rank || "N/A"; if (conductor.id === 'MVP_MON_SELECT' || conductor.id === 'MVP_SUN_SELECT') { const k = day === MVP_TECH_DAY ? `${dateStr}_Mon` : `${dateStr}_Sun`; if (tempMvps[k]) { const mvp = getMemberById(tempMvps[k]); cS.textContent = `C: ${mvp?.name || '?'} (MVP)`; } else { cS.innerHTML = `<span class="mvp-selection-required">${cN}</span>`; } } else { cS.textContent = `C: ${cN} (${cR})`; } const vS = document.createElement('span'); vS.classList.add('schedule-vip'); const vN = vip.name || "?"; const vR = vip.rank || "N/A"; if (vip.id === 'NO_MEMBERS' || vip.id.startsWith('ERR') || vip.id === 'NO_VALID_MEMBER') { vS.textContent = vN; } else { vS.textContent = `VIP: ${vN} (${vR})`; if (tempSkipped.length > 0 && tempSkipped[0] === vip.id) vS.textContent += ' (Skipped)'; } li.appendChild(dS); li.appendChild(cS); li.appendChild(vS); scheduleDisplayListEl.appendChild(li); }

          // Simulation Step for next day
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
function renderLastCompletedDay() { // Uses History if available
    lastCompletedDateEl.textContent = "---"; lastCompletedConductorEl.textContent = "---"; lastCompletedVipEl.textContent = "---";
    if (!state.rotationState?.currentDate) return;
    const today = new Date(state.rotationState.currentDate + 'T00:00:00Z'); const lastDay = addDays(today, -1); const lastDateStr = getISODateString(lastDay);
    const historyEntry = state.rotationState.dailyHistory?.[lastDateStr];

    if (historyEntry) {
        lastCompletedDateEl.textContent = formatDate(lastDay);
        lastCompletedConductorEl.textContent = `${historyEntry.conductorName} (${historyEntry.conductorRank || 'N/A'})`;
        let vipStatusText = historyEntry.status ? `(${historyEntry.status})` : '';
        lastCompletedVipEl.textContent = `${historyEntry.vipName} (${historyEntry.vipRank || 'N/A'}) ${vipStatusText}`;
    } else if (state.previousRotationState?.currentDate) { // Fallback for first day after load/reset
        const prevDateStr = state.previousRotationState.currentDate; const prevDate = new Date(prevDateStr + 'T00:00:00Z');
        if (!isNaN(prevDate) && getISODateString(prevDate) === lastDateStr) {
            const prevDayOfWeek = getDayOfWeek(prevDate); const prevR4R5Idx = state.previousRotationState.r4r5Index ?? 0; const prevMemIdx = state.previousRotationState.memberIndex ?? 0; const prevSkipped = state.previousRotationState.skippedVips || [];
            const currentMvps = state.rotationState.selectedMvps || {}; const currentAlts = state.rotationState.alternativeVips || {};
            lastCompletedDateEl.textContent = formatDate(prevDate); let conductorName = "---";
            if (prevDayOfWeek === MVP_TECH_DAY || prevDayOfWeek === MVP_VS_DAY) { const k = prevDayOfWeek === MVP_TECH_DAY ? `${prevDateStr}_Mon` : `${prevDateStr}_Sun`; const id = currentMvps[k]; if(id){const m=getMemberById(id); conductorName = m?`${m.name} (MVP)`:`ID:${id}`;} else{conductorName="(MVP miss?)";} }
             else { const r4r5=getMembersByRank('R4/R5'); conductorName = r4r5.length>0?`${getMemberById(r4r5[prevR4R5Idx%r4r5.length].id)?.name || '?'} (${r4r5[prevR4R5Idx%r4r5.length].rank})`:"No R4/R5"; }
            lastCompletedConductorEl.textContent = conductorName;
            const altVipId = currentAlts[prevDateStr];
            if (altVipId) { const altVip = getMemberById(altVipId); lastCompletedVipEl.textContent = altVip ? `${altVip.name} (${altVip.rank}) (Substitute)` : `Unknown Sub (ID:${altVipId})`; }
            else { const { vip: pVip } = calculateDailyAssignments(prevDateStr, prevR4R5Idx, prevMemIdx, prevSkipped, {}); if(pVip?.id && !pVip.id.startsWith('NO_') && !pVip.id.startsWith('ERR')){ const currSkipped = state.rotationState.skippedVips||[]; const skipped = currSkipped.includes(pVip.id) && !prevSkipped.includes(pVip.id); lastCompletedVipEl.textContent = `${pVip.name} (${pVip.rank}) ${skipped?'(Skipped)':'(Accepted)'}`; } else { lastCompletedVipEl.textContent = pVip?.name || "---"; } }
        }
    }
}
function render() { /* Removed theme logic & debug logs */ renderMemberList(); renderSkippedVips(); renderCurrentDay(); renderSchedule(); renderStatistics(); renderLastCompletedDay(); undoAdvanceBtn.disabled = !state.previousRotationState; if (versionEl) { versionEl.textContent = SCRIPT_VERSION; } }

// --- New/Updated Functions ---
function handleMvpDropdownChange() { if (mvpSelectionArea.style.display === 'block') { const selVal = mvpSelect.value; const enable = selVal !== ""; const vipEl = document.getElementById('current-vip'); const vipTxt = vipEl ? vipEl.textContent : ""; const vipOK = !(vipTxt.includes("No Members") || vipTxt.includes("Error") || vipTxt.includes("No valid Member")); vipAcceptedBtn.disabled = !enable || !vipOK; vipSkippedBtn.disabled = !enable || !vipOK; } else { vipAcceptedBtn.disabled = true; vipSkippedBtn.disabled = true; } }
function populateAlternativeVipSelect() { alternativeVipSelect.innerHTML = '<option value="">-- No Alternative VIP --</option>'; const members = getMembersByRank('Member'); const substitutes = state.rotationState.completedSubstituteVipsThisRound || []; members.forEach(m => { if (!m?.id || substitutes.includes(m.id)) return; const o = document.createElement('option'); o.value = m.id; o.textContent = `${m.name} (${m.rank})`; alternativeVipSelect.appendChild(o); }); }
// --- NEUE FUNKTION: Speichert den Verlauf für einen abgeschlossenen Tag ---
function recordDailyHistory(dateStr, conductorId, vipId, status) {
    if (!dateStr || !conductorId || !vipId) { return; }
    const conductor = getMemberById(conductorId);
    const vip = getMemberById(vipId);
    if (!state.rotationState.dailyHistory) { state.rotationState.dailyHistory = {}; }
    state.rotationState.dailyHistory[dateStr] = {
        conductorId: conductorId, conductorName: conductor ? conductor.name : 'Unknown', conductorRank: conductor ? conductor.rank : 'N/A',
        vipId: vipId, vipName: vip ? vip.name : 'Unknown', vipRank: vip ? vip.rank : 'N/A', status: status
    };
}
async function handleConfirmAlternativeVip() { // Counts alt VIP & Records History
     const alternativeVipId = alternativeVipSelect.value; const originallySkippedVipId = alternativeVipArea.dataset.originalVipId; const selectedMvpIdForToday = alternativeVipArea.dataset.selectedMvpId;
     if (!originallySkippedVipId) { return; }
     confirmAlternativeVipBtn.disabled = true; alternativeVipSelect.disabled = true; undoAdvanceBtn.disabled = true;
     const currentDateStr = state.rotationState.currentDate; const currentDate = new Date(currentDateStr + 'T00:00:00Z'); const currentDayOfWeek = getDayOfWeek(currentDate); const currentR4R5Index = state.rotationState.r4r5Index ?? 0; const currentMemberIndex = state.rotationState.memberIndex ?? 0; const currentSkippedVips = [...(state.rotationState.skippedVips || [])].filter(id => getMemberById(id));
     const currentSelectedMvps = { ...(state.rotationState.selectedMvps || {}) }; const currentVipCounts = { ...(state.rotationState.vipCounts || {}) }; const currentMvpCounts = { ...(state.rotationState.mvpCounts || {}) };
     const currentAlternativeVips = { ...(state.rotationState.alternativeVips || {})};
     const currentSubstituteList = [...(state.rotationState.completedSubstituteVipsThisRound || [])];
     const currentDailyHistory = { ...(state.rotationState.dailyHistory || {}) };

     if (!currentSkippedVips.includes(originallySkippedVipId)) { currentSkippedVips.unshift(originallySkippedVipId); }
     let finalConductorId = null;
     if (selectedMvpIdForToday) { const member = getMemberById(selectedMvpIdForToday); if (member) { currentMvpCounts[selectedMvpIdForToday] = (currentMvpCounts[selectedMvpIdForToday] || 0) + 1; const mvpKey = currentDayOfWeek === MVP_TECH_DAY ? `${currentDateStr}_Mon` : `${currentDateStr}_Sun`; currentSelectedMvps[mvpKey] = selectedMvpIdForToday; finalConductorId = selectedMvpIdForToday; } else { console.warn(`ConfirmAltVIP: MVP ID ${selectedMvpIdForToday} not found`); } }
     else { const r4r5 = getMembersByRank('R4/R5'); finalConductorId = r4r5.length>0?r4r5[currentR4R5Index % r4r5.length]?.id||'NO_R4R5':'NO_R4R5'; }
     if (alternativeVipId) { const altVipMember = getMemberById(alternativeVipId); if (altVipMember) { currentVipCounts[alternativeVipId] = (currentVipCounts[alternativeVipId] || 0) + 1; currentAlternativeVips[currentDateStr] = alternativeVipId; if (!currentSubstituteList.includes(alternativeVipId)) { currentSubstituteList.push(alternativeVipId); } } else { console.warn(`ConfirmAltVIP: Alternative VIP ID ${alternativeVipId} not found`); } }

     recordDailyHistory(currentDateStr, finalConductorId, alternativeVipId || originallySkippedVipId, alternativeVipId ? 'Substitute' : 'Skipped');

     const memberMembers = getMembersByRank('Member'); let finalSubstituteList = currentSubstituteList;
     const { effectiveMemberIndex: hypotheticalNextIndexStart } = calculateDailyAssignments(currentDateStr, currentR4R5Index, currentMemberIndex, [], {}, []);
     if (memberMembers.length > 0 && ((hypotheticalNextIndexStart + 1) % memberMembers.length === 0) && hypotheticalNextIndexStart >= 0 ) { finalSubstituteList = []; }

     let nextR4R5Index = currentR4R5Index; if (currentDayOfWeek >= 2 && currentDayOfWeek <= 6) { nextR4R5Index = (currentR4R5Index + 1); } const nextDate = addDays(currentDate, 1); const nextDateStr = getISODateString(nextDate);
     try { state.previousRotationState = JSON.parse(JSON.stringify(state.rotationState)); } catch (e) { state.previousRotationState = null; }
     state.rotationState.currentDate = nextDateStr; state.rotationState.r4r5Index = nextR4R5Index; state.rotationState.memberIndex = currentMemberIndex; state.rotationState.skippedVips = currentSkippedVips; state.rotationState.selectedMvps = currentSelectedMvps; state.rotationState.vipCounts = currentVipCounts; state.rotationState.mvpCounts = currentMvpCounts;
     state.rotationState.alternativeVips = currentAlternativeVips; state.rotationState.completedSubstituteVipsThisRound = finalSubstituteList;
     state.rotationState.dailyHistory = currentDailyHistory;
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
        try { state.previousRotationState = JSON.parse(JSON.stringify(state.rotationState)); } catch (e) { state.previousRotationState = null; }
        const success = advanceRotation(true, selectedMvpId);
        if (success) { try { await updateFirestoreState(); undoAdvanceBtn.disabled = !state.previousRotationState; } catch (error) { renderCurrentDay(); } } else { renderCurrentDay(); }
    } else { // SKIP PATH
        const { vip: proposedVip } = calculateDailyAssignments( currentDateStr, state.rotationState.r4r5Index ?? 0, state.rotationState.memberIndex ?? 0, state.rotationState.skippedVips || [], state.rotationState.selectedMvps || {}, state.rotationState.completedSubstituteVipsThisRound || [] ); if (!proposedVip?.id || proposedVip.id.startsWith('NO_') || proposedVip.id.startsWith('ERROR_')) { alert("Cannot process skip: No valid VIP was proposed."); renderCurrentDay(); return; }
        alternativeVipArea.dataset.originalVipId = proposedVip.id; alternativeVipArea.dataset.selectedMvpId = selectedMvpId || ""; originalSkippedVipNameEl.textContent = proposedVip.name || "The proposed VIP";
        populateAlternativeVipSelect(); alternativeVipArea.style.display = 'block'; confirmAlternativeVipBtn.disabled = false; alternativeVipSelect.disabled = false;
    }
}
undoAdvanceBtn.addEventListener('click', async () => { if (!state.previousRotationState) { alert("No undo state."); return; } if (confirm("Undo last advancement?")) { undoAdvanceBtn.disabled = true; try { if (typeof state.previousRotationState !== 'object' || state.previousRotationState === null) { throw new Error("Invalid undo data."); } state.rotationState = JSON.parse(JSON.stringify(state.previousRotationState)); state.previousRotationState = null; await updateFirestoreState(); } catch (error) { console.error("Undo error:", error); alert("Undo error: " + error.message); } } });
resetBtn.addEventListener('click', async () => {
    if (confirm("!! WARNING !! Reset ALL data? This cannot be undone!")) {
        resetBtn.disabled = true; const resetDateStr = "2025-04-21";
        state.members = initialMembers.map(m => ({...m, id: m.id || generateId()}));
        state.rotationState = { currentDate: resetDateStr, r4r5Index: 0, memberIndex: 0, skippedVips: [], selectedMvps: {}, vipCounts: {}, mvpCounts: {}, alternativeVips: {}, completedSubstituteVipsThisRound: [], dailyHistory: {} };
        state.previousRotationState = null;
        try { await updateFirestoreState(); alert(`Data has been reset to defaults, starting from ${formatDate(new Date(resetDateStr + 'T00:00:00Z'))}.`); }
        catch (error) { console.error("Reset error:", error); alert("Error resetting data."); resetBtn.disabled = false; }
    }
});

// --- Initialization and Realtime Updates ---
stateDocRef.onSnapshot((doc) => { // Load history
    console.log("FS data received/updated."); let needsInitialSetup=false; let needsDateUpdate=false;
    const fixedStartDate = "2025-04-21";

    if(doc.exists){
        const data=doc.data(); const localPrev=state.previousRotationState; const loadedMembers=(data.members||[]).map(m=>({...m, id: m.id||generateId()})); const loadedRotState=data.rotationState||{};
        state={ members:loadedMembers, rotationState:{
            currentDate:loadedRotState.currentDate||null, r4r5Index:loadedRotState.r4r5Index??0, memberIndex:loadedRotState.memberIndex??0, skippedVips:loadedRotState.skippedVips||[], selectedMvps:loadedRotState.selectedMvps||{}, vipCounts:loadedRotState.vipCounts||{}, mvpCounts:loadedRotState.mvpCounts||{},
            alternativeVips: loadedRotState.alternativeVips || {},
            completedSubstituteVipsThisRound: loadedRotState.completedSubstituteVipsThisRound || [],
            dailyHistory: loadedRotState.dailyHistory || {} // <-- Load history
        }, previousRotationState:localPrev };
        if(!state.rotationState.currentDate||isNaN(new Date(state.rotationState.currentDate+'T00:00:00Z'))){
             needsDateUpdate=true;
        }
    } else { needsInitialSetup=true; }

    if(needsInitialSetup||needsDateUpdate){
        const startDate = fixedStartDate;
        if(needsInitialSetup){
             state={ members:initialMembers.map(m=>({...m, id: m.id || generateId()})), rotationState:{currentDate:startDate, r4r5Index:0, memberIndex:0, skippedVips:[], selectedMvps:{}, vipCounts:{}, mvpCounts:{}, alternativeVips:{}, completedSubstituteVipsThisRound:[], dailyHistory:{}}, previousRotationState:null }; // <-- Init history
             updateFirestoreState().catch(err=>console.error("Initial save FAIL:", err));
        } else if(needsDateUpdate){
            state.rotationState.currentDate=startDate;
            if (!state.rotationState.alternativeVips) { state.rotationState.alternativeVips = {}; }
            if (!state.rotationState.completedSubstituteVipsThisRound) { state.rotationState.completedSubstituteVipsThisRound = []; }
            if (!state.rotationState.dailyHistory) { state.rotationState.dailyHistory = {}; } // Ensure history exists
            updateFirestoreState().catch(err=>console.error("Date update save FAIL:", err));
        }
    }
    render(); resetBtn.disabled=false;
}, (error) => { console.error("FS Listener ERROR:", error); alert(`FATAL DB ERROR (${error.message}). Check connection, config, rules, console.`); /* disable UI */ });
// --- Initial Theme Render Removed ---
