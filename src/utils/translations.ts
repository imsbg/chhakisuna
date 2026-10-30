/**
 * Multilingual Translation Dictionaries (Odia Default & English)
 * Game Name: ଛକି ଶୂନ / Chhaki Suna
 */

export type Language = 'en' | 'or';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  heroBadge: string;
  p2pRoomSubtitle: string;
  roomCode: string;
  createRoom: string;
  createRoomDesc: string;
  joinRoom: string;
  joinRoomDesc: string;
  joinAsPlayer: string;
  joinAsSpectator: string;
  yourName: string;
  namePlaceholder: string;
  player1Name: string;
  player2Name: string;
  player2Placeholder: string;
  startTwoPlayerGame: string;
  enterRoomCode: string;
  codePlaceholder: string;
  invalidCode: string;
  shareRoom: string;
  copyLink: string;
  copied: string;
  linkCopied: string;
  scanQr: string;
  scanWithCamera: string;
  shareViaMessaging: string;
  close: string;
  playerX: string;
  playerO: string;
  you: string;
  spectator: string;
  spectators: string;
  spectatorWatching: string;
  waitingForOpponent: string;
  waitingForReplay: string;
  shareLinkPrompt: string;
  yourTurn: string;
  opponentTurn: string;
  spectatorTurnNotice: string;
  wins: string;
  ties: string;
  drawsLabel: string;
  round: string;
  gameOverWin: string;
  gameOverDraw: string;
  playAgain: string;
  rematchRequested: string;
  acceptRematch: string;
  leaveRoom: string;
  settings: string;
  appearance: string;
  darkMode: string;
  lightMode: string;
  soundEffects: string;
  soundOn: string;
  soundOff: string;
  testSound: string;
  language: string;
  odia: string;
  english: string;
  promoTitle: string;
  promoBadge: string;
  downloadNow: string;
  customizePromo: string;
  appName: string;
  appLogoUrl: string;
  shortDescription: string;
  downloadButtonUrl: string;
  saveChanges: string;
  resetDefaultPromo: string;
  webrtcStatus: string;
  connected: string;
  connecting: string;
  disconnected: string;
  peerRoleHost: string;
  peerRoleGuest: string;
  sendReaction: string;
  cheerOpponent: string;
  spectatorModeNotice: string;
  playSolo: string;
  passAndPlay: string;
  passAndPlayDesc: string;
  vsComputer: string;
  vsComputerDesc: string;
  multiplayer: string;
  computer: string;
  difficulty: string;
  // Timer & Game Data History
  totalPlayTime: string;
  roundTime: string;
  gameDataTitle: string;
  gameDataSubtitle: string;
  noRoundsYet: string;
  winnerLabel: string;
  timeTakenLabel: string;
  totalMovesLabel: string;
  finalMoveLabel: string;
  moveSequenceLabel: string;
  cellLabel: string;
  // Live Public Matches & Phone Cache
  makeRoomLiveLabel: string;
  makeRoomLiveDesc: string;
  liveMatchesTitle: string;
  liveMatchesSubtitle: string;
  noLiveMatches: string;
  openForPlayer: string;
  matchInProgress: string;
  phoneCacheBadge: string;
  // Room Creator Left & Refresh Prevention
  hostLeftNotice: string;
  hostLeftBannerTitle: string;
  hostLeftBannerDesc: string;
  refreshDisabledNotice: string;
  // Share with a Friend (Language Selector)
  shareWithFriend: string;
  shareLanguagePromptTitle: string;
  shareLanguagePromptSubtitle: string;
  shareViaWhatsApp: string;
  shareViaSystem: string;
  copyShareMessage: string;
  messageCopied: string;
  // Terms & Conditions / Privacy Page
  termsAndPrivacy: string;
  backToGame: string;
  termsPageTitle: string;
  termsPageSubtitle: string;
  termsNoDataTitle: string;
  termsNoDataDesc: string;
  termsWebrtcTitle: string;
  termsWebrtcDesc: string;
  termsLocalStorageTitle: string;
  termsLocalStorageDesc: string;
  termsFairPlayTitle: string;
  termsFairPlayDesc: string;
  moreAppsTitle: string;
  moreAppsDesc: string;
  downloadMoreAppsBtn: string;
  // Leave Room Confirmation & Mobile Menu
  leaveConfirmTitle: string;
  leaveConfirmDesc: string;
  leaveConfirmYes: string;
  leaveConfirmCancel: string;
  menuLabel: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appTitle: 'Tic Tac Toe',
    appSubtitle: 'Play Tic Tac Toe Online with SBXXXX Rooms or Solo',
    heroBadge: 'Tic Tac Toe • Online & Solo Game',
    p2pRoomSubtitle: 'Online Multiplayer Room',
    roomCode: 'Room Code',
    createRoom: 'Create Room',
    createRoomDesc: 'Host a room with code SBXXXX',
    joinRoom: 'Join Room',
    joinRoomDesc: 'Join with SBXXXX or watch live',
    joinAsPlayer: 'Play as Player O',
    joinAsSpectator: 'Watch as Spectator',
    yourName: 'Your Name',
    namePlaceholder: 'Enter your name...',
    player1Name: 'Player 1 Name (X)',
    player2Name: 'Player 2 Name (O)',
    player2Placeholder: 'Enter Player 2 name...',
    startTwoPlayerGame: 'Start 2-Player Game',
    enterRoomCode: 'Enter Room Code',
    codePlaceholder: 'e.g. SB7A9K',
    invalidCode: 'Please enter a valid 6-character SBXXXX room code',
    shareRoom: 'Share Room',
    copyLink: 'Copy Link',
    copied: 'Copied!',
    linkCopied: 'Invite link copied to clipboard!',
    scanQr: 'QR Code',
    scanWithCamera: 'Scan with phone camera to join immediately',
    shareViaMessaging: 'Share via WhatsApp / Messaging',
    close: 'Close',
    playerX: 'Player X',
    playerO: 'Player O',
    you: 'You',
    spectator: 'Spectator',
    spectators: 'Spectators',
    spectatorWatching: 'watching live',
    waitingForOpponent: 'Waiting for an opponent to join...',
    waitingForReplay: 'Waiting for players to replay...',
    shareLinkPrompt: 'Share this SB room code or unique link with your friend to start playing!',
    yourTurn: "It's your turn!",
    opponentTurn: "Waiting for opponent's move...",
    spectatorTurnNotice: 'Current Turn:',
    wins: 'Wins',
    ties: 'Draws',
    drawsLabel: 'Draws',
    round: 'Round',
    gameOverWin: 'wins the game!',
    gameOverDraw: "It's a standoff draw!",
    playAgain: 'Play Again',
    rematchRequested: 'Rematch request sent...',
    acceptRematch: 'Opponent wants a rematch! Accept?',
    leaveRoom: 'Leave Room',
    settings: 'Settings',
    appearance: 'Appearance',
    darkMode: 'Dark Theme',
    lightMode: 'Light Theme',
    soundEffects: 'Sound Effects',
    soundOn: 'Audio Enabled',
    soundOff: 'Audio Muted',
    testSound: 'Test Sound',
    language: 'Language',
    odia: 'ଓଡ଼ିଆ',
    english: 'English',
    promoTitle: 'Featured App',
    promoBadge: 'Sponsored',
    downloadNow: 'Download Now',
    customizePromo: 'Featured App',
    appName: 'App Name',
    appLogoUrl: 'App Logo Image URL',
    shortDescription: 'Short Description',
    downloadButtonUrl: 'Download Button URL',
    saveChanges: 'Save Changes',
    resetDefaultPromo: 'Reset to Default',
    webrtcStatus: 'Connection Status',
    connected: 'Live Connected',
    connecting: 'Connecting...',
    disconnected: 'Offline / Waiting',
    peerRoleHost: 'Host (Player X)',
    peerRoleGuest: 'Guest (Player O)',
    sendReaction: 'Send Reaction',
    cheerOpponent: 'Cheer & React',
    spectatorModeNotice: 'You are spectating this match in real-time.',
    playSolo: 'Play Solo (Single Device)',
    passAndPlay: 'Pass & Play (2 Players)',
    passAndPlayDesc: '2 players on 1 phone or screen',
    vsComputer: 'Play vs Computer',
    vsComputerDesc: 'Smart AI Bot opponent',
    multiplayer: 'Online Multiplayer',
    computer: 'Computer AI',
    difficulty: 'Difficulty',
    totalPlayTime: 'Total Playing Time',
    roundTime: 'Round Time',
    gameDataTitle: 'Game Data & Round History',
    gameDataSubtitle: 'Round results, time taken, every move & final winning move',
    noRoundsYet: 'Complete a round to see detailed round-by-round gameplay data and move history.',
    winnerLabel: 'Result',
    timeTakenLabel: 'Time Taken',
    totalMovesLabel: 'Moves',
    finalMoveLabel: 'Final Move',
    moveSequenceLabel: 'Gameplay Move Order',
    cellLabel: 'Box',
    makeRoomLiveLabel: 'Make Room Public (Show in See Live Matches)',
    makeRoomLiveDesc: 'Anyone on the home screen can watch your match live as a spectator',
    liveMatchesTitle: 'See Live Matches',
    liveMatchesSubtitle: 'Watch public matches happening live right now as a spectator',
    noLiveMatches: 'No public live matches right now. Enable "Make Room Public" and create a room!',
    openForPlayer: 'Waiting for Player O',
    matchInProgress: 'Live Match',
    phoneCacheBadge: 'Live Matches',
    hostLeftNotice: 'The room creator has left the room. Match ended.',
    hostLeftBannerTitle: 'Room Creator Left the Room',
    hostLeftBannerDesc: 'The host has closed or left this room, so the live connection has ended.',
    refreshDisabledNotice: 'Page refresh is disabled during an active match to protect your game!',
    shareWithFriend: 'Share with a Friend',
    shareLanguagePromptTitle: 'In which language do you want to send the message?',
    shareLanguagePromptSubtitle: 'Choose your preferred language for the invitation message and link:',
    shareViaWhatsApp: 'Send on WhatsApp',
    shareViaSystem: 'Share via Apps',
    copyShareMessage: 'Copy Message',
    messageCopied: 'Invitation message copied!',
    termsAndPrivacy: 'Terms & Conditions',
    backToGame: 'Back to Game',
    termsPageTitle: 'Terms & Conditions and Privacy Policy',
    termsPageSubtitle: 'Zero data collection • Direct WebRTC Peer-to-Peer gameplay',
    termsNoDataTitle: '1. Zero Data Collection & Complete Privacy',
    termsNoDataDesc: 'Tic Tac Toe does not collect, store, track, or sell any personal data, user accounts, IP addresses, or analytics on any external database or server. You can play freely without registration or login.',
    termsWebrtcTitle: '2. How Online Multiplayer Works (WebRTC Technology)',
    termsWebrtcDesc: 'Online rooms (SBXXXX) and live spectator streams operate directly between players browsers using WebRTC peer-to-peer data channels. Game moves, scores, and emoji reactions are transmitted directly between connected devices in real time and are automatically cleared as soon as the room closes.',
    termsLocalStorageTitle: '3. Local Device Preferences Only',
    termsLocalStorageDesc: 'Your chosen display name, theme preference (dark or light), language selection, and sound settings are saved strictly inside your own browser local storage on your device so you do not have to re-enter them.',
    termsFairPlayTitle: '4. Free Access & Fair Play',
    termsFairPlayDesc: 'This game is completely free for everyone to play solo or with friends. Inactive public rooms with no movement or reaction for 2 minutes are automatically removed from the live match list.',
    moreAppsTitle: 'Explore & Download More Apps',
    moreAppsDesc: 'Check out more useful Odia and utility applications created by Sandeep Biswal G on Google Play Store.',
    downloadMoreAppsBtn: 'Download More Apps on Google Play',
    leaveConfirmTitle: 'Leave Match?',
    leaveConfirmDesc: 'Are you sure you want to leave this match and return to the home screen?',
    leaveConfirmYes: 'Yes, Leave',
    leaveConfirmCancel: 'Stay in Match',
    menuLabel: 'Menu',
  },
  or: {
    appTitle: 'ଛକି ଶୂନ',
    appSubtitle: 'SBXXXX କୋଡ୍ ସହିତ ସାଙ୍ଗମାନଙ୍କ ସହ କିମ୍ବା ଏକାକୀ ଛକି ଶୂନ ଖେଳନ୍ତୁ',
    heroBadge: 'ଛକି ଶୂନ • ଅନଲାଇନ୍ ଏବଂ ଏକାକୀ ଖେଳ',
    p2pRoomSubtitle: 'ଅନଲାଇନ୍ ମଲ୍ଟିପ୍ଲେୟାର୍ କୋଠରି',
    roomCode: 'କୋଠରି କୋଡ୍',
    createRoom: 'ନୂଆ କୋଠରି ସୃଷ୍ଟି କରନ୍ତୁ',
    createRoomDesc: 'SBXXXX କୋଡ୍ ସହିତ ନୂଆ କୋଠରି ଖୋଲନ୍ତୁ',
    joinRoom: 'କୋଠରିରେ ଯୋଗ ଦିଅନ୍ତୁ',
    joinRoomDesc: 'SBXXXX କୋଡ୍ ଦେଇ ଖେଳନ୍ତୁ କିମ୍ବା ଲାଇଭ୍ ଦେଖନ୍ତୁ',
    joinAsPlayer: 'ଖେଳାଳି ଭାବେ ଯୋଗ ଦିଅନ୍ତୁ',
    joinAsSpectator: 'ଦର୍ଶକ ଭାବେ ଦେଖନ୍ତୁ',
    yourName: 'ଆପଣଙ୍କ ନାମ',
    namePlaceholder: 'ଆପଣଙ୍କ ନାମ ଲେଖନ୍ତୁ...',
    player1Name: 'ଖେଳାଳି ୧ ଙ୍କ ନାମ',
    player2Name: 'ଖେଳାଳି ୨ ଙ୍କ ନାମ',
    player2Placeholder: 'ଖେଳାଳି ୨ ଙ୍କ ନାମ ଲେଖନ୍ତୁ...',
    startTwoPlayerGame: '୨-ଖେଳାଳି ଖେଳ ଆରମ୍ଭ କରନ୍ତୁ',
    enterRoomCode: 'କୋଠରି କୋଡ୍ ପ୍ରବେଶ କରନ୍ତୁ',
    codePlaceholder: 'ଯଥା: SB7A9K',
    invalidCode: 'ଦୟାକରି ୬-ଅକ୍ଷର ବିଶିଷ୍ଟ ବୈଧ SBXXXX କୋଡ୍ ଦିଅନ୍ତୁ',
    shareRoom: 'କୋଠରି ସେୟାର୍ କରନ୍ତୁ',
    copyLink: 'ଲିଙ୍କ୍ କପି କରନ୍ତୁ',
    copied: 'କପି ହୋଇଗଲା!',
    linkCopied: 'ନିମନ୍ତ୍ରଣ ଲିଙ୍କ୍ କପି ହୋଇଗଲା!',
    scanQr: 'କ୍ୟୁଆର୍ କୋଡ୍',
    scanWithCamera: 'ତୁରନ୍ତ ଯୋଗ ଦେବା ପାଇଁ କ୍ୟାମେରାରେ ସ୍କାନ୍ କରନ୍ତୁ',
    shareViaMessaging: 'ହ୍ୱାଟ୍ସଆପ୍ କିମ୍ବା ମେସେଜ୍ ଦ୍ୱାରା ପଠାନ୍ତୁ',
    close: 'ବନ୍ଦ କରନ୍ତୁ',
    playerX: 'ଖେଳାଳି X',
    playerO: 'ଖେଳାଳି O',
    you: 'ଆପଣ',
    spectator: 'ଦର୍ଶକ',
    spectators: 'ଦର୍ଶକମାନେ',
    spectatorWatching: 'ଜଣ ଲାଇଭ୍ ଦେଖୁଛନ୍ତି',
    waitingForOpponent: 'ପ୍ରତିଦ୍ୱନ୍ଦ୍ୱୀ ଯୋଗଦେବାକୁ ଅପେକ୍ଷା କରାଯାଉଛି...',
    waitingForReplay: 'ଖେଳାଳିମାନେ ପୁଣି ଖେଳ ଆରମ୍ଭ କରିବାକୁ ଅପେକ୍ଷା କରାଯାଉଛି...',
    shareLinkPrompt: 'ଖେଳିବା ପାଇଁ ଏହି SB କୋଡ୍ କିମ୍ବା ଲିଙ୍କ୍ ଆପଣଙ୍କ ସାଙ୍ଗଙ୍କୁ ପଠାନ୍ତୁ!',
    yourTurn: 'ଏବେ ଆପଣଙ୍କ ଚାଲ!',
    opponentTurn: 'ପ୍ରତିଦ୍ୱନ୍ଦ୍ୱୀଙ୍କ ଚାଲ ପାଇଁ ଅପେକ୍ଷା କରନ୍ତୁ...',
    spectatorTurnNotice: 'ବର୍ତ୍ତମାନ ଚାଲ:',
    wins: 'ବିଜୟ',
    ties: 'ସମାନ',
    drawsLabel: 'ସମାନ',
    round: 'ରାଉଣ୍ଡ',
    gameOverWin: 'ଖେଳରେ ବିଜୟୀ ହେଲେ!',
    gameOverDraw: 'ଖେଳଟି ସମାନ ରହିଲା!',
    playAgain: 'ପୁଣି ଖେଳନ୍ତୁ',
    rematchRequested: 'ପୁନଃ ଖେଳ ପାଇଁ ଅନୁରୋଧ ପଠାଗଲା...',
    acceptRematch: 'ପ୍ରତିଦ୍ୱନ୍ଦ୍ୱୀ ପୁଣି ଖେଳିବାକୁ ଚାହାଁନ୍ତି! ରାଜି କି?',
    leaveRoom: 'କୋଠରି ଛାଡନ୍ତୁ',
    settings: 'ସେଟିଙ୍ଗସ୍',
    appearance: 'ଦୃଶ୍ୟ',
    darkMode: 'ଡାର୍କ ମୋଡ୍',
    lightMode: 'ଲାଇଟ୍ ମୋଡ୍',
    soundEffects: 'ଧ୍ୱନି ପ୍ରଭାବ',
    soundOn: 'ଧ୍ୱନି ଚାଲୁ',
    soundOff: 'ଧ୍ୱନି ବନ୍ଦ',
    testSound: 'ଧ୍ୱନି ପରୀକ୍ଷା',
    language: 'ଭାଷା',
    odia: 'ଓଡ଼ିଆ',
    english: 'English',
    promoTitle: 'ବିଜ୍ଞାପିତ ଆପ୍',
    promoBadge: 'ସ୍ପନସର୍ଡ୍',
    downloadNow: 'ଡାଉନଲୋଡ୍ କରନ୍ତୁ',
    customizePromo: 'ବିଜ୍ଞାପିତ ଆପ୍',
    appName: 'ଆପ୍ ନାମ',
    appLogoUrl: 'ଆପ୍ ଲୋଗୋ ଲିଙ୍କ୍',
    shortDescription: 'ସଂକ୍ଷିପ୍ତ ବିବରଣୀ',
    downloadButtonUrl: 'ଡାଉନଲୋଡ୍ ବଟନ୍ ଲିଙ୍କ୍',
    saveChanges: 'ସଂରକ୍ଷଣ କରନ୍ତୁ',
    resetDefaultPromo: 'ପୂର୍ବବତ୍ କରନ୍ତୁ',
    webrtcStatus: 'ସଂଯୋଗ ସ୍ଥିତି',
    connected: 'ଲାଇଭ୍ ସଂଯୁକ୍ତ',
    connecting: 'ସଂଯୋଗ ହେଉଛି...',
    disconnected: 'ଅସଂଯୁକ୍ତ / ଅପେକ୍ଷାରେ',
    peerRoleHost: 'ହୋଷ୍ଟ (ଖେଳାଳି X)',
    peerRoleGuest: 'ଅତିଥି (ଖେଳାଳି O)',
    sendReaction: 'ପ୍ରତିକ୍ରିୟା ପଠାନ୍ତୁ',
    cheerOpponent: 'ଉତ୍ସାହିତ କରନ୍ତୁ',
    spectatorModeNotice: 'ଆପଣ ଏହି ଖେଳକୁ ସିଧାସଳଖ ଲାଇଭ୍ ଦେଖୁଛନ୍ତି।',
    playSolo: 'ଏକାକୀ ଖେଳନ୍ତୁ (ଗୋଟିଏ ଫୋନ୍)',
    passAndPlay: 'ଏବେ ଖେଳନ୍ତୁ (୨ ଖେଳାଳି)',
    passAndPlayDesc: 'ଗୋଟିଏ ଫୋନ୍ ରେ ୨ ଜଣ ଖେଳନ୍ତୁ',
    vsComputer: 'କମ୍ପ୍ୟୁଟର ବିପକ୍ଷରେ ଖେଳନ୍ତୁ',
    vsComputerDesc: 'ଚତୁର କମ୍ପ୍ୟୁଟର ସହିତ ଖେଳନ୍ତୁ',
    multiplayer: 'ଅନଲାଇନ୍ ମଲ୍ଟିପ୍ଲେୟାର୍',
    computer: 'କମ୍ପ୍ୟୁଟର',
    difficulty: 'କଠିନତା',
    totalPlayTime: 'ମୋଟ ଖେଳ ସମୟ',
    roundTime: 'ଏହି ରାଉଣ୍ଡ ସମୟ',
    gameDataTitle: 'ଖେଳ ତଥ୍ୟ ଏବଂ ରାଉଣ୍ଡ ଇତିହାସ',
    gameDataSubtitle: 'କେଉଁ ରାଉଣ୍ଡରେ କିଏ ଜିତିଲେ, ସମୟ ଏବଂ ପ୍ରତ୍ୟେକ ଚାଲର ସମ୍ପୂର୍ଣ୍ଣ ବିବରଣୀ',
    noRoundsYet: 'ଖେଳ ତଥ୍ୟ, ସମୟ ଏବଂ ଶେଷ ଚାଲ ଦେଖିବା ପାଇଁ ଗୋଟିଏ ରାଉଣ୍ଡ ଶେଷ କରନ୍ତୁ।',
    winnerLabel: 'ଫଳାଫଳ',
    timeTakenLabel: 'ଲାଗିଥିବା ସମୟ',
    totalMovesLabel: 'ମୋଟ ଚାଲ',
    finalMoveLabel: 'ଶେଷ ଚାଲ',
    moveSequenceLabel: 'ଖେଳର ସମସ୍ତ ଚାଲ କ୍ରମ',
    cellLabel: 'ଘର',
    makeRoomLiveLabel: 'କୋଠରିକୁ ଲାଇଭ୍ କରନ୍ତୁ (ସମସ୍ତେ ଦେଖିପାରିବେ)',
    makeRoomLiveDesc: 'ଅନ୍ୟମାନେ ହୋମ୍ ସ୍କ୍ରିନରୁ ଦର୍ଶକ ଭାବେ ଏହି ଖେଳକୁ ସିଧାସଳଖ ଲାଇଭ୍ ଦେଖିପାରିବେ',
    liveMatchesTitle: 'ଚାଲୁଥିବା ଲାଇଭ୍ ଖେଳ ଦେଖନ୍ତୁ',
    liveMatchesSubtitle: 'ବର୍ତ୍ତମାନ ଚାଲୁଥିବା ଖେଳଗୁଡ଼ିକୁ ଦର୍ଶକ ଭାବେ ଲାଇଭ୍ ଦେଖନ୍ତୁ',
    noLiveMatches: 'ବର୍ତ୍ତମାନ କୌଣସି ଲାଇଭ୍ ଖେଳ ନାହିଁ। "କୋଠରିକୁ ଲାଇଭ୍ କରନ୍ତୁ" ଅନ୍ କରି ନୂଆ କୋଠରି ଖୋଲନ୍ତୁ!',
    openForPlayer: 'ପ୍ରତିଦ୍ୱନ୍ଦ୍ୱୀଙ୍କୁ ଅପେକ୍ଷା',
    matchInProgress: 'ଲାଇଭ୍ ଖେଳ ଚାଲିଛି',
    phoneCacheBadge: 'ଲାଇଭ୍ ଖେଳ',
    hostLeftNotice: 'କୋଠରି ନିର୍ମାତା କୋଠରି ଛାଡ଼ି ଚାଲିଯାଇଛନ୍ତି। ଖେଳ ସମାପ୍ତ ହୋଇଛି।',
    hostLeftBannerTitle: 'କୋଠରି ନିର୍ମାତା କୋଠରି ଛାଡ଼ି ଚାଲିଯାଇଛନ୍ତି',
    hostLeftBannerDesc: 'ଏହି କୋଠରିର ନିର୍ମାତା କୋଠରି ବନ୍ଦ କରିଦେଇଛନ୍ତି କିମ୍ବା ବାହାରି ଯାଇଛନ୍ତି, ତେଣୁ ଲାଇଭ୍ ସଂଯୋଗ ସମାପ୍ତ ହୋଇଛି।',
    refreshDisabledNotice: 'ଖେଳ ଚାଲିଥିବା ସମୟରେ ପୃଷ୍ଠା ରିଫ୍ରେସ୍ କରିବା ବନ୍ଦ କରାଯାଇଛି!',
    shareWithFriend: 'ସାଙ୍ଗମାନଙ୍କ ସହ ସେୟାର୍ କରନ୍ତୁ',
    shareLanguagePromptTitle: 'ଆପଣ କେଉଁ ଭାଷାରେ ବାର୍ତ୍ତା ପଠାଇବାକୁ ଚାହୁଁଛନ୍ତି?',
    shareLanguagePromptSubtitle: 'ଆପଣଙ୍କ ସାଙ୍ଗଙ୍କୁ ନିମନ୍ତ୍ରଣ ବାର୍ତ୍ତା ପଠାଇବା ପାଇଁ ଭାଷା ବାଛନ୍ତୁ:',
    shareViaWhatsApp: 'ହ୍ୱାଟ୍ସଆପ୍ ରେ ପଠାନ୍ତୁ',
    shareViaSystem: 'ଅନ୍ୟ ଆପ୍ ମାଧ୍ୟମରେ ପଠାନ୍ତୁ',
    copyShareMessage: 'ବାର୍ତ୍ତା କପି କରନ୍ତୁ',
    messageCopied: 'ନିମନ୍ତ୍ରଣ ବାର୍ତ୍ତା କପି ହୋଇଗଲା!',
    termsAndPrivacy: 'ନିୟମ ଓ ସର୍ତ୍ତାବଳୀ',
    backToGame: 'ଖେଳକୁ ଫେରନ୍ତୁ',
    termsPageTitle: 'ନିୟମ, ସର୍ତ୍ତାବଳୀ ଏବଂ ଗୋପନୀୟତା ନୀତି',
    termsPageSubtitle: 'କୌଣସି ତଥ୍ୟ ସଂଗ୍ରହ ନାହିଁ • ସିଧାସଳଖ ୱେବ୍-ଆରଟିସି ସଂଯୋଗ ଦ୍ୱାରା ଖେଳ',
    termsNoDataTitle: '୧. କୌଣସି ବ୍ୟକ୍ତିଗତ ତଥ୍ୟ ସଂଗ୍ରହ କରାଯାଏ ନାହିଁ',
    termsNoDataDesc: 'ଛକି ଶୂନ ୱେବସାଇଟ୍ ଆପଣଙ୍କର କୌଣସି ବ୍ୟକ୍ତିଗତ ତଥ୍ୟ, ଫୋନ୍ ନମ୍ବର, ଇମେଲ୍ କିମ୍ବା ଅନ୍ୟ କୌଣସି ସୂଚନା କୌଣସି ସର୍ଭରରେ ସଂଗ୍ରହ କିମ୍ବା ସଂରକ୍ଷଣ କରେ ନାହିଁ। ଆପଣ ବିନା କୌଣସି ପଞ୍ଜୀକରଣ କିମ୍ବା ଲଗଇନ୍ ରେ ସମ୍ପୂର୍ଣ୍ଣ ସୁରକ୍ଷିତ ଭାବେ ଏହି ଖେଳ ଖେଳିପାରିବେ।',
    termsWebrtcTitle: '୨. ଅନଲାଇନ୍ ଖେଳ କିପରି କାର୍ଯ୍ୟ କରେ (ୱେବ୍-ଆରଟିସି ପ୍ରଯୁକ୍ତିବିଦ୍ୟା)',
    termsWebrtcDesc: 'ଏହି ୱେବସାଇଟ୍ ୱେବ୍-ଆରଟିସି ପିଅର୍-ଟୁ-ପିଅର୍ ପ୍ରଯୁକ୍ତିବିଦ୍ୟା ଦ୍ୱାରା କାର୍ଯ୍ୟ କରେ। ଅନଲାଇନ୍ କୋଠରି ଏବଂ ଲାଇଭ୍ ଦର୍ଶକ ସଂଯୋଗ ସିଧାସଳଖ ଗୋଟିଏ ଫୋନ୍ କିମ୍ବା କମ୍ପ୍ୟୁଟରରୁ ଅନ୍ୟ ଫୋନ୍ ସହିତ ଯୋଡ଼ି ହୁଏ। ଖେଳର ପ୍ରତ୍ୟେକ ଚାଲ ଏବଂ ପ୍ରତିକ୍ରିୟା ସିଧାସଳଖ ଖେଳାଳିମାନଙ୍କ ମଧ୍ୟରେ ଆଦାନପ୍ରଦାନ ହୁଏ ଏବଂ କୋଠରି ବନ୍ଦ ହେବା ମାତ୍ରେ ସମସ୍ତ ତଥ୍ୟ ଆପଣାଛାଏଁ ଲିଭିଯାଏ।',
    termsLocalStorageTitle: '୩. କେବଳ ଆପଣଙ୍କ ଫୋନ୍ ରେ ସୁରକ୍ଷିତ ପସନ୍ଦ',
    termsLocalStorageDesc: 'ଆପଣଙ୍କର ନାମ, ଭାଷା ପସନ୍ଦ, ଡାର୍କ କିମ୍ବା ଲାଇଟ୍ ମୋଡ୍ ଏବଂ ଧ୍ୱନି ସେଟିଙ୍ଗସ୍ କେବଳ ଆପଣଙ୍କ ନିଜ ଫୋନ୍ କିମ୍ବା ବ୍ରାଉଜର୍ ଭିତରେ ସୁରକ୍ଷିତ ରହେ, ଯାହାଦ୍ୱାରା ଆପଣଙ୍କୁ ବାରମ୍ବାର ନାମ ଲେଖିବାକୁ ପଡ଼ିବ ନାହିଁ।',
    termsFairPlayTitle: '୪. ମାଗଣା ଖେଳ ଏବଂ ଲାଇଭ୍ କୋଠରି ନିୟମ',
    termsFairPlayDesc: 'ଏହି ଖେଳ ସମସ୍ତଙ୍କ ପାଇଁ ସମ୍ପୂର୍ଣ୍ଣ ମାଗଣା ଅଟେ। ଯଦି କୌଣସି ଲାଇଭ୍ କୋଠରିରେ ୨ ମିନିଟ୍ ପର୍ଯ୍ୟନ୍ତ କୌଣସି ଚାଲ କିମ୍ବା ପ୍ରତିକ୍ରିୟା ନ ହୁଏ, ତେବେ ସେହି କୋଠରିଟି ଲାଇଭ୍ ତାଲିକାରୁ ଆପଣାଛାଏଁ ହଟିଯାଏ।',
    moreAppsTitle: 'ଅଧିକ ଓଡ଼ିଆ ଆପ୍ ଡାଉନଲୋଡ୍ କରନ୍ତୁ',
    moreAppsDesc: 'ସନ୍ଦୀପ ବିଶ୍ୱାଳ ଜି ଙ୍କ ଦ୍ୱାରା ନିର୍ମିତ ଅନ୍ୟାନ୍ୟ ଉପଯୋଗୀ ଓଡ଼ିଆ ଆପ୍ ଗୁଡ଼ିକ ଗୁଗଲ୍ ପ୍ଲେ ଷ୍ଟୋରରୁ ଡାଉନଲୋଡ୍ କରନ୍ତୁ।',
    downloadMoreAppsBtn: 'ଅଧିକ ଆପ୍ ଡାଉନଲୋଡ୍ କରନ୍ତୁ',
    leaveConfirmTitle: 'କୋଠରି ଛାଡ଼ିବେ କି?',
    leaveConfirmDesc: 'ଆପଣ ନିଶ୍ଚିତ କି ଆପଣ ଏହି ଖେଳ ଛାଡ଼ି ହୋମ୍ ସ୍କ୍ରିନକୁ ଫେରିବାକୁ ଚାହୁଁଛନ୍ତି?',
    leaveConfirmYes: 'ହଁ, କୋଠରି ଛାଡନ୍ତୁ',
    leaveConfirmCancel: 'ନା, ଖେଳରେ ରୁହନ୍ତୁ',
    menuLabel: 'ମେନୁ',
  },
};

