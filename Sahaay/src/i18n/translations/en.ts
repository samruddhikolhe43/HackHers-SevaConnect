export const en = {
  // Navigation & Header
  nav: {
    home: 'Home',
    interactiveMap: 'Civic Map',
    howItWorks: 'How It Works',
    safety: 'Safety Rules',
    signIn: 'Sign In',
    register: 'Register',
    signOut: 'Sign Out',
    dashboard: 'Dashboard',
    reportIssue: 'Report Incident',
    communityTasks: 'Local Tasks',
    orgPortal: 'NGO & Authority Portal',
    notifications: 'Notifications',
    profile: 'Profile',
    selectLanguage: 'Language',
  },
  
  // Hero & Public
  home: {
    tagline: 'Civic Incident Response & Welfare Ledger',
    titleLead: 'Community Help,',
    titleHighlight: 'Coordinated with Care',
    titleTrail: 'and Fair Earning.',
    description: 'Sahaay connects citizens reporting community needs and animal welfare concerns with verified local workers and organisations. Safe tasks get completed with verified photo proof, workers earn reliable stipends, and medical emergencies are routed to authorised responders.',
    reportBtn: 'Report a Community Issue',
    earnBtn: 'Earn as a Service Worker',
    orgBtn: 'For Organisations',
    safetyGuarantee: 'Strict safety boundary: Medical trauma and dangerous cases route directly to qualified veterinarians and municipal units.',
    whoUsesTitle: 'Built for Everyone in the Community',
    whoUsesSubtitle: 'Clear pathways for reporting citizens, verified service helpers, and coordinating welfare organisations.',
    citizenTitle: 'Active Citizens',
    citizenDesc: 'Report injured strays, broken civic facilities, or feeding needs with photo and live GPS proof.',
    workerTitle: 'Community Service Workers',
    workerDesc: 'Pick up verified neighborhood support tasks, complete them safely, and receive prompt community stipends.',
    orgTitle: 'Welfare Organisations & NGOs',
    orgDesc: 'Review AI-triaged reports, coordinate emergency rescues, and disburse community task payouts.',
  },

  // Incident Reporting
  report: {
    pageTitle: 'Report an Animal Welfare or Civic Concern',
    pageSubtitle: 'Provide genuine incident details. Sahaay AI will assess the category, evaluate urgency, and flag critical issues for human review.',
    step1Title: 'Incident Details',
    step2Title: 'Location & Geotag Verification',
    step3Title: 'Photo & Evidence',
    step4Title: 'Review & Submit',
    
    // Voice Input inside Description Box
    micButton: 'Voice Input',
    listening: 'Listening...',
    speakPrompt: 'Speak naturally in English, Hindi, or Marathi...',
    stopListening: 'Stop',
    voiceLangLabel: 'Speech Language:',
    micPermissionDenied: 'Microphone permission was denied. You can continue typing in the text box.',
    micNotSupported: 'Speech recognition is not supported in this browser. Please type your description.',
    micError: 'Voice capture encountered an error. Please try again or type manually.',
    micRetry: 'Retry Voice',
    
    // Form fields
    descriptionLabel: 'Describe the Incident in Detail',
    descriptionPlaceholder: 'Example: An injured street dog near Shivaji Nagar bus stop with a deep leg wound. It is lying near the tea stall and cannot walk...',
    categoryAiNotice: 'Incident category is automatically determined by AI analysis to ensure consistent triage.',
    aiCategoryLabel: 'AI-Assessed Category',
    aiUrgencyLabel: 'AI-Assessed Urgency Level',
    aiExplanationLabel: 'AI Assessment Explanation',
    aiMissingInfoLabel: 'Missing Information / Suggestions',
    aiConfidenceLabel: 'Triage Confidence',
    otherCategoryNote: 'Categorized as "Other". Detailed human review will be conducted.',

    // Location controls
    useCurrentLocation: 'Use My Current Location',
    detectingGps: 'Acquiring device GPS...',
    gpsDenied: 'Location permission was denied. Please pick your location on the map or type your address.',
    gpsUnavailable: 'GPS location is currently unavailable. Please enter address manually.',
    gpsTimeout: 'Location request timed out. Please enter address manually.',
    cityLabel: 'City',
    addressLabel: 'Street Address or Landmark',
    addressPlaceholder: 'e.g. Near Ganpati Temple, FC Road, Pune',
    landmarkLabel: 'Nearby Landmark (Optional)',
    landmarkPlaceholder: 'e.g. Opposite Post Office',
    locationPrivacyNotice: 'Why location is requested: GPS coordinates verify proximity to the reported incident to assist responders. A mismatch does not indicate fraud.',
    
    // Location Statuses
    locConsistent: 'Location Evidence Consistent',
    locIncomplete: 'Location Evidence Incomplete',
    locMismatch: 'Location Mismatch — Review Required',
    locNotAvailable: 'Location Not Available',

    // Photo & Camera
    takePhotoCamera: 'Take Live Photo (Camera)',
    uploadPhotoFile: 'Upload Image File',
    photoExifNotice: 'When available, photo GPS metadata is cross-checked with the reported location.',
    photoRequirementNotice: 'Images are visually reviewed by coordinators. Never diagnose injuries without a veterinarian.',
    dragDropPhoto: 'Click or drag photo here to upload',
    replacePhoto: 'Replace Photo',
    
    // Image verification statuses
    imgConsistent: 'Consistent with Description',
    imgPotentiallyInconsistent: 'Potentially Inconsistent',
    imgUnclear: 'Unclear or Insufficient',
    imgNeedsHumanReview: 'Marked for Human Review',

    // Reporter Info
    reporterNameLabel: 'Your Full Name',
    reporterPhoneLabel: 'Contact Phone Number',
    anonymousCheckbox: 'Report anonymously (name hidden from public task views)',
    
    // Submission
    submitBtn: 'Submit Verified Incident Report',
    submitting: 'Submitting & Triaging with AI...',
    submitSuccessTitle: 'Incident Report Registered Successfully',
    submitSuccessMessage: 'Your report has been entered into the civic ledger with AI triage and location verification.',
    trackingNumberLabel: 'Tracking Number',
    viewReportBtn: 'View Incident Status',
    reportAnotherBtn: 'Report Another Incident',
  },

  // Urgency Levels
  urgency: {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    needs_review: 'Needs Review',
  },

  // Categories
  category: {
    dog: 'Canine (Dog)',
    cat: 'Feline (Cat)',
    cattle: 'Bovine (Cattle / Cow)',
    bird: 'Avian (Bird)',
    wildlife: 'Wildlife / Reptile',
    other: 'Other Incident',
  },

  // Statuses
  status: {
    reported: 'Reported',
    under_review: 'Under Review',
    task_created: 'Task Created',
    worker_assigned: 'Worker Assigned',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    escalated: 'Escalated to Vet / Authority',
  },

  // Dashboards
  citizen: {
    welcome: 'Welcome, Citizen',
    welcomeSub: 'Track your reported community concerns and monitor volunteer response in real time.',
    totalReports: 'Total Reports Filed',
    resolvedReports: 'Resolved Concerns',
    pendingReview: 'Under Review / Active',
    myReportsTitle: 'My Reported Incidents',
    noReports: 'You have not reported any incidents yet.',
    reportNewBtn: 'Report New Incident',
  },

  worker: {
    welcome: 'Welcome, Service Helper',
    welcomeSub: 'Browse neighborhood assistance tasks, follow safe handling guidelines, and earn verified stipends.',
    availableTasks: 'Available Tasks',
    activeTasks: 'In Progress',
    completedTasks: 'Completed Tasks',
    earningsBalance: 'Stipend Balance',
    claimTaskBtn: 'Claim Task',
    submitProofBtn: 'Submit Completion Photo',
    safetyPrompt: 'Always wear safety gloves and follow non-contact protocol for medical cases.',
  },

  org: {
    welcome: 'Organisation & NGO Coordinator Portal',
    welcomeSub: 'Inspect AI-triaged reports, review location and image evidence, and assign response teams.',
    totalIncidents: 'Total Incidents',
    criticalCases: 'Critical Triage',
    pendingHumanReview: 'Pending Human Review',
    activeResponders: 'Active Helpers',
    manageReportsTitle: 'Incident Triage & Review Console',
    humanReviewBtn: 'Record Human Review',
    approveBtn: 'Approve AI Assessment',
    modifyBtn: 'Adjust Triage',
    rejectBtn: 'Reject / Close',
    officerNotesLabel: 'Reviewer Notes',
    officerNotesPlaceholder: 'State reasoning or direct instructions for field workers...',
  },

  // Common UI
  common: {
    loading: 'Loading...',
    save: 'Save Changes',
    cancel: 'Cancel',
    close: 'Close',
    error: 'An error occurred',
    retry: 'Try Again',
    optional: 'Optional',
    required: 'Required',
    back: 'Back',
    next: 'Next',
    pune: 'Pune',
    nagpur: 'Nagpur',
    allCities: 'All Cities',
  }
};
