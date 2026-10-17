export type UserRole = 'public' | 'citizen' | 'worker' | 'organisation';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export type ReportStatus = 
  | 'submitted' 
  | 'under_review' 
  | 'task_created' 
  | 'worker_assigned' 
  | 'in_progress' 
  | 'resolved' 
  | 'escalated';

export type AnimalCategory = 'dog' | 'cat' | 'cattle' | 'bird' | 'wildlife' | 'other';

export type ReportType = 
  | 'injured_animal' 
  | 'aggressive_animal' 
  | 'rabies_suspicion' 
  | 'puppies_kittens_care' 
  | 'animal_abuse' 
  | 'public_hazard' 
  | 'feeding_assistance';

export type SafetyClearance = 
  | 'community_safe'          // Open to general verified citizens/community workers (feeding, non-critical welfare check)
  | 'trained_only'             // Requires Certified Animal Handler training module
  | 'vet_escort_required'      // Medical/Injury transport requiring vet assistance
  | 'emergency_escalation';    // Dangerous/Rabies/Severe accident: DO NOT TOUCH, escalation to authority/shelter ambulance only

export interface ReportTimelineEvent {
  status: ReportStatus;
  timestamp: string;
  note: string;
  actor: string;
}

export interface Report {
  id: string;
  trackingNumber: string;
  title: string;
  category: AnimalCategory;
  type: ReportType;
  urgency: UrgencyLevel;
  status: ReportStatus;
  safetyClearance: SafetyClearance;
  location: {
    address: string;
    city: string;
    landmark?: string;
    lat: number;
    lng: number;
  };
  description: string;
  reportedAt: string;
  reportedBy: {
    name: string;
    phone?: string;
    email?: string;
    isAnonymous?: boolean;
  };
  photos: string[];
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  assignedOrgId?: string;
  assignedOrgName?: string;
  statusHistory: ReportTimelineEvent[];
  isEmergencyEscalation?: boolean;
  emergencyContactNote?: string;
}

export type TaskStatus = 
  | 'available' 
  | 'claimed' 
  | 'in_progress' 
  | 'submitted_for_review' 
  | 'completed' 
  | 'cancelled';

export interface Task {
  id: string;
  reportId: string;
  trackingNumber: string;
  title: string;
  category: AnimalCategory;
  urgency: UrgencyLevel;
  status: TaskStatus;
  safetyClearance: SafetyClearance;
  location: {
    address: string;
    city: string;
    lat: number;
    lng: number;
  };
  description: string;
  instructions: string[];
  requiredEquipment?: string[];
  proposedPayment: number; // in INR (simulated)
  paymentStatus: 'pending' | 'approved' | 'disbursed';
  estimatedHours: number;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  createdAt: string;
  completedAt?: string;
  completionNotes?: string;
  completionProofPhotos?: string[];
}

export interface WorkerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  city: string;
  availability: boolean;
  verificationStatus: 'verified' | 'pending' | 'needs_training';
  completedModules: string[];
  safetyTier: 'Basic Community Responder' | 'Certified Animal Handler' | 'Veterinary Emergency Escort';
  rating: number;
  tasksCompleted: number;
  simulatedEarnings: {
    available: number;
    pendingReview: number;
    totalLifetime: number;
  };
}

export interface EarningRecord {
  id: string;
  taskId: string;
  taskTitle: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending_verification' | 'processing';
  transactionReference: string;
  simulatedNotice: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'alert';
  link?: string;
}
