const SCRIPT_VERSION = "5.7.1"; // Corrected syntax error from leftover code after saveNewName
// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyAT8L9vDqFHyGB-MybtcLEBgCALuNflTZY", // Bitte durch deinen echten Key ersetzen, falls dieser nur ein Platzhalter ist
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
        selectedMvps: {},
        vipCounts: {},
        mvpCounts: {},
        alternativeVips: {},
        completedSubstituteVipsThisRound: [],
        dailyHistory: {}
    },
    previousRotationState: null,
    editingMemberId: null,
    editingVipCountMemberId: null
};

// --- Initial Data (WIRD NUR BEIM ALLERERSTEN START ODER RESET VERWENDET) ---
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
function getDayOfWeek(date) { return date.getDay(); }
function formatDate(date) { if (!(date instanceof Date) || isNaN(date)) return "Invalid Date"; return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }); }
function getISODateString(date) { if (!(date instanceof Date) || isNaN(date)) { console.error("Invalid date:", date); return new Date().toISOString().split('T')[0]; } return date.toISOString().split('T')[0]; }
function addDays(date, days) { const result = new Date(date); result.setDate(result.getDate() + days); return result; }
function getMemberById(id) { return state.members?.find(m => m?.id === id); }
function getMembersByRank(rank) { if (!Array.isArray(state.members)) return []; if (rank === 'R4/R5') return state.members.filter(m => m && (m.rank === 'R4' || m.rank === 'R5')); return state.members.filter(m => m && m.rank === rank); }

// --- Core Logic ---
function calculateDailyAssignments(targetDateStr, currentR4R5Index, currentMemberIndex, selectedMvpsMap, completedSubstitutes = []) {
    if (!targetDateStr || typeof currentR4R5Index !== 'number' || typeof currentMemberIndex !== 'number' || typeof selectedMvpsMap !== 'object' || !Array.isArray(completedSubstitutes)) {
        console.error("calculateDailyAssignments: Invalid parameters", {targetDateStr, currentR4R5Index, currentMemberIndex, selectedMvpsMap, completedSubstitutes});
        return { date: new Date(), conductor: { id: 'ERR_PARAM', name: 'Param Error C', rank: 'Sys' }, vip: { id: 'ERR_PARAM', name: 'Param Error V', rank: 'Sys'}, effectiveMemberIndex: currentMemberIndex };
    }
    const targetDate = new Date(targetDateStr + 'T00:00:00Z');
    if (isNaN(targetDate)) {
        console.error("calculateDailyAssignments: Invalid targetDate from string", targetDateStr);
        return { date: new Date(), conductor: { id: 'ERR_DATE', name: 'Date Error C', rank: 'Sys' }, vip: { id: 'ERR_DATE', name: 'Date Error V', rank: 'Sys'}, effectiveMemberIndex: currentMemberIndex };
    }

    const dayOfWeek = getDayOfWeek(targetDate);
    let conductor = null;
    let vip = null;
    const r4r5Members = getMembersByRank('R4/R5');
    const memberMembers = getMembersByRank('Member');
    let effectiveMemberIndex = currentMemberIndex;

    if (dayOfWeek === MVP_TECH_DAY) {
        const mvpKey = `${targetDateStr}_Mon`;
        const mvpId = selectedMvpsMap[mvpKey];
        conductor = mvpId ? getMemberById(mvpId) : { id: 'MVP_MON_SELECT', name: 'Tech MVP Needed', rank: 'MVP' };
    } else if (dayOfWeek === MVP_VS_DAY) {
        const mvpKey = `${targetDateStr}_Sun`;
        const mvpId = selectedMvpsMap[mvpKey];
        conductor = mvpId ? getMemberById(mvpId) : { id: 'MVP_SUN_SELECT', name: 'VS MVP Needed', rank: 'MVP' };
    } else {
        conductor = r4r5Members.length > 0 ? r4r5Members[currentR4R5Index % r4r5Members.length] : { id: 'NO_R4R5', name: 'No R4/R5', rank: 'Sys' };
    }

    if (memberMembers.length > 0) {
        let potentialVip = null;
        let loopCheck = 0;
        let tempMemberIndex = currentMemberIndex;
        // console.log("calculateDailyAssignments: Checking for VIP. currentMemberIndex:", currentMemberIndex, "completedSubstitutes:", JSON.stringify(completedSubstitutes));

        while (!potentialVip && loopCheck < memberMembers.length * 2) { // Increased loopCheck limit for safety
            const vipIndex = tempMemberIndex % memberMembers.length;
            const candidate = memberMembers[vipIndex];

            // if (candidate) {
            //     console.log(`calculateDailyAssignments: Candidate: ${candidate.name} (ID: ${candidate.id}), In completedSubstitutes: ${completedSubstitutes.includes(candidate.id)}`);
            // } else {
            //     console.log(`calculateDailyAssignments: Candidate at index ${vipIndex} is undefined.`);
            // }

            if (candidate && !completedSubstitutes.includes(candidate.id)) {
                potentialVip = candidate;
                effectiveMemberIndex = tempMemberIndex; // Hier den Index speichern, der zum potentialVip führt
            }
            tempMemberIndex++; // Immer erhöhen, um weiterzusuchen
            loopCheck++;
        }
        if (potentialVip) {
            vip = potentialVip;
        } else {
            vip = { id: 'NO_VALID_MEMBER', name: 'No valid Member left for VIP', rank: 'Sys' };
            effectiveMemberIndex = currentMemberIndex;
        }
    } else {
        vip = { id: 'NO_MEMBERS', name: 'No Members Available for VIP', rank: 'Sys' };
        effectiveMemberIndex = currentMemberIndex;
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
        status: status
    };
}

function advanceRotation(vipAccepted, selectedMvpId = null) {
    if (!state.rotationState?.currentDate) {
        alert("Cannot advance: Rotation state not loaded.");
        return false;
    }
    if (!vipAccepted) {
        console.error("advanceRotation called with vipAccepted=false. This should be handled by handleConfirmAlternativeVip or similar.");
        return false;
    }

    const currentDateStr = state.rotationState.currentDate;
    const currentDate = new Date(currentDateStr + 'T00:00:00Z');
    const currentDayOfWeek = getDayOfWeek(currentDate);

    const currentR4R5Index = state.rotationState.r4r5Index ?? 0;
    const currentMemberIndex = state.rotationState.memberIndex ?? 0; // Der Index, mit dem calculateDailyAssignments startet
    const currentVipCounts = { ...(state.rotationState.vipCounts || {}) };
    const currentMvpCounts = { ...(state.rotationState.mvpCounts || {}) };
    const currentSelectedMvps = { ...(state.rotationState.selectedMvps || {}) };
    const currentSubstituteList = [...(state.rotationState.completedSubstituteVipsThisRound || [])];

    const { conductor: proposedConductor, vip: proposedVip, effectiveMemberIndex } = calculateDailyAssignments(
        currentDateStr,
        currentR4R5Index,
        currentMemberIndex, // Hier den rohen memberIndex übergeben
        currentSelectedMvps,
        currentSubstituteList
    );

    if (!proposedVip?.id || proposedVip.id.startsWith('NO_') || proposedVip.id.startsWith('ERR_')) {
        alert("Cannot advance: No valid VIP was proposed for today.");
        return false;
    }

    const proposedVipId = proposedVip.id;
    let nextR4R5Index = currentR4R5Index;
    // Verwende den effectiveMemberIndex, den calculateDailyAssignments zurückgibt, für die Berechnung des nächsten Index
    let nextMemberIndex = effectiveMemberIndex + 1;

    currentVipCounts[proposedVipId] = (currentVipCounts[proposedVipId] || 0) + 1;

    // === HIER DEN NEUEN CODE EINFÜGEN START ===
    // Auch regulär akzeptierte VIPs zur Liste hinzufügen, wenn sie nicht schon drin sind.
    // Das stellt sicher, dass sie in dieser Runde nicht erneut als regulärer VIP drankommen.
    let finalSubstituteList = [...currentSubstituteList]; // Kopie erstellen
    if (getMemberById(proposedVipId)?.rank === 'Member' && !finalSubstituteList.includes(proposedVipId)) {
        finalSubstituteList.push(proposedVipId);
        console.log(`advanceRotation: ${proposedVip.name} (ID: ${proposedVipId}) added to completedSubstituteVipsThisRound as they were the accepted VIP.`);
    }
    // === HIER DEN NEUEN CODE EINFÜGEN ENDE ===

    const memberMembers = getMembersByRank('Member');
    // Die finalSubstituteList wird hier weiterverwendet (nicht neu initialisiert mit currentSubstituteList)
    
    // Robusteres Leeren der Substitute-Liste
    if (memberMembers.length > 0) {
        // Prüfen, ob ALLE aktuellen Member-Mitglieder in der (potenziell gerade erweiterten) finalSubstituteList sind
        const allCurrentMembersAreSubstitutes = memberMembers.every(mem => finalSubstituteList.includes(mem.id));
        if (allCurrentMembersAreSubstitutes) {
            console.log("VIP Rotation Round End (all members were in substitute list)! Clearing completedSubstituteVipsThisRound.");
            finalSubstituteList = []; // Liste leeren für die neue Runde
        }
    }
    // Die alte Modulo-Bedingung ist jetzt weniger relevant, wenn .every() verwendet wird.

    let finalConductorId = proposedConductor.id;
    if (currentDayOfWeek >= 2 && currentDayOfWeek <= 6) { // Di-Sa
        nextR4R5Index = (currentR4R5Index + 1);
    }
    if (selectedMvpId) {
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
    state.rotationState.selectedMvps = currentSelectedMvps;
    state.rotationState.vipCounts = currentVipCounts;
    state.rotationState.mvpCounts = currentMvpCounts;
    state.rotationState.completedSubstituteVipsThisRound = finalSubstituteList; // Die aktualisierte Liste speichern
    return true;
}

function updateFirestoreState() {
    const stateToSave = JSON.parse(JSON.stringify({
        members: state.members || [],
        rotationState: {
            currentDate: state.rotationState.currentDate,
            r4r5Index: state.rotationState.r4r5Index ?? 0,
            memberIndex: state.rotationState.memberIndex ?? 0,
            selectedMvps: state.rotationState.selectedMvps || {},
            vipCounts: state.rotationState.vipCounts || {},
            mvpCounts: state.rotationState.mvpCounts || {},
            alternativeVips: state.rotationState.alternativeVips || {},
            completedSubstituteVipsThisRound: state.rotationState.completedSubstituteVipsThisRound || [],
            dailyHistory: state.rotationState.dailyHistory || {}
        }
    }));
    delete stateToSave.editingMemberId;
    delete stateToSave.editingVipCountMemberId;

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
        
        // --- BEGINN: Logik zur Anpassung des memberIndex beim Hinzufügen ---
        let trueNextVipIdBeforeChange = null;
        if (rank === 'Member' && state.rotationState && typeof state.rotationState.memberIndex === 'number') {
            const memberMembersBeforeAdd = getMembersByRank('Member');
            if (memberMembersBeforeAdd.length > 0) {
                let tempSearchIndex = state.rotationState.memberIndex;
                let foundNextVip = null;
                let iterations = 0;
                while (!foundNextVip && iterations < memberMembersBeforeAdd.length * 2) {
                    const candidateIndex = tempSearchIndex % memberMembersBeforeAdd.length;
                    const candidate = memberMembersBeforeAdd[candidateIndex];
                    if (candidate && !(state.rotationState.completedSubstituteVipsThisRound || []).includes(candidate.id)) {
                        foundNextVip = candidate;
                        trueNextVipIdBeforeChange = foundNextVip.id;
                    }
                    tempSearchIndex++;
                    iterations++;
                }
                if(trueNextVipIdBeforeChange) console.log(`addMember: Next scheduled VIP before add was ID: ${trueNextVipIdBeforeChange}`);
            }
        }
        // --- ENDE: Logik zur Anpassung des memberIndex beim Hinzufügen ---

        state.members.push(newMember);
        sortMembers(); // Sortieren NACH dem Hinzufügen

        // --- BEGINN: memberIndex anpassen nach Hinzufügen und Sortieren ---
        if (rank === 'Member' && trueNextVipIdBeforeChange) {
            const memberMembersAfterAdd = getMembersByRank('Member');
            const newIndexOfTrueNextVip = memberMembersAfterAdd.findIndex(m => m.id === trueNextVipIdBeforeChange);
            if (newIndexOfTrueNextVip !== -1) {
                state.rotationState.memberIndex = newIndexOfTrueNextVip;
                console.log(`addMember: MemberIndex after add and sort set to ${newIndexOfTrueNextVip} for VIP ID ${trueNextVipIdBeforeChange}`);
            } else {
                 console.warn(`addMember: Could not find previously scheduled VIP ID ${trueNextVipIdBeforeChange} after add. Index not adjusted.`);
            }
        } else if (rank === 'Member' && memberMembersAfterAdd.length === 1) { // Wenn es das erste Member-Mitglied ist
            state.rotationState.memberIndex = 0; // Starte beim ersten Mitglied
            console.log(`addMember: First member added, memberIndex set to 0.`);
        }
        // --- ENDE: memberIndex anpassen nach Hinzufügen und Sortieren ---
        
        updateFirestoreState().then(render);
        newMemberNameInput.value = '';
    } else {
        alert("Name and Rank are required to add a member.");
    }
}

function removeMember(id) {
    const memberToRemove = getMemberById(id);
    if (!memberToRemove) return;

    if (confirm(`Are you sure you want to remove ${memberToRemove.name}? This action cannot be undone.`)) {
        // --- BEGINN: Logik zur Anpassung des memberIndex beim Entfernen ---
        let trueNextVipIdBeforeChange = null;
        let wasRemovedMemberNext = false;

        if (memberToRemove.rank === 'Member' && state.rotationState && typeof state.rotationState.memberIndex === 'number') {
            const memberMembersBeforeRemove = getMembersByRank('Member');
            if (memberMembersBeforeRemove.length > 0) {
                let tempSearchIndex = state.rotationState.memberIndex;
                let foundNextVip = null;
                let iterations = 0;
                while (!foundNextVip && iterations < memberMembersBeforeRemove.length * 2) {
                    const candidateIndex = tempSearchIndex % memberMembersBeforeRemove.length;
                    const candidate = memberMembersBeforeRemove[candidateIndex];
                    if (candidate && !(state.rotationState.completedSubstituteVipsThisRound || []).includes(candidate.id)) {
                        foundNextVip = candidate;
                        if (foundNextVip.id === id) { // Das zu löschende Mitglied wäre als nächstes dran
                            wasRemovedMemberNext = true;
                        } else {
                            trueNextVipIdBeforeChange = foundNextVip.id;
                        }
                    }
                    tempSearchIndex++;
                    iterations++;
                }
                 if(trueNextVipIdBeforeChange) console.log(`removeMember: Next VIP before removing ${memberToRemove.name} was ID: ${trueNextVipIdBeforeChange}`);
                 if(wasRemovedMemberNext) console.log(`removeMember: The member to be removed (${memberToRemove.name}) was the next scheduled VIP.`);
            }
        }
        // --- ENDE: Logik zur Anpassung des memberIndex beim Entfernen ---

        state.members = state.members.filter(mb => mb?.id !== id);
        sortMembers(); // Sortieren NACH dem Entfernen (obwohl für Indexanpassung nicht direkt nötig, aber für Konsistenz)

        // --- BEGINN: memberIndex anpassen nach Entfernen ---
        if (memberToRemove.rank === 'Member' && state.rotationState) {
            const memberMembersAfterRemove = getMembersByRank('Member');
            if (wasRemovedMemberNext) {
                // Wenn das entfernte Mitglied das nächste war, bleibt der memberIndex an seiner Position,
                // und calculateDailyAssignments wird den dann NÄCHSTEN in der (jetzt kürzeren) Liste finden.
                // Es muss sichergestellt werden, dass der Index nicht out of bounds ist.
                if (memberMembersAfterRemove.length > 0) {
                    state.rotationState.memberIndex = state.rotationState.memberIndex % memberMembersAfterRemove.length;
                } else {
                    state.rotationState.memberIndex = 0; // Keine Member mehr da
                }
                console.log(`removeMember: Removed member was next. MemberIndex is now ${state.rotationState.memberIndex} (adjusted for new length).`);
            } else if (trueNextVipIdBeforeChange) {
                const newIndexOfTrueNextVip = memberMembersAfterRemove.findIndex(m => m.id === trueNextVipIdBeforeChange);
                if (newIndexOfTrueNextVip !== -1) {
                    state.rotationState.memberIndex = newIndexOfTrueNextVip;
                    console.log(`removeMember: MemberIndex after remove set to ${newIndexOfTrueNextVip} for VIP ID ${trueNextVipIdBeforeChange}`);
                } else {
                    // Der ehemals nächste VIP ist nicht mehr da (sollte nicht passieren, wenn er nicht der gelöschte war)
                    // oder die Liste ist jetzt kürzer und der alte Index ist out of bounds.
                    // Setze auf einen validen Index.
                     if (memberMembersAfterRemove.length > 0) {
                        state.rotationState.memberIndex = Math.min(state.rotationState.memberIndex, memberMembersAfterRemove.length -1);
                        if (state.rotationState.memberIndex < 0) state.rotationState.memberIndex = 0;
                     } else {
                        state.rotationState.memberIndex = 0;
                     }
                    console.warn(`removeMember: Could not find previously scheduled VIP ID ${trueNextVipIdBeforeChange} or index out of bounds. MemberIndex adjusted to ${state.rotationState.memberIndex}.`);
                }
            } else if (memberMembersAfterRemove.length > 0) { // Weder war der gelöschte der nächste, noch gab es einen anderen "nächsten" (z.B. alle waren subs)
                 state.rotationState.memberIndex = state.rotationState.memberIndex % memberMembersAfterRemove.length;
            } else {
                 state.rotationState.memberIndex = 0;
            }
        }
        // --- ENDE: memberIndex anpassen nach Entfernen ---


        if (state.rotationState) {
            if (Array.isArray(state.rotationState.completedSubstituteVipsThisRound)) {
                state.rotationState.completedSubstituteVipsThisRound = state.rotationState.completedSubstituteVipsThisRound.filter(subId => subId !== id);
            }
            if (state.rotationState.vipCounts && state.rotationState.vipCounts[id] !== undefined) {
                delete state.rotationState.vipCounts[id];
            }
            if (state.rotationState.mvpCounts && state.rotationState.mvpCounts[id] !== undefined) {
                delete state.rotationState.mvpCounts[id];
            }
        }
        updateFirestoreState().then(render);
    }
}

function handleRankChange(event) {
    const selectElement = event.target;
    const memberId = selectElement.dataset.memberId;
    const newRank = selectElement.value;
    const member = getMemberById(memberId); // Member-Objekt holen

    if (!member) {
        console.error("Member not found for rank change:", memberId);
        return;
    }
    const oldRank = member.rank; // Alten Rang speichern
    const memberName = member.name;
    if (oldRank === newRank) return;

    if (confirm(`Change ${memberName}'s rank from ${oldRank} to ${newRank}?`)) {
        // --- BEGINN: Logik zur Anpassung des memberIndex bei Rangänderung ---
        let trueNextVipIdBeforeChange = null;
        // Merke dir den nächsten VIP, falls das Mitglied von/zu 'Member' wechselt
        if ((oldRank === 'Member' || newRank === 'Member') && state.rotationState && typeof state.rotationState.memberIndex === 'number') {
            const memberMembersBeforeRankChange = getMembersByRank('Member'); // Liste VOR Rangänderung
            if (memberMembersBeforeRankChange.length > 0) {
                let tempSearchIndex = state.rotationState.memberIndex;
                let foundNextVip = null;
                let iterations = 0;
                while (!foundNextVip && iterations < memberMembersBeforeRankChange.length * 2) {
                    const candidateIndex = tempSearchIndex % memberMembersBeforeRankChange.length;
                    const candidate = memberMembersBeforeRankChange[candidateIndex];
                    // Wenn das Mitglied, dessen Rang geändert wird, der nächste VIP war,
                    // und es NICHT MEHR Member sein wird, müssen wir den nächsten *danach* finden.
                    // Wenn es ZU Member wird, ist es ok, wenn es der nächste ist.
                    if (candidate && !(state.rotationState.completedSubstituteVipsThisRound || []).includes(candidate.id)) {
                        if (candidate.id === memberId && newRank !== 'Member') { // Dieser Member wird kein Member mehr sein
                            // Nichts tun, die Schleife sucht weiter nach dem nächsten *anderen* Member
                        } else {
                            foundNextVip = candidate;
                            trueNextVipIdBeforeChange = foundNextVip.id;
                        }
                    }
                    tempSearchIndex++;
                    iterations++;
                }
                 if(trueNextVipIdBeforeChange) console.log(`handleRankChange: Next scheduled VIP before rank change of ${memberName} was ID: ${trueNextVipIdBeforeChange}`);
            }
        }
        // --- ENDE: Logik zur Anpassung des memberIndex bei Rangänderung ---

        member.rank = newRank; // Rang ändern
        sortMembers(); // Neu sortieren (wichtig, da Ränge die Hauptsortierung sind)

        // --- BEGINN: memberIndex anpassen nach Rangänderung und Sortieren ---
        if ((oldRank === 'Member' || newRank === 'Member') && state.rotationState) {
            const memberMembersAfterRankChange = getMembersByRank('Member'); // Liste NACH Rangänderung

            if (trueNextVipIdBeforeChange) {
                const newIndexOfTrueNextVip = memberMembersAfterRankChange.findIndex(m => m.id === trueNextVipIdBeforeChange);
                if (newIndexOfTrueNextVip !== -1) {
                    state.rotationState.memberIndex = newIndexOfTrueNextVip;
                     console.log(`handleRankChange: MemberIndex after rank change of ${memberName} set to ${newIndexOfTrueNextVip} for VIP ID ${trueNextVipIdBeforeChange}`);
                } else {
                    // Der zuvor geplante nächste VIP ist nicht mehr in der Member-Liste (z.B. wurde auch R4/R5)
                    // oder die Liste ist jetzt kürzer. Stelle sicher, dass der Index gültig ist.
                    if (memberMembersAfterRankChange.length > 0) {
                         state.rotationState.memberIndex = Math.min(state.rotationState.memberIndex, memberMembersAfterRankChange.length -1);
                         if(state.rotationState.memberIndex < 0) state.rotationState.memberIndex = 0;
                    } else {
                         state.rotationState.memberIndex = 0;
                    }
                    console.warn(`handleRankChange: Could not find previously scheduled VIP ID ${trueNextVipIdBeforeChange} or index out of bounds. MemberIndex adjusted to ${state.rotationState.memberIndex}.`);
                }
            } else if (memberMembersAfterRankChange.length > 0) { // Kein spezifischer nächster VIP, aber es gibt Member
                state.rotationState.memberIndex = state.rotationState.memberIndex % memberMembersAfterRankChange.length;
            } else { // Keine Member mehr
                state.rotationState.memberIndex = 0;
            }

            // Wenn das Mitglied von Member zu R4/R5 gewechselt ist, aus completedSubstitutes entfernen
            if (oldRank === 'Member' && newRank !== 'Member') {
                if (state.rotationState.completedSubstituteVipsThisRound) {
                    state.rotationState.completedSubstituteVipsThisRound = state.rotationState.completedSubstituteVipsThisRound.filter(id => id !== memberId);
                }
            }
        }
        // --- ENDE: memberIndex anpassen nach Rangänderung und Sortieren ---

        updateFirestoreState().then(render);
    } else {
        selectElement.value = oldRank; // Rang im Select zurücksetzen bei Abbruch
    }
}


function sortMembers() {
    if (!Array.isArray(state.members)) return;
    const rankOrder = { 'R5': 1, 'R4': 2, 'Member': 3 };
    state.members.sort((a, b) => {
        const rankA = a?.rank; const rankB = b?.rank;
        const nameA = a?.name || ""; const nameB = b?.name || "";
        const rankDiff = (rankOrder[rankA] || 99) - (rankOrder[rankB] || 99);
        if (rankDiff !== 0) return rankDiff;
        return nameA.localeCompare(nameB);
    });
}

function toggleRenameMode(memberId) {
    state.editingMemberId = state.editingMemberId === memberId ? null : memberId;
    renderMemberList();
}

async function saveNewName(memberId, newNameInput) {
    const newName = newNameInput.value.trim();
    if (!newName) {
        alert("Name cannot be empty.");
        newNameInput.focus();
        return;
    }

    const originalMember = getMemberById(memberId);
    if (!originalMember) {
        console.error("saveNewName: Original member not found with ID:", memberId);
        return;
    }
    const oldName = originalMember.name;

    if (state.members.some(m => m.id !== memberId && m.name.toLowerCase() === newName.toLowerCase())) {
        alert(`Another member with the name "${newName}" already exists.`);
        newNameInput.focus();
        return;
    }

    originalMember.name = newName;
    state.editingMemberId = null;
    sortMembers();

    if (originalMember.rank === 'Member' && state.rotationState && typeof state.rotationState.memberIndex === 'number') {
        const memberMembersAfterSort = getMembersByRank('Member');
        const newIndexOfRenamedMember = memberMembersAfterSort.findIndex(m => m.id === memberId);

        if (newIndexOfRenamedMember !== -1) {
            const isRenamedMemberAvailableForVip = !(state.rotationState.completedSubstituteVipsThisRound || []).includes(memberId);
            let currentIndexReferencedByMemberIndex = -1;
            if (memberMembersAfterSort.length > 0) {
                 currentIndexReferencedByMemberIndex = state.rotationState.memberIndex % memberMembersAfterSort.length;
            }

            if (newIndexOfRenamedMember < currentIndexReferencedByMemberIndex && isRenamedMemberAvailableForVip) {
                state.rotationState.memberIndex = newIndexOfRenamedMember;
                console.log(`saveNewName: '${oldName}' renamed to '${newName}'. '${newName}' moved to earlier position ${newIndexOfRenamedMember} and is available. MemberIndex set to ${newIndexOfRenamedMember}.`);
            } else if (newIndexOfRenamedMember === currentIndexReferencedByMemberIndex && isRenamedMemberAvailableForVip) {
                 state.rotationState.memberIndex = newIndexOfRenamedMember;
                 console.log(`saveNewName: '${oldName}' renamed to '${newName}'. '${newName}' moved to current memberIndex position ${newIndexOfRenamedMember} and is available. MemberIndex set.`);
            } else {
                console.log(`saveNewName: '${newName}' (formerly '${oldName}') did not move to an earlier relevant available position. MemberIndex logic defers to standard rotation or previous next VIP logic.`);
                // Hier könnte man die komplexere Logik zur Beibehaltung des "echten" nächsten VIPs einfügen,
                // wenn das umbenannte Mitglied nicht direkt relevant wird.
                // Fürs Erste: Wenn ein Member umbenannt wird und nicht nach vorne rückt und verfügbar wird,
                // wird der memberIndex nicht aggressiv geändert, um die bestehende Sequenz so gut wie möglich zu erhalten.
                // Die genaueste Beibehaltung erfordert das Merken des *vorherigen* nächsten VIPs.
                // Da dies sehr komplex wurde, wurde es für diesen spezifischen Wunsch (dass "Chris" dran kommt) vereinfacht.
                // Um die Rotation nach einer Umbenennung, die NICHT dazu führt, dass der Umbenannte der nächste wird,
                // möglichst korrekt fortzusetzen, müsste man sich merken, wer VORHER der nächste VIP gewesen wäre,
                // und den Index auf dessen NEUE Position setzen.
                // AKTUELLE IMPLEMENTIERUNG: Lässt den Index erstmal, wenn der umbenannte nicht "aufrückt".
            }
        }
    }

    try {
        await updateFirestoreState();
        render();
    } catch (error) {
        alert("Error saving new name: " + error.message);
    }
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
    sortMembers();

    if (state.members.length === 0) {
        memberListEl.innerHTML = '<li>No members in the alliance.</li>';
        return;
    }

    state.members.forEach(member => {
        if (!member?.id || !member.name || !member.rank) return;

        const li = document.createElement('li');
        li.dataset.memberId = member.id;

        const infoDiv = document.createElement('div');
        infoDiv.classList.add('member-info');

        if (state.editingMemberId === member.id) {
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.value = member.name;
            nameInput.classList.add('inline-edit-name');
            infoDiv.appendChild(nameInput);

            const saveNameBtn = document.createElement('button');
            saveNameBtn.textContent = 'Save';
            saveNameBtn.classList.add('btn-primary', 'btn-small');
            saveNameBtn.onclick = () => saveNewName(member.id, nameInput);
            infoDiv.appendChild(saveNameBtn);

            const cancelNameBtn = document.createElement('button');
            cancelNameBtn.textContent = 'Cancel';
            cancelNameBtn.classList.add('btn-secondary', 'btn-small');
            cancelNameBtn.onclick = () => toggleRenameMode(member.id);
            infoDiv.appendChild(cancelNameBtn);
        } else {
            const nameSpan = document.createElement('span');
            nameSpan.textContent = member.name;
            nameSpan.classList.add('member-name-display');
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
        }

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('member-actions');

        if (state.editingMemberId !== member.id) {
            const renameButton = document.createElement('button');
            renameButton.textContent = 'Rename';
            renameButton.classList.add('btn-secondary', 'btn-small');
            renameButton.onclick = () => toggleRenameMode(member.id);
            actionsDiv.appendChild(renameButton);

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.classList.add('btn-remove', 'btn-small');
            removeButton.onclick = () => removeMember(member.id);
            actionsDiv.appendChild(removeButton);
        }

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
        currentConductorEl.textContent = calculatedConductor?.name || "Error calculating conductor";
        currentVipEl.textContent = calculatedVip?.name || "Error calculating VIP";
        vipAcceptedBtn.disabled = true;
        vipSkippedBtn.disabled = true;
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
                currentConductorEl.textContent = `Stored MVP (ID: ${selectedMvpId}) not found! Please select new.`;
                populateMvpSelect();
                mvpSelectionArea.style.display = 'block';
                mvpSelect.value = "";
                isMvpSelectionNeeded = true;
            }
        } else {
            currentConductorEl.innerHTML = `<span class="mvp-selection-required">${calculatedConductor.name}</span>`;
            populateMvpSelect();
            mvpSelectionArea.style.display = 'block';
            mvpSelect.value = "";
            isMvpSelectionNeeded = true;
        }
    } else {
        currentConductorEl.textContent = `${finalConductor.name} (${finalConductor.rank})`;
        mvpSelectionArea.style.display = 'none';
    }

    const vipName = calculatedVip.name || "Unknown VIP";
    const vipRank = calculatedVip.rank || "N/A";
    let isVipActionPossible = false;

    if (calculatedVip.id === 'NO_MEMBERS' || calculatedVip.id.startsWith('ERR_') || calculatedVip.id === 'NO_VALID_MEMBER') {
        currentVipEl.textContent = vipName;
        document.getElementById('vip-actions').style.display = 'none';
    } else {
        currentVipEl.textContent = `${vipName} (${vipRank})`;
        document.getElementById('vip-actions').style.display = 'block';
        isVipActionPossible = true;
    }

    if (alternativeVipArea.style.display !== 'block') {
        alternativeVipArea.style.display = 'none';
    }

    const alternativeVipDialogActive = alternativeVipArea.style.display === 'block';
    vipAcceptedBtn.disabled = alternativeVipDialogActive || !isVipActionPossible || isMvpSelectionNeeded;
    vipSkippedBtn.disabled = alternativeVipDialogActive || !isVipActionPossible || isMvpSelectionNeeded;
    undoAdvanceBtn.disabled = !state.previousRotationState;
}

function populateMvpSelect() {
    mvpSelect.innerHTML = '<option value="">-- Select MVP --</option>';
    if (!Array.isArray(state.members)) return;
    const memberRankMembers = getMembersByRank('Member');
    memberRankMembers.forEach(m => {
        if (!m?.id) return;
        const option = document.createElement('option');
        option.value = m.id;
        option.textContent = `${m.name} (Member)`;
        mvpSelect.appendChild(option);
    });
}

function renderSchedule() {
    scheduleDisplayListEl.innerHTML = '';
    if (!state.rotationState?.currentDate || !state.members) {
        scheduleDisplayListEl.innerHTML = '<li>Schedule not ready. Waiting for data...</li>';
        return;
    }

    const memberMembers = getMembersByRank('Member');
    const currentSubstitutes = state.rotationState.completedSubstituteVipsThisRound || [];
    const history = state.rotationState.dailyHistory || {};
    const todayForSchedule = new Date(state.rotationState.currentDate + 'T00:00:00Z');

    if (isNaN(todayForSchedule)) {
        console.error("Current date is invalid, cannot render schedule.");
        scheduleDisplayListEl.innerHTML = '<li>Error: Invalid current date for schedule.</li>';
        return;
    }

    const daysToShowPast = 3;
    const futureDaysNeeded = Math.max(7, memberMembers.length > 0 ? memberMembers.length + 5 : 7);

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

    let simDate = new Date(todayForSchedule);
    let simR4R5Idx = state.rotationState.r4r5Index ?? 0;
    let simMemIdx = state.rotationState.memberIndex ?? 0;
    let simMvps = JSON.parse(JSON.stringify(state.rotationState.selectedMvps || {}));
    let simSubstitutes = [...currentSubstitutes];

    for (let i = 0; i < futureDaysNeeded; i++) {
        if (isNaN(simDate)) {
            console.error("Simulation date became invalid.");
            break;
        }
        const dateStr = getISODateString(simDate);
        const dayOfWeek = getDayOfWeek(simDate);
        const isCurrentDay = (i === 0);
        const { conductor, vip, effectiveMemberIndex: simEffectiveMemberIndex } = calculateDailyAssignments( // Renamed for clarity
            dateStr, simR4R5Idx, simMemIdx, simMvps, simSubstitutes
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
                const mvpKeyToCheck = dayOfWeek === MVP_TECH_DAY ? `${dateStr}_Mon` : `${dateStr}_Sun`;
                const simMvpId = simMvps[mvpKeyToCheck];
                if (simMvpId) {
                    const mvpMember = getMemberById(simMvpId);
                    conductorSpan.textContent = `C: ${mvpMember ? mvpMember.name : 'Selected MVP'} (${mvpMember ? mvpMember.rank : 'MVP'})`;
                } else {
                    conductorSpan.innerHTML = `<span class="mvp-selection-required">${conductorName}</span>`;
                }
            } else {
                conductorSpan.textContent = `C: ${conductorName} (${conductorRank})`;
            }
            const vipSpan = document.createElement('span');
            vipSpan.classList.add('schedule-vip');
            const vipName = vip.name || "?";
            const vipRank = vip.rank || "N/A";
            if (vip.id === 'NO_MEMBERS' || vip.id.startsWith('ERR_') || vip.id === 'NO_VALID_MEMBER') {
                vipSpan.textContent = vipName;
            } else {
                vipSpan.textContent = `VIP: ${vipName} (${vipRank})`;
            }
            li.appendChild(dateSpan); li.appendChild(conductorSpan); li.appendChild(vipSpan);
            scheduleDisplayListEl.appendChild(li);
        } else {
            const li = document.createElement('li');
            li.textContent = `${formatDate(simDate)}: Error calculating assignments for this day.`;
            if (isCurrentDay) li.classList.add('current-day');
            scheduleDisplayListEl.appendChild(li);
        }

        if (vip?.id && !vip.id.startsWith('NO_') && !vip.id.startsWith('ERR_') && vip.id !== 'NO_VALID_MEMBER') {
            simMemIdx = simEffectiveMemberIndex + 1; // Use the effective index from this sim step
            const simMemberMembers = getMembersByRank('Member');
            if (simMemberMembers.length > 0 && (simMemIdx % simMemberMembers.length === 0) && simMemIdx > 0) {
                simSubstitutes = [];
            }
        } else {
            simMemIdx = simEffectiveMemberIndex; // Use the effective index
        }

        if (dayOfWeek >= 2 && dayOfWeek <= 6) {
            simR4R5Idx++;
        }
        simDate = addDays(simDate, 1);
    }
}

function toggleEditVipCountMode(memberId) {
    state.editingVipCountMemberId = state.editingVipCountMemberId === memberId ? null : memberId;
    renderStatistics();
}

async function saveVipCount(memberId, newCountInput) {
    const newCountString = newCountInput.value;
    const newCount = parseInt(newCountString, 10);

    if (isNaN(newCount) || newCount < 0) {
        alert("VIP count must be a non-negative number.");
        newCountInput.focus();
        return;
    }
    const member = getMemberById(memberId);
    if (!member) {
        alert("Member not found for VIP count update.");
        return;
    }
    if (!state.rotationState.vipCounts) {
        state.rotationState.vipCounts = {};
    }
    state.rotationState.vipCounts[memberId] = newCount;
    if (!state.rotationState.completedSubstituteVipsThisRound) {
        state.rotationState.completedSubstituteVipsThisRound = [];
    }
    if (member.rank === 'Member') {
        const indexInSubstitutes = state.rotationState.completedSubstituteVipsThisRound.indexOf(memberId);
        if (newCount > 0) {
            if (indexInSubstitutes === -1) {
                state.rotationState.completedSubstituteVipsThisRound.push(memberId);
                console.log(`${member.name} (ID: ${memberId}) wurde zur completedSubstituteVipsThisRound-Liste hinzugefügt (VIP-Count manuell auf ${newCount}).`);
            }
        } else if (newCount === 0) {
            if (indexInSubstitutes > -1) {
                state.rotationState.completedSubstituteVipsThisRound.splice(indexInSubstitutes, 1);
                console.log(`${member.name} (ID: ${memberId}) wurde aus der completedSubstituteVipsThisRound-Liste entfernt (VIP-Count manuell auf 0).`);
            } else {
                console.log(`${member.name} (ID: ${memberId}) war nicht in completedSubstituteVipsThisRound, als VIP-Count auf 0 gesetzt wurde.`);
            }
        }
    }
    state.editingVipCountMemberId = null;
    try {
        await updateFirestoreState();
        render();
    } catch (error) {
        alert("Error saving VIP count: " + error.message);
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
        const currentVipCount = vipCounts[member.id] || 0;
        if (currentVipCount > 0) hasVipStats = true;
        const li = document.createElement('li');
        li.dataset.memberId = member.id;
        const nameSpan = document.createElement('span');
        nameSpan.textContent = member.name;
        nameSpan.classList.add('stats-name');
        li.appendChild(nameSpan);
        const controlsDiv = document.createElement('div');
        controlsDiv.classList.add('stats-controls');
        if (state.editingVipCountMemberId === member.id) {
            const countInput = document.createElement('input');
            countInput.type = 'number';
            countInput.value = currentVipCount;
            countInput.min = "0";
            countInput.classList.add('inline-edit-count');
            controlsDiv.appendChild(countInput);
            const saveBtn = document.createElement('button');
            saveBtn.textContent = 'Save';
            saveBtn.classList.add('btn-primary', 'btn-small');
            saveBtn.onclick = () => saveVipCount(member.id, countInput);
            controlsDiv.appendChild(saveBtn);
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancel';
            cancelBtn.classList.add('btn-secondary', 'btn-small');
            cancelBtn.onclick = () => toggleEditVipCountMode(member.id);
            controlsDiv.appendChild(cancelBtn);
        } else {
            const countSpan = document.createElement('span');
            countSpan.classList.add('stats-count');
            countSpan.textContent = currentVipCount;
            controlsDiv.appendChild(countSpan);
            const editBtn = document.createElement('button');
            editBtn.innerHTML = '✎';
            editBtn.title = "Edit VIP Count";
            editBtn.classList.add('btn-secondary', 'btn-small', 'btn-edit-stat');
            editBtn.onclick = () => toggleEditVipCountMode(member.id);
            controlsDiv.appendChild(editBtn);
        }
        li.appendChild(controlsDiv);
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
        const prevDateFromUndo = new Date(state.previousRotationState.currentDate + 'T00:00:00Z');
        if (!isNaN(prevDateFromUndo) && getISODateString(prevDateFromUndo) === lastDateStr) {
            lastCompletedDateEl.textContent = formatDate(prevDateFromUndo);
            lastCompletedConductorEl.textContent = "(Data from pre-history state)";
            lastCompletedVipEl.textContent = "(Data from pre-history state)";
        }
    }
}

function render() {
    renderMemberList();
    renderCurrentDay();
    renderSchedule();
    renderStatistics();
    renderLastCompletedDay();
    undoAdvanceBtn.disabled = !state.previousRotationState;
    if (versionEl) {
        versionEl.textContent = SCRIPT_VERSION;
    }
}

// --- Event Handlers ---
function handleMvpDropdownChange() {
    if (mvpSelectionArea.style.display === 'block') {
        const selectedMvpValue = mvpSelect.value;
        const isMvpSelected = selectedMvpValue !== "";
        const vipElement = document.getElementById('current-vip');
        const vipTextContent = vipElement ? vipElement.textContent : "";
        const isVipDisplayValid = !(vipTextContent.includes("No Members") || vipTextContent.includes("Error") || vipTextContent.includes("No valid Member"));
        vipAcceptedBtn.disabled = !isMvpSelected || !isVipDisplayValid;
        vipSkippedBtn.disabled = !isMvpSelected || !isVipDisplayValid;
    }
}

function populateAlternativeVipSelect() {
    alternativeVipSelect.innerHTML = '<option value="">-- No Alternative VIP (Original is skipped) --</option>';
    const memberRankMembers = getMembersByRank('Member');
    const substitutesAlreadyThisRound = state.rotationState.completedSubstituteVipsThisRound || [];
    const originallyProposedVipId = alternativeVipArea.dataset.originalVipId;
    memberRankMembers.forEach(member => {
        if (!member?.id) return;
        if (member.id === originallyProposedVipId) return;
        if (substitutesAlreadyThisRound.includes(member.id)) return;
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = `${member.name} (${member.rank})`;
        alternativeVipSelect.appendChild(option);
    });
}

async function handleConfirmAlternativeVip() {
    const alternativeVipId = alternativeVipSelect.value;
    const originallySkippedVipId = alternativeVipArea.dataset.originalVipId;
    const selectedMvpIdForToday = alternativeVipArea.dataset.selectedMvpId;
    if (!originallySkippedVipId) {
        alert("Error: Original VIP ID missing for skip confirmation.");
        renderCurrentDay();
        return;
    }
    confirmAlternativeVipBtn.disabled = true;
    alternativeVipSelect.disabled = true;
    vipAcceptedBtn.disabled = true;
    vipSkippedBtn.disabled = true;
    undoAdvanceBtn.disabled = true;

    const currentDateStr = state.rotationState.currentDate;
    const currentDate = new Date(currentDateStr + 'T00:00:00Z');
    const currentDayOfWeek = getDayOfWeek(currentDate);
    const currentR4R5Index = state.rotationState.r4r5Index ?? 0;
    const currentMemberIndexUnchanged = state.rotationState.memberIndex ?? 0;
    const currentSelectedMvps = { ...(state.rotationState.selectedMvps || {}) };
    const currentVipCounts = { ...(state.rotationState.vipCounts || {}) };
    const currentMvpCounts = { ...(state.rotationState.mvpCounts || {}) };
    const currentAlternativeVips = { ...(state.rotationState.alternativeVips || {}) };
    let currentSubstituteList = [...(state.rotationState.completedSubstituteVipsThisRound || [])];
    let finalConductorId = null;

    if (selectedMvpIdForToday) {
        const member = getMemberById(selectedMvpIdForToday);
        if (member) {
            currentMvpCounts[selectedMvpIdForToday] = (currentMvpCounts[selectedMvpIdForToday] || 0) + 1;
            const mvpKey = currentDayOfWeek === MVP_TECH_DAY ? `${currentDateStr}_Mon` : `${currentDateStr}_Sun`;
            currentSelectedMvps[mvpKey] = selectedMvpIdForToday;
            finalConductorId = selectedMvpIdForToday;
        } else {
            console.warn(`ConfirmAltVIP: MVP ID ${selectedMvpIdForToday} not found, but was passed.`);
            const r4r5Members = getMembersByRank('R4/R5');
            finalConductorId = r4r5Members.length > 0 ? r4r5Members[currentR4R5Index % r4r5Members.length]?.id || 'NO_R4R5_ALT' : 'NO_R4R5_ALT';
        }
    } else {
        const mvpKeyToday = currentDayOfWeek === MVP_TECH_DAY ? `${currentDateStr}_Mon` : (currentDayOfWeek === MVP_VS_DAY ? `${currentDateStr}_Sun` : null);
        if (mvpKeyToday && currentSelectedMvps[mvpKeyToday]) {
            finalConductorId = currentSelectedMvps[mvpKeyToday];
        } else if (!mvpKeyToday) {
            const r4r5Members = getMembersByRank('R4/R5');
            finalConductorId = r4r5Members.length > 0 ? r4r5Members[currentR4R5Index % r4r5Members.length]?.id || 'NO_R4R5_REG' : 'NO_R4R5_REG';
        } else {
            console.error("ConfirmAltVIP: MVP Tag but no MVP found/selected.");
            finalConductorId = "ERR_NO_CONDUCTOR";
        }
    }

    if (alternativeVipId) {
        const altVipMember = getMemberById(alternativeVipId);
        if (altVipMember) {
            currentVipCounts[alternativeVipId] = (currentVipCounts[alternativeVipId] || 0) + 1;
            currentAlternativeVips[currentDateStr] = alternativeVipId;
            if (!currentSubstituteList.includes(alternativeVipId)) {
                currentSubstituteList.push(alternativeVipId);
            }
            recordDailyHistory(currentDateStr, finalConductorId, alternativeVipId, 'Substitute');
        } else {
            console.warn(`ConfirmAltVIP: Alternative VIP ID ${alternativeVipId} not found. Original VIP ${originallySkippedVipId} will be marked as skipped.`);
            recordDailyHistory(currentDateStr, finalConductorId, originallySkippedVipId, 'Skipped (Alt.Invalid)');
        }
    } else {
        recordDailyHistory(currentDateStr, finalConductorId, originallySkippedVipId, 'Skipped');
    }

    let nextR4R5Index = currentR4R5Index;
    if (currentDayOfWeek >= 2 && currentDayOfWeek <= 6) {
        nextR4R5Index = (currentR4R5Index + 1);
    }
    const nextDate = addDays(currentDate, 1);
    const nextDateStr = getISODateString(nextDate);

    try {
        state.previousRotationState = JSON.parse(JSON.stringify(state.rotationState));
    } catch (e) {
        console.error("Error creating previousRotationState for skip/alternative:", e);
        state.previousRotationState = null;
    }

    state.rotationState.currentDate = nextDateStr;
    state.rotationState.r4r5Index = nextR4R5Index;
    state.rotationState.memberIndex = currentMemberIndexUnchanged;
    state.rotationState.selectedMvps = currentSelectedMvps;
    state.rotationState.vipCounts = currentVipCounts;
    state.rotationState.mvpCounts = currentMvpCounts;
    state.rotationState.alternativeVips = currentAlternativeVips;
    state.rotationState.completedSubstituteVipsThisRound = currentSubstituteList;

    try {
        await updateFirestoreState();
        alternativeVipArea.style.display = 'none';
    } catch (error) {
        console.error("Save failed after confirming alternative/skipped VIP:", error);
        alert("Error saving data after skip/substitute. Please check console and try again or undo.");
        renderCurrentDay();
    }
}

async function handleVipAction(accepted) {
    if (!state.rotationState?.currentDate) {
        alert("Rotation state is not loaded. Please wait or refresh.");
        return;
    }
    const currentDateStr = state.rotationState.currentDate;
    const currentDate = new Date(currentDateStr + 'T00:00:00Z');
    const dayOfWeek = getDayOfWeek(currentDate);
    let selectedMvpId = null;

    if (dayOfWeek === MVP_TECH_DAY || dayOfWeek === MVP_VS_DAY) {
        const mvpKey = dayOfWeek === MVP_TECH_DAY ? `${currentDateStr}_Mon` : `${currentDateStr}_Sun`;
        const existingMvp = state.rotationState.selectedMvps?.[mvpKey];
        if (!existingMvp) {
            selectedMvpId = mvpSelect.value;
            if (!selectedMvpId) {
                alert("Please select an MVP for today.");
                mvpSelect.focus();
                return;
            }
        } else {
            selectedMvpId = existingMvp;
        }
    }

    vipAcceptedBtn.disabled = true;
    vipSkippedBtn.disabled = true;
    undoAdvanceBtn.disabled = true;
    alternativeVipArea.style.display = 'none';

    if (accepted) {
        try {
            state.previousRotationState = JSON.parse(JSON.stringify(state.rotationState));
        } catch (e) {
            console.error("Error creating previousRotationState for accept:", e);
            state.previousRotationState = null;
        }
        const success = advanceRotation(true, selectedMvpId);
        if (success) {
            try {
                await updateFirestoreState();
            } catch (error) {
                console.error("Failed to save state after VIP acceptance:", error);
                alert("Error saving data. The day might not have advanced correctly. Please check or undo.");
                renderCurrentDay();
            }
        } else {
            alert("Could not advance the day. Please check the proposed VIP.");
            renderCurrentDay();
        }
    } else {
        const { vip: proposedVip } = calculateDailyAssignments(
            currentDateStr,
            state.rotationState.r4r5Index ?? 0,
            state.rotationState.memberIndex ?? 0,
            state.rotationState.selectedMvps || {},
            state.rotationState.completedSubstituteVipsThisRound || []
        );
        if (!proposedVip?.id || proposedVip.id.startsWith('NO_') || proposedVip.id.startsWith('ERR_')) {
            alert("Cannot process skip: No valid VIP was proposed for today.");
            renderCurrentDay();
            return;
        }
        alternativeVipArea.dataset.originalVipId = proposedVip.id;
        alternativeVipArea.dataset.selectedMvpId = selectedMvpId || "";
        originalSkippedVipNameEl.textContent = proposedVip.name || "The proposed VIP";
        populateAlternativeVipSelect();
        alternativeVipArea.style.display = 'block';
        confirmAlternativeVipBtn.disabled = false;
        alternativeVipSelect.disabled = false;
    }
}

undoAdvanceBtn.addEventListener('click', async () => {
    if (!state.previousRotationState) {
        alert("No previous state available to undo.");
        return;
    }
    if (confirm("Are you sure you want to undo the last day advancement? This will revert to the previous day's state.")) {
        undoAdvanceBtn.disabled = true;
        try {
            if (typeof state.previousRotationState !== 'object' || state.previousRotationState === null) {
                throw new Error("Invalid undo data structure.");
            }
            state.rotationState = JSON.parse(JSON.stringify(state.previousRotationState));
            state.previousRotationState = null;
            await updateFirestoreState();
        } catch (error) {
            console.error("Undo error:", error);
            alert("Error during undo operation: " + error.message + "\nThe state might be inconsistent. Please check carefully or consider a reset if problems persist.");
            undoAdvanceBtn.disabled = !state.previousRotationState && !state.rotationState;
        }
    }
});

resetBtn.addEventListener('click', async () => {
    if (confirm("!! WARNING !! This will reset ALL rotation data (current day, VIP/MVP counts, history) to the initial defaults and use the member list defined in the code. This cannot be undone! Are you absolutely sure?")) {
        if (confirm("SECOND WARNING: Confirm again to reset all data. Your current member list and all progress will be lost and replaced by the defaults.")) {
            resetBtn.disabled = true;
            const resetStartDateStr = "2025-04-21";
            state.members = initialMembers.map(m => ({ ...m, id: m.id || generateId() }));
            state.rotationState = {
                currentDate: resetStartDateStr,
                r4r5Index: 0,
                memberIndex: 0,
                selectedMvps: {},
                vipCounts: {},
                mvpCounts: {},
                alternativeVips: {},
                completedSubstituteVipsThisRound: [],
                dailyHistory: {}
            };
            state.previousRotationState = null;
            try {
                await updateFirestoreState();
                alert(`All data has been reset to defaults. The rotation will start from ${formatDate(new Date(resetStartDateStr + 'T00:00:00Z'))}. The page will now refresh to apply changes.`);
                window.location.reload();
            } catch (error) {
                console.error("Reset error:", error);
                alert("Error resetting data. Please check the console. " + error.message);
                resetBtn.disabled = false;
            }
        }
    }
});

stateDocRef.onSnapshot((doc) => {
    console.log("Firestore data received/updated.");
    const localPrevStateForUndo = state.previousRotationState;
    if (doc.exists) {
        const data = doc.data();
        const loadedMembersRaw = data.members;
        if (Array.isArray(loadedMembersRaw) && loadedMembersRaw.length > 0) {
            state.members = loadedMembersRaw.map(m => ({ ...m, id: m.id || generateId() }));
        } else {
            console.warn("No members array found in Firestore or it was empty. Falling back to initialMembers.");
            state.members = initialMembers.map(m => ({ ...m, id: m.id || generateId() }));
        }
        const loadedRotState = data.rotationState || {};
        state.rotationState = {
            currentDate: loadedRotState.currentDate,
            r4r5Index: loadedRotState.r4r5Index ?? 0,
            memberIndex: loadedRotState.memberIndex ?? 0,
            selectedMvps: loadedRotState.selectedMvps || {},
            vipCounts: loadedRotState.vipCounts || {},
            mvpCounts: loadedRotState.mvpCounts || {},
            alternativeVips: loadedRotState.alternativeVips || {},
            completedSubstituteVipsThisRound: loadedRotState.completedSubstituteVipsThisRound || [],
            dailyHistory: loadedRotState.dailyHistory || {}
        };
        state.previousRotationState = localPrevStateForUndo;
        let needsSaveToFirebase = false;
        if (!state.rotationState.currentDate || isNaN(new Date(state.rotationState.currentDate + 'T00:00:00Z'))) {
            console.warn("Current date from Firebase is invalid or missing. Resetting date to default start: 2025-04-21.");
            state.rotationState.currentDate = "2025-04-21";
            if (!state.rotationState.selectedMvps) state.rotationState.selectedMvps = {};
            if (!state.rotationState.vipCounts) state.rotationState.vipCounts = {};
            if (!state.rotationState.mvpCounts) state.rotationState.mvpCounts = {};
            if (!state.rotationState.alternativeVips) state.rotationState.alternativeVips = {};
            if (!state.rotationState.completedSubstituteVipsThisRound) state.rotationState.completedSubstituteVipsThisRound = [];
            if (!state.rotationState.dailyHistory) state.rotationState.dailyHistory = {};
            needsSaveToFirebase = true;
        }
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
            console.log("Attempting to save corrected/initialized state to Firebase.");
            updateFirestoreState().catch(err => console.error("Automatic state correction save FAIL:", err));
        }
    } else {
        console.log("No existing Firebase document 's749_state' found. Initializing with default members and start date.");
        const defaultStartDate = "2025-04-21";
        state = {
            members: initialMembers.map(m => ({ ...m, id: m.id || generateId() })),
            rotationState: {
                currentDate: defaultStartDate,
                r4r5Index: 0,
                memberIndex: 0,
                selectedMvps: {},
                vipCounts: {},
                mvpCounts: {},
                alternativeVips: {},
                completedSubstituteVipsThisRound: [],
                dailyHistory: {}
            },
            previousRotationState: null
        };
        updateFirestoreState().catch(err => console.error("Initial setup save to Firebase FAIL:", err));
    }
    render();
    resetBtn.disabled = false;
}, (error) => {
    console.error("Firestore Listener FATAL ERROR:", error);
    alert(`FATAL DATABASE ERROR (${error.message}). App might not work. Check console, connection, config, rules.`);
    document.body.innerHTML = `<div style="padding:20px;text-align:center;color:red;"><h1>App Error</h1><p>DB Error: ${error.message}</p></div>`;
});

addMemberForm.addEventListener('submit', addMember);
vipAcceptedBtn.addEventListener('click', () => handleVipAction(true));
vipSkippedBtn.addEventListener('click', () => handleVipAction(false));
mvpSelect.addEventListener('change', handleMvpDropdownChange);
confirmAlternativeVipBtn.addEventListener('click', handleConfirmAlternativeVip);
