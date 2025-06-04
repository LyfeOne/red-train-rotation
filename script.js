const SCRIPT_VERSION = "5.5"; // Updated: Removed Skipped VIP List, Improved Firebase Init
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
const MVP_TECH_DAY = 1; // Montag
const MVP_VS_DAY = 0;   // Sonntag
const RANKS = ["Member", "R4", "R5"];

let state = {
    members: [],
    rotationState: {
        currentDate: null,
        r4r5Index: 0,
        memberIndex: 0,
        // skippedVips: [], // ENTFERNT
        selectedMvps: {},
        vipCounts: {},
        mvpCounts: {},
        alternativeVips: {},
        completedSubstituteVipsThisRound: [],
        dailyHistory: {}
    },
    previousRotationState: null
};

// --- Initial Data (EXACTLY from user's Firebase Export - 100 Members) ---
// Diese Liste wird nur für den allerersten Start (leere DB) oder einen expliziten Reset verwendet.
const initialMembers = [
    { id: "mf9ak24ndb", name: "LadyLaik", rank: "R5"}, { id: "17or009unuq", name: "CornFlakes", rank: "R4"}, { id: "y7bgj573fek", name: "DaVinnie", rank: "R4"}, { id: "xiyhgmhv5us", name: "Enyaisrave", rank: "R4"}, { id: "e6sbv10is3b", name: "Hobo Munky", rank: "R4"}, { id: "mcoh4jnbf1", name: "Johcar", rank: "R4"}, { id: "4gz5l9vuaks", name: "Lyfe", rank: "R4"}, { id: "kbb9ledj23a", name: "Motherfrogger", rank: "R4"}, { id: "m9m6cx319n", name: "NymbleV", rank: "R4"}, { id: "08o6hk7qx8r9", name: "Pabs64", rank: "R4"}, { id: "4kkz4hlpwfb", name: "Supersebb", rank: "R4"}, { id: "3zzvu8xqw25", name: "Ado1111", rank: "Member"}, { id: "p958l8m1klb", name: "Aminos77", rank: "Member"}, { id: "b0waqcq4ct6", name: "Arczos", rank: "Member"}, { id: "898cmm00929", name: "B1wizz", rank: "Member"}, { id: "rxyql4n86u", name: "Be a wolf", rank: "Member"}, { id: "vzjuvot2k5l", name: "Bekim1", rank: "Member"}, { id: "jta8ykzkx2a", name: "BlackPush", rank: "Member"}, { id: "4gzoev8gh9m", name: "BlackWizardUA", rank: "Member"}, { id: "adxeco08vyb", name: "blacky12345", rank: "Member"}, { id: "owetho42tpi", name: "BLÀDE", rank: "Member"}, { id: "pl0x5dr9fqg", name: "BOREDOFTHISSHTGAME", rank: "Member"}, { id: "ij11pygwdlj", name: "Caretta", rank: "Member"}, { id: "ddnuxx34ikm", name: "Chasseur 777", rank: "Member"}, { id: "xgv988396p", name: "Cocsi29400", rank: "Member"}, { id: "ssno7klhdre", name: "Commander BLad", rank: "Member"}, { id: "tp8sxmr9kal", name: "Dario217", rank: "Member"}, { id: "qv0ctxpv9", name: "Darkknight", rank: "Member"}, { id: "q5hskqfj6n", name: "depechefann", rank: "Member"}, { id: "lu3bkraus1f", name: "Dfyra", rank: "Member"}, { id: "q0hj7kg11i", name: "DiamondDixie", rank: "Member"}, { id: "jgtrr1rfnno", name: "diRty freNk", rank: "Member"}, { id: "lgen6jizxm", name: "Edx77", rank: "Member"}, { id: "yzp6bkab5fd", name: "Ever4", rank: "Member"}, { id: "hzewkgctmyt", name: "F L A C", rank: "Member"}, { id: "qxro6ks5dv", name: "Faluche", rank: "Member"}, { id: "z066vfsi2z", name: "FireXice (Bibot)", rank: "Member"}, { id: "eceta2415l6", name: "Foggis", rank: "Member"}, { id: "znpjany9e5", name: "Gekkegerrittttt", rank: "Member"}, { id: "twffpd4bxqd", name: "GhósT", rank: "Member"}, { id: "cnoiz03cu5c", name: "GoFireES", rank: "Member"}, { id: "l71ele4rx6", name: "Gorkiules", rank: "Member"}, { id: "hxd0a7b01u7", name: "Gunnovic", rank: "Member"}, { id: "76txnlwge13", name: "Héra217", rank: "Member"}, { id: "c7h4559t0u", name: "ILYES B", rank: "Member"}, { id: "iezog2x1k98", name: "IRONHAMMER", rank: "Member"}, { id: "swf8dcbx57g", name: "Jadja", rank: "Member"}, { id: "vfxbrz6aqro", name: "Jaista", rank: "Member"}, { id: "f3tzz8kbroe", name: "jarako", rank: "Member"}, { id: "s1jfd2hpig", name: "jassådu", rank: "Member"}, { id: "mzt51lx4pi", name: "Jotersan", rank: "Member"}, { id: "k15ficxkbqb", name: "Juantxo79", rank: "Member"}, { id: "dbfnak347o7", name: "Juggernaut x", rank: "Member"}, { id: "smyeljtjps", name: "KezuaL", rank: "Member"}, { id: "w2jdb50iuim", name: "KFCPov3r", rank: "Member"}, { id: "9akuqzpbc5m", name: "KingStridez", rank: "Member"}, { id: "ps4gofl5b0i", name: "koppies", rank: "Member"}, { id: "is5du2cdxf", name: "KPShafty", rank: "Member"}, { id: "qik0m29g18i", name: "Kyuchie", rank: "Member"}, { id: "nr7i72pa02n", name: "Laeta", rank: "Member"}, { id: "g89sizmn4am", name: "Leka98", rank: "Member"}, { id: "ba160nnybwv", name: "Llama deDrama", rank: "Member"}, { id: "painwrjp29d", name: "Lutonian", rank: "Member"}, { id: "hu1x7lx3nys", name: "Mala Mimi", rank: "Member"}, { id: "72lvd6yudfu", name: "Maytos", rank: "Member"}, { id: "bqlp5lbpbva", name: "Megalomanie", rank: "Member"}, { id: "t06pnjo97o", name: "Meloziaa", rank: "Member"}, { id: "zmwzmo4qzma", name: "MorguiZeh", rank: "Member"}, { id: "yu21z2f6608", name: "MRan", rank: "Member"}, { id: "00x971cur744", name: "NinoDelBono", rank: "Member"}, { id: "hywj3qnnwts", name: "Nohardfeelz", rank: "Member"}, { id: "lakoazf1ku", name: "Novis01", rank: "Member"}, { id: "8s0ti9edh9x", name: "Oliviax", rank: "Member"}, { id: "5hqzrmp09bg", name: "olabaf", rank: "Member"}, { id: "wy1euux7vn", name: "oo APACHE oo", rank: "Member"}, { id: "cszaqufve1k", name: "Peckap", rank: "Member"}, { id: "uzp94ynbfta", name: "Prantuan", rank: "Member"}, { id: "dhic1v9lls", name: "RaMbo0", rank: "Member"}, { id: "db7g8r8pucp", name: "Raph911", rank: "Member"}, { id: "k8kyateu8tb", name: "Rev T", rank: "Member"}, { id: "y3v188ikskh", name: "Rikkyyyyy", rank: "Member"}, { id: "7twrqg71r5", name: "S A M U R A i", rank: "Member"}, { id: "4gqfx5vss2p", name: "Sarajevo Mfrcs", rank: "Member"}, { id: "wzhrjmo8d8", name: "SkyWinder", rank: "Member"}, { id: "k6hctcv5pkg", name: "Smâsh", rank: "Member"}, { id: "a4wjmizgce", name: "Smugwell", rank: "Member"}, { id: "ju1ut2s7pp8", name: "Swisskilla", rank: "Member"}, { id: "myedunkwsyp", name: "Temd", rank: "Member"}, { id: "p6ubvonqfn8", name: "TheFloh", rank: "Member"}, { id: "wm39sn901g", name: "theFoxXx", rank: "Member"}, { id: "zeduqp22byj", name: "Thirteen Squid", rank: "Member"}, { id: "62wm82wumwa", name: "Umbra XIII", rank: "Member"}, { id: "61tel2tbc9", name: "Vechniy", rank: "Member"}, { id: "qqtu4u2rj3", name: "Velvet Thunder 11", rank: "Member"}, { id: "nw8mrpfby68", name: "Villanueva 1", rank: "Member"}, { id: "vsgs52vbnfo", name: "xPerseus", rank: "Member"}, { id: "kbmf8uiamuh", name: "Xyz111111", rank: "Member"}, { id: "2w7n0cgq6cu", name: "Zoorglub", rank: "Member"}, { id: "zc6ordygl3g", name: "АЛЕКС1980", rank: "Member"}, { id: "dum47vk6xt9", name: "ЖЭКА", rank: "Member"}
].map(m => ({ ...m, id: m.id || generateId() }));

// --- DOM Elements ---
const memberListEl = document.getElementById('member-list');
const addMemberForm = document.getElementById('add-member-form');
const newMemberNameInput = document.getElementById('new-member-name');
const newMemberRankSelect = document.getElementById('new-member-rank');
const memberCountEl = document.getElementById('member-count');
const currentDateEl = document.getElementById('current-date');
const currentDayOfWeekEl = document.getElementById('current-day-of-week');
const currentConductorEl = document.getElementById('current-conductor');
const currentVipEl = document.getElementById('current-vip');
// const skippedVipsListEl = document.getElementById('skipped-vips').querySelector('ul'); // ENTFERNT
const scheduleDisplayListEl = document.getElementById('schedule-display').querySelector('ul');
const vipAcceptedBtn = document.getElementById('vip-accepted');
const vipSkippedBtn = document.getElementById('vip-skipped');
const undoAdvanceBtn = document.getElementById('undo-advance');
const mvpSelectionArea = document.getElementById('mvp-selection-area');
const mvpSelect = document.getElementById('mvp-select');
const resetBtn = document.getElementById('reset-data');
const mvpStatsListEl = document.getElementById('mvp-stats').querySelector('ul');
const vipStatsListEl = document.getElementById('vip-stats').querySelector('ul');
const alternativeVipArea = document.getElementById('alternative-vip-area');
const alternativeVipSelect = document.getElementById('alternative-vip-select');
const confirmAlternativeVipBtn = document.getElementById('confirm-alternative-vip');
const originalSkippedVipNameEl = document.getElementById('original-skipped-vip-name');
const lastCompletedDateEl = document.getElementById('last-completed-date');
const lastCompletedConductorEl = document.getElementById('last-completed-conductor');
const lastCompletedVipEl = document.getElementById('last-completed-vip');
const versionEl = document.getElementById('script-version');

// --- Utility Functions ---
function generateId() { return Math.random().toString(36).substring(2, 15); }
function getDayOfWeek(date) { return date.getDay(); } // 0=Sun, 1=Mon
function formatDate(date) { if (!(date instanceof Date) || isNaN(date)) return "Invalid Date"; return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }); }
function getISODateString(date) { if (!(date instanceof Date) || isNaN(date)) { console.error("Invalid date:", date); return new Date().toISOString().split('T')[0]; } return date.toISOString().split('T')[0]; }
function addDays(date, days) { const result = new Date(date); result.setDate(result.getDate() + days); return result; }
// function findNextMonday(date) { // Corrected version - Nicht mehr direkt verwendet, aber kann nützlich sein
//     const currentDay = getDayOfWeek(date);
//     const daysToAdd = (1 - currentDay + 7) % 7;
//     return addDays(date, daysToAdd);
// }
function getMemberById(id) { return state.members?.find(m => m?.id === id); }
function getMembersByRank(rank) { if (!Array.isArray(state.members)) return []; if (rank === 'R4/R5') return state.members.filter(m => m && (m.rank === 'R4' || m.rank === 'R5')); return state.members.filter(m => m && m.rank === rank); }

// --- Core Logic ---
function calculateDailyAssignments(targetDateStr, currentR4R5Index, currentMemberIndex, selectedMvpsMap, completedSubstitutes = []) {
    // currentSkippedVips wurde entfernt
    if (!targetDateStr || typeof currentR4R5Index !== 'number' || typeof currentMemberIndex !== 'number' || typeof selectedMvpsMap !== 'object' || !Array.isArray(completedSubstitutes)) {
        console.error("calculateDailyAssignments: Invalid parameters", {targetDateStr, currentR4R5Index, currentMemberIndex, selectedMvpsMap, completedSubstitutes});
        return { date: new Date(), conductor: { id: 'ERR_PARAM', name: 'Param Error C', rank: 'Sys' }, vip: { id: 'ERR_PARAM', name: 'Param Error V', rank: 'Sys'}, effectiveMemberIndex: currentMemberIndex };
    }
    const targetDate = new Date(targetDateStr + 'T00:00:00Z'); // UTC verwenden, um Zeitzonenprobleme zu minimieren
    if (isNaN(targetDate)) {
        console.error("calculateDailyAssignments: Invalid targetDate from string", targetDateStr);
        return { date: new Date(), conductor: { id: 'ERR_DATE', name: 'Date Error C', rank: 'Sys' }, vip: { id: 'ERR_DATE', name: 'Date Error V', rank: 'Sys'}, effectiveMemberIndex: currentMemberIndex };
    }

    const dayOfWeek = getDayOfWeek(targetDate);
    let conductor = null;
    let vip = null;
    const r4r5Members = getMembersByRank('R4/R5');
    const memberMembers = getMembersByRank('Member');
    let effectiveMemberIndex = currentMemberIndex; // Wird nur geändert, wenn ein regulärer VIP gefunden wird

    // Conductor bestimmen
    if (dayOfWeek === MVP_TECH_DAY) { // Montag
        const mvpKey = `${targetDateStr}_Mon`;
        const mvpId = selectedMvpsMap[mvpKey];
        conductor = mvpId ? getMemberById(mvpId) : { id: 'MVP_MON_SELECT', name: 'Tech MVP Needed', rank: 'MVP' };
    } else if (dayOfWeek === MVP_VS_DAY) { // Sonntag
        const mvpKey = `${targetDateStr}_Sun`;
        const mvpId = selectedMvpsMap[mvpKey];
        conductor = mvpId ? getMemberById(mvpId) : { id: 'MVP_SUN_SELECT', name: 'VS MVP Needed', rank: 'MVP' };
    } else { // Di-Sa
        conductor = r4r5Members.length > 0 ? r4r5Members[currentR4R5Index % r4r5Members.length] : { id: 'NO_R4R5', name: 'No R4/R5', rank: 'Sys' };
    }

    // VIP bestimmen (Skipped-Logik entfernt, direkt zu Membern)
    if (memberMembers.length > 0) {
        let potentialVip = null;
        let loopCheck = 0; // Verhindert Endlosschleifen, falls alle Member schon Substitute waren
        let tempMemberIndex = currentMemberIndex;

        while (!potentialVip && loopCheck < memberMembers.length) {
            const vipIndex = tempMemberIndex % memberMembers.length;
            const candidate = memberMembers[vipIndex];
            if (candidate && !completedSubstitutes.includes(candidate.id)) {
                potentialVip = candidate;
                effectiveMemberIndex = tempMemberIndex; // Index des gefundenen, validen VIPs
            } else {
                tempMemberIndex++; // Nächsten Member prüfen
                loopCheck++;
            }
        }
        if (potentialVip) {
            vip = potentialVip;
        } else {
            // Alle Member waren diese Runde schon Substitute oder es gibt keine Member mehr, die nicht Substitute waren
            vip = { id: 'NO_VALID_MEMBER', name: 'No valid Member left for VIP (all might be substitutes)', rank: 'Sys' };
            effectiveMemberIndex = currentMemberIndex; // Index nicht ändern, wenn kein valider VIP gefunden
        }
    } else {
        vip = { id: 'NO_MEMBERS', name: 'No Members Available for VIP', rank: 'Sys' };
        effectiveMemberIndex = currentMemberIndex; // Index nicht ändern
    }

    conductor = conductor || { id: 'ERR_C_FALLBACK', name: 'Err C Fallback', rank: 'Sys' };
    vip = vip || { id: 'ERR_V_FALLBACK', name: 'Err V Fallback', rank: 'Sys' };

    return { date: targetDate, conductor, vip, effectiveMemberIndex };
}

function recordDailyHistory(dateStr, conductorId, vipId, status) {
    if (!dateStr || !conductorId || !vipId) {
        console.warn("recordDailyHistory: Missing data for history entry", { dateStr, conductorId, vipId, status });
        return;
    }
    const conductor = getMemberById(conductorId);
    const vip = getMemberById(vipId);

    if (!state.rotationState.dailyHistory) {
        state.rotationState.dailyHistory = {};
    }
    state.rotationState.dailyHistory[dateStr] = {
        conductorId: conductorId,
        conductorName: conductor ? conductor.name : `ID:${conductorId}`,
        conductorRank: conductor ? conductor.rank : 'N/A',
        vipId: vipId,
        vipName: vip ? vip.name : `ID:${vipId}`,
        vipRank: vip ? vip.rank : 'N/A',
        status: status // z.B. 'Accepted', 'Skipped', 'Substitute'
    };
}

function advanceRotation(vipAccepted, selectedMvpId = null) { // Handles ACCEPT path ONLY
    if (!state.rotationState?.currentDate) {
        alert("Cannot advance: Rotation state not loaded.");
        return false;
    }
    const currentDateStr = state.rotationState.currentDate;
    const currentDate = new Date(currentDateStr + 'T00:00:00Z');
    const currentDayOfWeek = getDayOfWeek(currentDate);

    const currentR4R5Index = state.rotationState.r4r5Index ?? 0;
    const currentMemberIndex = state.rotationState.memberIndex ?? 0;
    // currentSkippedVips entfernt
    const currentVipCounts = { ...(state.rotationState.vipCounts || {}) };
    const currentMvpCounts = { ...(state.rotationState.mvpCounts || {}) };
    const currentSelectedMvps = { ...(state.rotationState.selectedMvps || {}) };
    const currentAlternativeVips = { ...(state.rotationState.alternativeVips || {}) }; // Bleibt für den Fall, dass es noch alte Daten gibt
    const currentSubstituteList = [...(state.rotationState.completedSubstituteVipsThisRound || [])];

    const { conductor: proposedConductor, vip: proposedVip, effectiveMemberIndex } = calculateDailyAssignments(
        currentDateStr,
        currentR4R5Index,
        currentMemberIndex,
        currentSelectedMvps,
        currentSubstituteList
    );

    if (!proposedVip?.id || proposedVip.id.startsWith('NO_') || proposedVip.id.startsWith('ERR_')) {
        alert("Cannot advance: No valid VIP was proposed for today.");
        return false;
    }
    if (!vipAccepted) { // Diese Funktion ist nur für den "Accepted" Pfad
        console.error("advanceRotation called with vipAccepted=false. This should not happen.");
        return false;
    }

    const proposedVipId = proposedVip.id;
    let nextR4R5Index = currentR4R5Index;
    let nextMemberIndex = effectiveMemberIndex + 1; // VIP wurde akzeptiert, also Index für nächsten VIP erhöhen

    // VIP Zählung
    currentVipCounts[proposedVipId] = (currentVipCounts[proposedVipId] || 0) + 1;

    // Rundenende für Substitute-Liste prüfen
    const memberMembers = getMembersByRank('Member');
    let finalSubstituteList = currentSubstituteList;
    if (memberMembers.length > 0 && (nextMemberIndex % memberMembers.length === 0) && nextMemberIndex > 0) {
        console.log("VIP Rotation Round End detected! Clearing completedSubstituteVipsThisRound list.");
        finalSubstituteList = [];
    }

    // Conductor Logik & Zählung
    let finalConductorId = proposedConductor.id;
    if (currentDayOfWeek >= 2 && currentDayOfWeek <= 6) { // Di-Sa: R4/R5 Rotation
        nextR4R5Index = (currentR4R5Index + 1);
    }
    if (selectedMvpId) { // MVP wurde für So/Mo ausgewählt
        const member = getMemberById(selectedMvpId);
        if (member) {
            const mvpKey = currentDayOfWeek === MVP_TECH_DAY ? `${currentDateStr}_Mon` : `${currentDateStr}_Sun`;
            currentSelectedMvps[mvpKey] = selectedMvpId;
            currentMvpCounts[selectedMvpId] = (currentMvpCounts[selectedMvpId] || 0) + 1;
            finalConductorId = selectedMvpId;
        } else {
            console.warn(`advanceRotation: Selected MVP ID ${selectedMvpId} not found.`);
        }
    }

    recordDailyHistory(currentDateStr, finalConductorId, proposedVipId, 'Accepted');

    const nextDate = addDays(currentDate, 1);
    const nextDateStr = getISODateString(nextDate);

    state.rotationState.currentDate = nextDateStr;
    state.rotationState.r4r5Index = nextR4R5Index;
    state.rotationState.memberIndex = nextMemberIndex;
    // state.rotationState.skippedVips = []; // ENTFERNT, da nicht mehr verwendet
    state.rotationState.selectedMvps = currentSelectedMvps;
    state.rotationState.vipCounts = currentVipCounts;
    state.rotationState.mvpCounts = currentMvpCounts;
    state.rotationState.alternativeVips = currentAlternativeVips; // Beibehalten für Kompatibilität mit alten Daten
    state.rotationState.completedSubstituteVipsThisRound = finalSubstituteList;
    // dailyHistory wurde bereits durch recordDailyHistory aktualisiert

    return true;
}

function updateFirestoreState() {
    const stateToSave = {
        members: state.members || [],
        rotationState: {
            currentDate: state.rotationState.currentDate,
            r4r5Index: state.rotationState.r4r5Index ?? 0,
            memberIndex: state.rotationState.memberIndex ?? 0,
            // skippedVips: [], // ENTFERNT
            selectedMvps: state.rotationState.selectedMvps || {},
            vipCounts: state.rotationState.vipCounts || {},
            mvpCounts: state.rotationState.mvpCounts || {},
            alternativeVips: state.rotationState.alternativeVips || {},
            completedSubstituteVipsThisRound: state.rotationState.completedSubstituteVipsThisRound || [],
            dailyHistory: state.rotationState.dailyHistory || {}
        }
    };
    return stateDocRef.set(stateToSave)
        .then(() => { /* console.log("Firestore state updated successfully."); */ })
        .catch((e) => { console.error("Firestore write FAIL:", e); alert(`Save Error: ${e.message}`); throw e; });
}

// --- Member Management ---
function addMember(event) {
    event.preventDefault();
    const name = newMemberNameInput.value.trim();
    const rank = newMemberRankSelect.value;
    if (name && rank) {
        if (!Array.isArray(state.members)) state.members = [];
        if (state.members.some(m => m?.name.toLowerCase() === name.toLowerCase())) {
            alert(`Member with name "${name}" already exists.`);
            return;
        }
        const newMember = { id: generateId(), name: name, rank: rank };
        state.members.push(newMember);
        sortMembers();
        updateFirestoreState().then(render); // render nach erfolgreichem Speichern
        newMemberNameInput.value = '';
    } else {
        alert("Name and Rank are required to add a member.");
    }
}

function removeMember(id) {
    const member = getMemberById(id);
    if (!member) return;
    if (confirm(`Are you sure you want to remove ${member.name}? This action cannot be undone.`)) {
        if (!Array.isArray(state.members)) state.members = [];
        state.members = state.members.filter(mb => mb?.id !== id);

        // Bereinige auch andere Listen, falls der Member dort vorkommt (obwohl skippedVips entfernt wurde)
        if (state.rotationState) {
            // if (Array.isArray(state.rotationState.skippedVips)) { // Logik für SkippedVips entfernt
            //     state.rotationState.skippedVips = state.rotationState.skippedVips.filter(sid => sid !== id);
            // }
            if (Array.isArray(state.rotationState.completedSubstituteVipsThisRound)) {
                state.rotationState.completedSubstituteVipsThisRound = state.rotationState.completedSubstituteVipsThisRound.filter(subId => subId !== id);
            }
            // Optional: VIP/MVP Counts für den gelöschten Member entfernen oder beibehalten? Aktuell bleiben sie.
        }
        updateFirestoreState().then(render);
    }
}

function handleRankChange(event) {
    const selectElement = event.target;
    const memberId = selectElement.dataset.memberId;
    const newRank = selectElement.value;
    const memberIndex = state.members.findIndex(m => m?.id === memberId);

    if (memberIndex === -1) {
        console.error("Member not found for rank change:", memberId);
        return;
    }
    const memberName = state.members[memberIndex].name;
    if (state.members[memberIndex].rank === newRank) return; // Keine Änderung

    if (confirm(`Change ${memberName}'s rank to ${newRank}?`)) {
        state.members[memberIndex].rank = newRank;
        sortMembers();
        updateFirestoreState().then(render);
    } else {
        selectElement.value = state.members[memberIndex].rank; // Auswahl zurücksetzen
    }
}

function sortMembers() {
    if (!Array.isArray(state.members)) return;
    const rankOrder = { 'R5': 1, 'R4': 2, 'Member': 3 };
    state.members.sort((a, b) => {
        const rankA = a?.rank;
        const rankB = b?.rank;
        const nameA = a?.name || "";
        const nameB = b?.name || "";
        const rankDiff = (rankOrder[rankA] || 99) - (rankOrder[rankB] || 99);
        if (rankDiff !== 0) return rankDiff;
        return nameA.localeCompare(nameB);
    });
}

// --- Rendering Functions ---
function renderMemberList() {
    memberListEl.innerHTML = '';
    if (!Array.isArray(state.members)) {
        memberCountEl.textContent = '0';
        memberListEl.innerHTML = '<li>Error loading members.</li>';
        return;
    }
    memberCountEl.textContent = state.members.length;
    sortMembers(); // Sicherstellen, dass die Liste sortiert ist vor dem Rendern

    if (state.members.length === 0) {
        memberListEl.innerHTML = '<li>No members in the alliance.</li>';
        return;
    }

    state.members.forEach(member => {
        if (!member?.id || !member.name || !member.rank) return; // Skip invalid member data

        const li = document.createElement('li');
        li.dataset.memberId = member.id;

        const infoDiv = document.createElement('div');
        infoDiv.classList.add('member-info');

        const nameSpan = document.createElement('span');
        nameSpan.textContent = member.name;
        infoDiv.appendChild(nameSpan);

        const rankSelect = document.createElement('select');
        rankSelect.classList.add('rank-select-inline');
        rankSelect.dataset.memberId = member.id;
        RANKS.forEach(rankValue => {
            const option = document.createElement('option');
            option.value = rankValue;
            option.textContent = rankValue;
            if (member.rank === rankValue) option.selected = true;
            rankSelect.appendChild(option);
        });
        rankSelect.addEventListener('change', handleRankChange);
        infoDiv.appendChild(rankSelect);

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('member-actions');
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.classList.add('btn-remove');
        removeButton.onclick = () => removeMember(member.id);
        actionsDiv.appendChild(removeButton);

        li.appendChild(infoDiv);
        li.appendChild(actionsDiv);
        memberListEl.appendChild(li);
    });
}

function renderCurrentDay() {
    if (!state.rotationState?.currentDate) {
        currentDateEl.textContent = "Loading state...";
        return;
    }
    const currentDateStr = state.rotationState.currentDate;
    const currentDate = new Date(currentDateStr + 'T00:00:00Z');

    if (isNaN(currentDate)) {
        currentDateEl.textContent = "Invalid Date in state!";
        currentDayOfWeekEl.textContent = "---";
        currentConductorEl.textContent = "---";
        currentVipEl.textContent = "---";
        return;
    }

    const dayOfWeek = getDayOfWeek(currentDate);
    const safeSelectedMvps = state.rotationState.selectedMvps || {};
    // safeSkippedVips entfernt
    const safeSubstitutes = state.rotationState.completedSubstituteVipsThisRound || [];

    const { conductor: calculatedConductor, vip: calculatedVip } = calculateDailyAssignments(
        currentDateStr,
        state.rotationState.r4r5Index ?? 0,
        state.rotationState.memberIndex ?? 0,
        safeSelectedMvps,
        safeSubstitutes
    );

    if (!calculatedConductor || !calculatedVip || calculatedConductor.id?.startsWith('ERR')) {
        currentDateEl.textContent = formatDate(currentDate);
        currentDayOfWeekEl.textContent = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
        currentConductorEl.textContent = "Error calculating conductor";
        currentVipEl.textContent = "Error calculating VIP";
        return;
    }

    currentDateEl.textContent = formatDate(currentDate);
    currentDayOfWeekEl.textContent = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

    let finalConductor = calculatedConductor;
    let isMvpSelectionNeeded = false;
    const mvpKey = dayOfWeek === MVP_TECH_DAY ? `${currentDateStr}_Mon` : `${currentDateStr}_Sun`;

    if (dayOfWeek === MVP_TECH_DAY || dayOfWeek === MVP_VS_DAY) {
        const selectedMvpId = safeSelectedMvps[mvpKey];
        if (selectedMvpId) {
            const storedMvp = getMemberById(selectedMvpId);
            if (storedMvp) {
                finalConductor = storedMvp;
                currentConductorEl.textContent = `${finalConductor.name} (${finalConductor.rank})`;
                mvpSelectionArea.style.display = 'none';
            } else {
                // MVP ID gespeichert, aber Member nicht mehr vorhanden (z.B. gelöscht)
                currentConductorEl.textContent = `Stored MVP (ID: ${selectedMvpId}) not found! Please select new.`;
                populateMvpSelect(); // Erlaube Neuauswahl
                mvpSelectionArea.style.display = 'block';
                mvpSelect.value = ""; // Reset Dropdown
                isMvpSelectionNeeded = true;
            }
        } else { // Kein MVP für diesen Tag ausgewählt
            currentConductorEl.innerHTML = `<span class="mvp-selection-required">${calculatedConductor.name}</span>`;
            populateMvpSelect();
            mvpSelectionArea.style.display = 'block';
            mvpSelect.value = "";
            isMvpSelectionNeeded = true;
        }
    } else { // Regulärer R4/R5 Tag
        currentConductorEl.textContent = `${finalConductor.name} (${finalConductor.rank})`;
        mvpSelectionArea.style.display = 'none';
    }

    const vipName = calculatedVip.name || "Unknown VIP";
    const vipRank = calculatedVip.rank || "N/A";
    let isVipActionPossible = false;

    if (calculatedVip.id === 'NO_MEMBERS' || calculatedVip.id.startsWith('ERR_') || calculatedVip.id === 'NO_VALID_MEMBER') {
        currentVipEl.textContent = vipName; // Zeigt Meldungen wie "No Members Available"
        document.getElementById('vip-actions').style.display = 'none';
    } else {
        currentVipEl.textContent = `${vipName} (${vipRank})`;
        document.getElementById('vip-actions').style.display = 'block';
        isVipActionPossible = true;
    }

    alternativeVipArea.style.display = 'none'; // Standardmäßig ausblenden
    vipAcceptedBtn.disabled = !isVipActionPossible || isMvpSelectionNeeded;
    vipSkippedBtn.disabled = !isVipActionPossible || isMvpSelectionNeeded;
    undoAdvanceBtn.disabled = !state.previousRotationState;
}

function populateMvpSelect() {
    mvpSelect.innerHTML = '<option value="">-- Select MVP --</option>';
    if (!Array.isArray(state.members)) return;
    // Hier könnte man filtern, um nur "Member" Rang für MVP Auswahl anzuzeigen, falls gewünscht
    // const memberRankMembers = getMembersByRank("Member");
    // memberRankMembers.forEach(m => { ... });
    state.members.forEach(m => { // Aktuell alle Mitglieder
        if (!m?.id) return;
        const option = document.createElement('option');
        option.value = m.id;
        option.textContent = `${m.name} (${m.rank})`;
        mvpSelect.appendChild(option);
    });
}

// function renderSkippedVips() { // FUNKTION ENTFERNT
//     // ...
// }

function renderSchedule() {
    scheduleDisplayListEl.innerHTML = '';
    if (!state.rotationState?.currentDate || !state.members) {
        scheduleDisplayListEl.innerHTML = '<li>Schedule not ready. Waiting for data...</li>';
        return;
    }

    const memberMembers = getMembersByRank('Member');
    // const skipped = []; // ENTFERNT, da skippedVips nicht mehr existiert
    const currentSubstitutes = state.rotationState.completedSubstituteVipsThisRound || [];
    const history = state.rotationState.dailyHistory || {};
    const todayForSchedule = new Date(state.rotationState.currentDate + 'T00:00:00Z');

    if (isNaN(todayForSchedule)) {
        console.error("Current date is invalid, cannot render schedule.");
        scheduleDisplayListEl.innerHTML = '<li>Error: Invalid current date for schedule.</li>';
        return;
    }

    const daysToShowPast = 3;
    const futureDaysNeeded = Math.max(7, memberMembers.length > 0 ? memberMembers.length + 5 : 7); // Angepasste Logik ohne Skipped

    // Vergangene Tage aus dem Verlauf rendern
    for (let i = daysToShowPast; i >= 1; i--) {
        const pastDate = addDays(todayForSchedule, -i);
        const pastDateStr = getISODateString(pastDate);
        const historyEntry = history[pastDateStr];

        const li = document.createElement('li');
        li.classList.add('past-day');
        const dateSpan = document.createElement('span');
        dateSpan.classList.add('schedule-date');
        dateSpan.textContent = formatDate(pastDate);

        const conductorSpan = document.createElement('span');
        conductorSpan.classList.add('schedule-conductor');
        const vipSpan = document.createElement('span');
        vipSpan.classList.add('schedule-vip');

        if (historyEntry) {
            conductorSpan.textContent = `C: ${historyEntry.conductorName} (${historyEntry.conductorRank || 'N/A'})`;
            let vipStatusText = historyEntry.status ? ` (${historyEntry.status})` : '';
            vipSpan.textContent = `VIP: ${historyEntry.vipName} (${historyEntry.vipRank || 'N/A'})${vipStatusText}`;
        } else {
            conductorSpan.textContent = `C: (No history for this day)`;
            vipSpan.textContent = `VIP: (No history for this day)`;
        }
        li.appendChild(dateSpan); li.appendChild(conductorSpan); li.appendChild(vipSpan);
        scheduleDisplayListEl.appendChild(li);
    }

    // Aktuellen und zukünftige Tage simulieren
    let simDate = new Date(todayForSchedule);
    let simR4R5Idx = state.rotationState.r4r5Index ?? 0;
    let simMemIdx = state.rotationState.memberIndex ?? 0;
    // tempSkipped entfernt
    let simMvps = JSON.parse(JSON.stringify(state.rotationState.selectedMvps || {})); // Tiefe Kopie für Simulation
    let simSubstitutes = [...currentSubstitutes]; // Kopie für Simulation

    for (let i = 0; i < futureDaysNeeded; i++) {
        if (isNaN(simDate)) {
            console.error("Simulation date became invalid.");
            break;
        }
        const dateStr = getISODateString(simDate);
        const dayOfWeek = getDayOfWeek(simDate);
        const isCurrentDay = (i === 0);

        const { conductor, vip, effectiveMemberIndex } = calculateDailyAssignments(
            dateStr,
            simR4R5Idx,
            simMemIdx,
            simMvps, // Übergebe die simulierten MVPs
            simSubstitutes // Übergebe die simulierten Substitute
        );

        if (!conductor.id?.startsWith('ERR') && !vip.id?.startsWith('ERR')) {
            const li = document.createElement('li');
            if (isCurrentDay) li.classList.add('current-day');

            const dateSpan = document.createElement('span');
            dateSpan.classList.add('schedule-date');
            dateSpan.textContent = formatDate(simDate);

            const conductorSpan = document.createElement('span');
            conductorSpan.classList.add('schedule-conductor');
            const conductorName = conductor.name || "?";
            const conductorRank = conductor.rank || "N/A";
            if (conductor.id === 'MVP_MON_SELECT' || conductor.id === 'MVP_SUN_SELECT') {
                 // Für die Zukunft müssen wir hier nicht prüfen, ob ein MVP in simMvps ist,
                 // da calculateDailyAssignments das bereits für den aktuellen Tag macht.
                 // Für zukünftige MVP-Tage wird der Platzhalter angezeigt.
                conductorSpan.innerHTML = `<span class="mvp-selection-required">${conductorName}</span>`;
            } else {
                conductorSpan.textContent = `C: ${conductorName} (${conductorRank})`;
            }

            const vipSpan = document.createElement('span');
            vipSpan.classList.add('schedule-vip');
            const vipName = vip.name || "?";
            const vipRank = vip.rank || "N/A";

            if (vip.id === 'NO_MEMBERS' || vip.id.startsWith('ERR_') || vip.id === 'NO_VALID_MEMBER') {
                vipSpan.textContent = vipName; // Zeigt Meldungen wie "No Members Available"
            } else {
                vipSpan.textContent = `VIP: ${vipName} (${vipRank})`;
                // Kein "(Skipped)" Suffix mehr nötig hier, da die Logik entfernt wurde
            }
            li.appendChild(dateSpan); li.appendChild(conductorSpan); li.appendChild(vipSpan);
            scheduleDisplayListEl.appendChild(li);
        } else {
            // Optional: Fehler im Schedule anzeigen
            const li = document.createElement('li');
            li.textContent = `${formatDate(simDate)}: Error calculating assignments for this day.`;
            scheduleDisplayListEl.appendChild(li);
        }


        // Simulation für den nächsten Tag vorbereiten
        let vipProcessedThisSimDay = false;
        if (vip?.id && !vip.id.startsWith('NO_') && !vip.id.startsWith('ERR_') && vip.id !== 'NO_VALID_MEMBER') {
            vipProcessedThisSimDay = true;
            // Wenn ein regulärer VIP gefunden wurde, wird der Index für den nächsten Tag erhöht
            simMemIdx = effectiveMemberIndex + 1;

            // Rundenende für Substitute-Liste in der Simulation prüfen
            const simMemberMembers = getMembersByRank('Member'); // Holt aktuelle Member-Liste
            if (simMemberMembers.length > 0 && (simMemIdx % simMemberMembers.length === 0) && simMemIdx > 0) {
                simSubstitutes = []; // Reset für die nächste simulierte Runde
            }
        } else {
            // Kein valider VIP gefunden (z.B. alle Member waren Substitute), Index nicht erhöhen
            simMemIdx = effectiveMemberIndex;
        }


        if (dayOfWeek >= 2 && dayOfWeek <= 6) { // Di-Sa
            simR4R5Idx++;
        }
        // Wichtig: selectedMvps (simMvps) wird in der Simulation nicht verändert,
        // da wir nicht wissen, wer in Zukunft MVP sein wird.
        // calculateDailyAssignments wird für zukünftige MVP-Tage den Platzhalter zurückgeben.

        simDate = addDays(simDate, 1);
    }
}

function renderStatistics() {
    mvpStatsListEl.innerHTML = '';
    vipStatsListEl.innerHTML = '';
    if (!state.members?.length) {
        mvpStatsListEl.innerHTML = '<li>No members to display stats for.</li>';
        vipStatsListEl.innerHTML = '<li>No members to display stats for.</li>';
        return;
    }

    const mvpCounts = state.rotationState.mvpCounts || {};
    const vipCounts = state.rotationState.vipCounts || {};
    const sortedMembers = [...state.members].sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));

    let hasMvpStats = false;
    sortedMembers.forEach(member => {
        if (!member?.id || !member.name) return;
        const count = mvpCounts[member.id] || 0;
        if (count > 0) hasMvpStats = true;
        const li = document.createElement('li');
        li.textContent = member.name;
        const countSpan = document.createElement('span');
        countSpan.classList.add('stats-count');
        countSpan.textContent = count;
        li.appendChild(countSpan);
        mvpStatsListEl.appendChild(li);
    });
    if (!hasMvpStats && sortedMembers.length > 0) {
        mvpStatsListEl.innerHTML = '<li>No MVPs have been assigned yet.</li>';
    }

    let hasVipStats = false;
    sortedMembers.forEach(member => {
        if (!member?.id || !member.name) return;
        const count = vipCounts[member.id] || 0;
        if (count > 0) hasVipStats = true;
        const li = document.createElement('li');
        li.textContent = member.name;
        const countSpan = document.createElement('span');
        countSpan.classList.add('stats-count');
        countSpan.textContent = count;
        li.appendChild(countSpan);
        vipStatsListEl.appendChild(li);
    });
    if (!hasVipStats && sortedMembers.length > 0) {
        vipStatsListEl.innerHTML = '<li>No VIPs have been assigned yet.</li>';
    }

    if (sortedMembers.length === 0) {
        mvpStatsListEl.innerHTML = '<li>No members in the alliance.</li>';
        vipStatsListEl.innerHTML = '<li>No members in the alliance.</li>';
    }
}

function renderLastCompletedDay() {
    lastCompletedDateEl.textContent = "---";
    lastCompletedConductorEl.textContent = "---";
    lastCompletedVipEl.textContent = "---";

    if (!state.rotationState?.currentDate) return;

    const today = new Date(state.rotationState.currentDate + 'T00:00:00Z');
    const lastDayDate = addDays(today, -1);
    const lastDateStr = getISODateString(lastDayDate);

    const historyEntry = state.rotationState.dailyHistory?.[lastDateStr];

    if (historyEntry) {
        lastCompletedDateEl.textContent = formatDate(lastDayDate);
        lastCompletedConductorEl.textContent = `${historyEntry.conductorName} (${historyEntry.conductorRank || 'N/A'})`;
        let vipStatusText = historyEntry.status ? ` (${historyEntry.status})` : '';
        lastCompletedVipEl.textContent = `${historyEntry.vipName} (${historyEntry.vipRank || 'N/A'})${vipStatusText}`;
    } else if (state.previousRotationState?.currentDate) {
        // Fallback, falls der allererste Tag nach einem Reset/Start noch keine History hat,
        // aber ein previousState existiert (z.B. nach Undo des ersten Tages).
        // Diese Logik ist komplexer und könnte vereinfacht werden, da History jetzt primär sein sollte.
        const prevDateFromUndo = new Date(state.previousRotationState.currentDate + 'T00:00:00Z');
        if (!isNaN(prevDateFromUndo) && getISODateString(prevDateFromUndo) === lastDateStr) {
            // Versuche, aus dem previousRotationState zu rekonstruieren (weniger zuverlässig als History)
            lastCompletedDateEl.textContent = formatDate(prevDateFromUndo);
            // Die Rekonstruktion von Conductor und VIP aus previousState ist fehleranfällig
            // und sollte idealerweise nicht mehr nötig sein, wenn History konsequent genutzt wird.
            // Hier nur eine Basis-Anzeige:
            lastCompletedConductorEl.textContent = "(Data from pre-history state)";
            lastCompletedVipEl.textContent = "(Data from pre-history state)";
        }
    }
}

function render() {
    renderMemberList();
    // renderSkippedVips(); // ENTFERNT
    renderCurrentDay();
    renderSchedule();
    renderStatistics();
    renderLastCompletedDay();
    undoAdvanceBtn.disabled = !state.previousRotationState;
    if (versionEl) {
        versionEl.textContent = SCRIPT_VERSION;
    }
}

// --- New/Updated Functions ---
function handleMvpDropdownChange() {
    if (mvpSelectionArea.style.display === 'block') {
        const selectedMvpValue = mvpSelect.value;
        const isMvpSelected = selectedMvpValue !== "";

        const vipElement = document.getElementById('current-vip');
        const vipTextContent = vipElement ? vipElement.textContent : "";
        // Prüfen, ob ein valider VIP angezeigt wird (nicht "No Members", "Error", etc.)
        const isVipDisplayValid = !(vipTextContent.includes("No Members") || vipTextContent.includes("Error") || vipTextContent.includes("No valid Member"));

        vipAcceptedBtn.disabled = !isMvpSelected || !isVipDisplayValid;
        vipSkippedBtn.disabled = !isMvpSelected || !isVipDisplayValid;
    } else {
        // Wenn MVP-Auswahl nicht sichtbar ist, sollten die Buttons basierend auf dem VIP-Status gesteuert werden
        // (wird in renderCurrentDay() schon gemacht)
    }
}

function populateAlternativeVipSelect() {
    alternativeVipSelect.innerHTML = '<option value="">-- No Alternative VIP --</option>';
    const memberRankMembers = getMembersByRank('Member');
    const substitutesAlreadyThisRound = state.rotationState.completedSubstituteVipsThisRound || [];
    const originallyProposedVipId = alternativeVipArea.dataset.originalVipId; // Der VIP, der geskippt wurde

    memberRankMembers.forEach(member => {
        if (!member?.id) return;
        // Ein Member kann nicht sich selbst als Alternative auswählen
        if (member.id === originallyProposedVipId) return;
        // Ein Member, der diese Runde schon Substitute war, sollte nicht nochmal als Substitute gewählt werden
        if (substitutesAlreadyThisRound.includes(member.id)) return;

        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = `${member.name} (${member.rank})`;
        alternativeVipSelect.appendChild(option);
    });
}

async function handleConfirmAlternativeVip() {
    const alternativeVipId = alternativeVipSelect.value; // Kann leer sein, wenn "No Alternative"
    const originallySkippedVipId = alternativeVipArea.dataset.originalVipId;
    const selectedMvpIdForToday = alternativeVipArea.dataset.selectedMvpId; // MVP, falls es ein MVP-Tag war

    if (!originallySkippedVipId) {
        alert("Error: Original VIP ID missing for skip confirmation.");
        return;
    }

    confirmAlternativeVipBtn.disabled = true;
    alternativeVipSelect.disabled = true;
    undoAdvanceBtn.disabled = true; // Verhindere Undo während dieser Operation

    const currentDateStr = state.rotationState.currentDate;
    const currentDate = new Date(currentDateStr + 'T00:00:00Z');
    const currentDayOfWeek = getDayOfWeek(currentDate);

    // Lade aktuellen State, um darauf aufzubauen
    const currentR4R5Index = state.rotationState.r4r5Index ?? 0;
    const currentMemberIndex = state.rotationState.memberIndex ?? 0; // WICHTIG: Dieser Index bleibt für den nächsten Tag gleich!
    const currentSelectedMvps = { ...(state.rotationState.selectedMvps || {}) };
    const currentVipCounts = { ...(state.rotationState.vipCounts || {}) };
    const currentMvpCounts = { ...(state.rotationState.mvpCounts || {}) };
    const currentAlternativeVips = { ...(state.rotationState.alternativeVips || {}) };
    let currentSubstituteList = [...(state.rotationState.completedSubstituteVipsThisRound || [])];

    // Conductor bestimmen (entweder MVP oder R4/R5)
    let finalConductorId = null;
    if (selectedMvpIdForToday) { // Es war ein MVP-Tag und ein MVP wurde ausgewählt
        const member = getMemberById(selectedMvpIdForToday);
        if (member) {
            currentMvpCounts[selectedMvpIdForToday] = (currentMvpCounts[selectedMvpIdForToday] || 0) + 1;
            const mvpKey = currentDayOfWeek === MVP_TECH_DAY ? `${currentDateStr}_Mon` : `${currentDateStr}_Sun`;
            currentSelectedMvps[mvpKey] = selectedMvpIdForToday;
            finalConductorId = selectedMvpIdForToday;
        } else {
            console.warn(`ConfirmAltVIP: MVP ID ${selectedMvpIdForToday} not found, but was passed.`);
            // Fallback: Versuche, den Conductor aus dem regulären Index zu nehmen (sollte nicht passieren)
            const r4r5Members = getMembersByRank('R4/R5');
            finalConductorId = r4r5Members.length > 0 ? r4r5Members[currentR4R5Index % r4r5Members.length]?.id || 'NO_R4R5_ALT' : 'NO_R4R5_ALT';
        }
    } else { // Regulärer R4/R5 Tag
        const r4r5Members = getMembersByRank('R4/R5');
        finalConductorId = r4r5Members.length > 0 ? r4r5Members[currentR4R5Index % r4r5Members.length]?.id || 'NO_R4R5_REG' : 'NO_R4R5_REG';
    }


    if (alternativeVipId) { // Ein alternativer VIP wurde ausgewählt
        const altVipMember = getMemberById(alternativeVipId);
        if (altVipMember) {
            currentVipCounts[alternativeVipId] = (currentVipCounts[alternativeVipId] || 0) + 1;
            currentAlternativeVips[currentDateStr] = alternativeVipId; // Speichere, wer eingesprungen ist
            if (!currentSubstituteList.includes(alternativeVipId)) {
                currentSubstituteList.push(alternativeVipId);
            }
            recordDailyHistory(currentDateStr, finalConductorId, alternativeVipId, 'Substitute');
        } else {
            console.warn(`ConfirmAltVIP: Alternative VIP ID ${alternativeVipId} not found.`);
            // Was tun, wenn der ausgewählte alternative VIP nicht existiert? Fehler anzeigen?
            // Fürs Erste: Tag als "Skipped" ohne Alternative behandeln
            recordDailyHistory(currentDateStr, finalConductorId, originallySkippedVipId, 'Skipped (Alt. Invalid)');
        }
    } else { // Kein alternativer VIP ausgewählt, der ursprüngliche VIP wurde einfach geskippt
        recordDailyHistory(currentDateStr, finalConductorId, originallySkippedVipId, 'Skipped');
    }

    // Rundenende für Substitute-Liste prüfen (basierend auf dem *nächsten* potenziellen VIP-Index)
    // Da der memberIndex nicht erhöht wird, wenn geskippt wird, ist diese Prüfung hier nicht direkt relevant
    // für den Reset der Substitute-Liste. Das passiert eher in advanceRotation.

    // Nächsten Tag vorbereiten
    let nextR4R5Index = currentR4R5Index;
    if (currentDayOfWeek >= 2 && currentDayOfWeek <= 6) { // Di-Sa: R4/R5 Rotation
        nextR4R5Index = (currentR4R5Index + 1);
    }
    const nextDate = addDays(currentDate, 1);
    const nextDateStr = getISODateString(nextDate);

    try {
        state.previousRotationState = JSON.parse(JSON.stringify(state.rotationState)); // Backup für Undo
    } catch (e) {
        console.error("Error creating previousRotationState for skip:", e);
        state.previousRotationState = null;
    }

    state.rotationState.currentDate = nextDateStr;
    state.rotationState.r4r5Index = nextR4R5Index;
    state.rotationState.memberIndex = currentMemberIndex; // WICHTIG: Bleibt gleich, damit der geskippte VIP am nächsten Tag dran ist
    // state.rotationState.skippedVips = []; // ENTFERNT
    state.rotationState.selectedMvps = currentSelectedMvps;
    state.rotationState.vipCounts = currentVipCounts;
    state.rotationState.mvpCounts = currentMvpCounts;
    state.rotationState.alternativeVips = currentAlternativeVips;
    state.rotationState.completedSubstituteVipsThisRound = currentSubstituteList;
    // dailyHistory wurde bereits aktualisiert

    try {
        await updateFirestoreState();
        alternativeVipArea.style.display = 'none'; // UI aufräumen
        // render() wird durch onSnapshot ausgelöst
    } catch (error) {
        console.error("Save failed after confirming alternative/skipped VIP:", error);
        alert("Error saving data after skip/substitute. Please check console and try again or undo.");
        // UI wieder aktivieren, damit Nutzer es erneut versuchen kann (oder Undo)
        confirmAlternativeVipBtn.disabled = false;
        alternativeVipSelect.disabled = false;
        // renderCurrentDay(); // Um UI ggf. zurückzusetzen
    }
}


// --- Event Listeners ---
addMemberForm.addEventListener('submit', addMember);

vipAcceptedBtn.addEventListener('click', () => handleVipAction(true));
vipSkippedBtn.addEventListener('click', () => handleVipAction(false));

mvpSelect.addEventListener('change', handleMvpDropdownChange);
confirmAlternativeVipBtn.addEventListener('click', handleConfirmAlternativeVip);


async function handleVipAction(accepted) {
    if (!state.rotationState?.currentDate) {
        alert("Rotation state is not loaded. Please wait or refresh.");
        return;
    }
    const currentDateStr = state.rotationState.currentDate;
    const currentDate = new Date(currentDateStr + 'T00:00:00Z');
    const dayOfWeek = getDayOfWeek(currentDate);
    let selectedMvpId = null;

    // MVP-Auswahl prüfen, falls es ein MVP-Tag ist
    if (dayOfWeek === MVP_TECH_DAY || dayOfWeek === MVP_VS_DAY) {
        const mvpKey = dayOfWeek === MVP_TECH_DAY ? `${currentDateStr}_Mon` : `${currentDateStr}_Sun`;
        const existingMvp = state.rotationState.selectedMvps?.[mvpKey];
        if (!existingMvp) { // Nur wenn noch kein MVP für diesen Tag in Firebase gespeichert ist
            selectedMvpId = mvpSelect.value;
            if (!selectedMvpId) {
                alert("Please select an MVP for today.");
                return;
            }
        } else {
            selectedMvpId = existingMvp; // Verwende den bereits gespeicherten MVP
        }
    }

    vipAcceptedBtn.disabled = true;
    vipSkippedBtn.disabled = true;
    undoAdvanceBtn.disabled = true; // Deaktiviere Undo während der Aktion
    alternativeVipArea.style.display = 'none'; // Verstecke Alternative-VIP-Bereich

    if (accepted) { // VIP ACCEPTED PATH
        try {
            state.previousRotationState = JSON.parse(JSON.stringify(state.rotationState));
        } catch (e) {
            console.error("Error creating previousRotationState for accept:", e);
            state.previousRotationState = null;
        }

        const success = advanceRotation(true, selectedMvpId); // true für vipAccepted
        if (success) {
            try {
                await updateFirestoreState();
                // render() wird durch onSnapshot ausgelöst
                // undoAdvanceBtn.disabled = !state.previousRotationState; // Wird in render() gesetzt
            } catch (error) {
                console.error("Failed to save state after VIP acceptance:", error);
                alert("Error saving data. The day might not have advanced correctly. Please check or undo.");
                renderCurrentDay(); // UI zurücksetzen auf den Stand vor dem fehlgeschlagenen Speichern
            }
        } else {
            // advanceRotation hat false zurückgegeben (z.B. kein valider VIP)
            alert("Could not advance the day. Please check the proposed VIP.");
            renderCurrentDay(); // UI aktualisieren, Buttons wieder aktivieren
        }
    } else { // VIP SKIPPED PATH
        const { vip: proposedVip } = calculateDailyAssignments(
            currentDateStr,
            state.rotationState.r4r5Index ?? 0,
            state.rotationState.memberIndex ?? 0,
            state.rotationState.selectedMvps || {},
            state.rotationState.completedSubstituteVipsThisRound || []
        );

        if (!proposedVip?.id || proposedVip.id.startsWith('NO_') || proposedVip.id.startsWith('ERR_')) {
            alert("Cannot process skip: No valid VIP was proposed for today.");
            renderCurrentDay(); // UI aktualisieren, Buttons wieder aktivieren
            return;
        }

        alternativeVipArea.dataset.originalVipId = proposedVip.id;
        alternativeVipArea.dataset.selectedMvpId = selectedMvpId || ""; // Speichere MVP-ID, falls vorhanden
        originalSkippedVipNameEl.textContent = proposedVip.name || "The proposed VIP";

        populateAlternativeVipSelect();
        alternativeVipArea.style.display = 'block';
        confirmAlternativeVipBtn.disabled = false;
        alternativeVipSelect.disabled = false;
        // vipAcceptedBtn und vipSkippedBtn bleiben disabled, bis Alternative bestätigt oder abgebrochen wird
    }
}

undoAdvanceBtn.addEventListener('click', async () => {
    if (!state.previousRotationState) {
        alert("No previous state available to undo.");
        return;
    }
    if (confirm("Are you sure you want to undo the last day advancement? This will revert to the previous day's state.")) {
        undoAdvanceBtn.disabled = true; // Verhindere mehrfaches Klicken
        try {
            // Stelle sicher, dass previousRotationState ein valides Objekt ist
            if (typeof state.previousRotationState !== 'object' || state.previousRotationState === null) {
                throw new Error("Invalid undo data structure.");
            }
            // Wichtig: Erstelle eine tiefe Kopie, um Referenzprobleme zu vermeiden
            state.rotationState = JSON.parse(JSON.stringify(state.previousRotationState));
            state.previousRotationState = null; // Es gibt keinen "Vor-Vorherigen" Zustand nach einem Undo
            await updateFirestoreState();
            // render() wird durch onSnapshot ausgelöst
        } catch (error) {
            console.error("Undo error:", error);
            alert("Error during undo operation: " + error.message + "\nThe state might be inconsistent. Please check carefully or consider a reset if problems persist.");
            undoAdvanceBtn.disabled = false; // Wieder aktivieren, falls fehlgeschlagen
        }
    }
});

resetBtn.addEventListener('click', async () => {
    if (confirm("!! WARNING !! This will reset ALL rotation data (current day, VIP/MVP counts, history) to the initial defaults and use the member list defined in the code. This cannot be undone! Are you absolutely sure?")) {
        if (confirm("SECOND WARNING: Confirm again to reset all data. Your current member list and all progress will be lost and replaced by the defaults.")) {
            resetBtn.disabled = true;
            const resetStartDateStr = "2025-04-21"; // Dein definiertes Startdatum für Reset

            // Verwende initialMembers für den Reset
            state.members = initialMembers.map(m => ({ ...m, id: m.id || generateId() }));
            state.rotationState = {
                currentDate: resetStartDateStr,
                r4r5Index: 0,
                memberIndex: 0,
                // skippedVips: [], // ENTFERNT
                selectedMvps: {},
                vipCounts: {},
                mvpCounts: {},
                alternativeVips: {},
                completedSubstituteVipsThisRound: [],
                dailyHistory: {} // Verlauf auch zurücksetzen
            };
            state.previousRotationState = null; // Kein Undo-Status nach Reset

            try {
                await updateFirestoreState();
                alert(`All data has been reset to defaults. The rotation will start from ${formatDate(new Date(resetStartDateStr + 'T00:00:00Z'))}. The page will now refresh to apply changes.`);
                window.location.reload(); // Neu laden, um sicherzustellen, dass alles frisch ist
            } catch (error) {
                console.error("Reset error:", error);
                alert("Error resetting data. Please check the console. " + error.message);
                resetBtn.disabled = false; // Wieder aktivieren, falls fehlgeschlagen
            }
        }
    }
});


// --- Initialization and Realtime Updates ---
stateDocRef.onSnapshot((doc) => {
    console.log("Firestore data received/updated.");
    const localPrevStateForUndo = state.previousRotationState; // Bewahre den lokalen Undo-State, falls vorhanden

    if (doc.exists) {
        const data = doc.data();
        console.log("Document data from Firestore:", JSON.parse(JSON.stringify(data))); // Für Debugging

        // Mitglieder laden:
        // Wenn Firebase 'members' hat und es nicht leer ist, nimm das.
        // Sonst (wenn 'members' fehlt oder leer ist), nimm initialMembers als Fallback.
        const loadedMembersRaw = data.members;
        if (Array.isArray(loadedMembersRaw) && loadedMembersRaw.length > 0) {
            state.members = loadedMembersRaw.map(m => ({ ...m, id: m.id || generateId() }));
        } else {
            // Nur wenn Firebase keine Member-Daten hat, initialMembers verwenden (passiert selten nach Erstinitialisierung)
            // Dies sollte nicht passieren, wenn das Tool bereits läuft, da 'members' immer vorhanden sein sollte.
            // Ist eher ein Sicherheitsnetz für eine korrupte DB oder einen sehr frühen Zustand.
            console.warn("No members array found in Firestore or it was empty. Falling back to initialMembers. This might indicate an issue if data was expected.");
            state.members = initialMembers.map(m => ({ ...m, id: m.id || generateId() }));
            // Hier könnte man entscheiden, ob man bei diesem Fall automatisch in die DB schreibt.
            // Fürs Erste nicht, um Überschreiben zu vermeiden, falls es ein temporärer Lesefehler war.
        }

        const loadedRotState = data.rotationState || {};
        state.rotationState = {
            currentDate: loadedRotState.currentDate, // Wird unten ggf. korrigiert
            r4r5Index: loadedRotState.r4r5Index ?? 0,
            memberIndex: loadedRotState.memberIndex ?? 0,
            // skippedVips: [], // ENTFERNT
            selectedMvps: loadedRotState.selectedMvps || {},
            vipCounts: loadedRotState.vipCounts || {},
            mvpCounts: loadedRotState.mvpCounts || {},
            alternativeVips: loadedRotState.alternativeVips || {}, // Für Kompatibilität
            completedSubstituteVipsThisRound: loadedRotState.completedSubstituteVipsThisRound || [],
            dailyHistory: loadedRotState.dailyHistory || {}
        };
        state.previousRotationState = localPrevStateForUndo; // Wiederherstellen des lokalen Undo-States

        let needsSaveToFirebase = false;
        // Datumsprüfung und -korrektur
        if (!state.rotationState.currentDate || isNaN(new Date(state.rotationState.currentDate + 'T00:00:00Z'))) {
            console.warn("Current date from Firebase is invalid or missing. Resetting date to default start: 2025-04-21.");
            state.rotationState.currentDate = "2025-04-21"; // Dein Standard-Startdatum
            // Sicherstellen, dass andere wichtige Felder initialisiert sind, falls der State korrumpiert war
            if (!state.rotationState.selectedMvps) state.rotationState.selectedMvps = {};
            if (!state.rotationState.vipCounts) state.rotationState.vipCounts = {};
            if (!state.rotationState.mvpCounts) state.rotationState.mvpCounts = {};
            if (!state.rotationState.alternativeVips) state.rotationState.alternativeVips = {};
            if (!state.rotationState.completedSubstituteVipsThisRound) state.rotationState.completedSubstituteVipsThisRound = [];
            if (!state.rotationState.dailyHistory) state.rotationState.dailyHistory = {};
            needsSaveToFirebase = true;
        }

        // Sicherstellen, dass alle notwendigen Felder im rotationState existieren, auch wenn sie aus alten Daten fehlen
        const defaultRotationStateFields = {
            selectedMvps: {}, vipCounts: {}, mvpCounts: {}, alternativeVips: {},
            completedSubstituteVipsThisRound: [], dailyHistory: {}
        };
        for (const key in defaultRotationStateFields) {
            if (state.rotationState[key] === undefined) {
                console.warn(`Rotation state field '${key}' was missing. Initializing with default.`);
                state.rotationState[key] = defaultRotationStateFields[key];
                needsSaveToFirebase = true;
            }
        }


        if (needsSaveToFirebase) {
            console.log("Attempting to save corrected state to Firebase.");
            updateFirestoreState().catch(err => console.error("Automatic state correction save FAIL:", err));
        }

    } else {
        // Dokument existiert NICHT: Das ist der EINZIGE Fall für eine komplette Initialisierung mit initialMembers
        console.log("No existing Firebase document 's749_state' found. Initializing with default members and start date.");
        const defaultStartDate = "2025-04-21";
        state = {
            members: initialMembers.map(m => ({ ...m, id: m.id || generateId() })),
            rotationState: {
                currentDate: defaultStartDate,
                r4r5Index: 0,
                memberIndex: 0,
                // skippedVips: [], // ENTFERNT
                selectedMvps: {},
                vipCounts: {},
                mvpCounts: {},
                alternativeVips: {},
                completedSubstituteVipsThisRound: [],
                dailyHistory: {}
            },
            previousRotationState: null
        };
        // Beim allerersten Mal den initialen Zustand in Firebase schreiben
        updateFirestoreState().catch(err => console.error("Initial setup save to Firebase FAIL:", err));
    }

    render(); // UI immer aktualisieren, nachdem der State (aus DB oder initial) gesetzt wurde
    resetBtn.disabled = false; // Reset-Button immer aktivieren, nachdem geladen wurde

}, (error) => {
    console.error("Firestore Listener FATAL ERROR:", error);
    alert(`FATAL DATABASE ERROR (${error.message}). The application might not work correctly. Please check your internet connection, Firebase configuration, and Firestore rules. See console for details.`);
    // Hier könnte man UI-Elemente deaktivieren, um weitere Fehler zu vermeiden
    document.body.innerHTML = `<div style="padding: 20px; text-align: center; color: red;">
        <h1>Application Error</h1>
        <p>Could not connect to the database or a critical error occurred.</p>
        <p>Please check the browser console for more details and try refreshing the page later.</p>
        <p>Error: ${error.message}</p>
        </div>`;
});
