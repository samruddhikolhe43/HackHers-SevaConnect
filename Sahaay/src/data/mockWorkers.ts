import { WorkerProfile } from '../types';

export const INITIAL_WORKERS: WorkerProfile[] = [
  {
    id: 'wrk-101',
    name: 'Rahul Verma',
    email: 'rahul.verma@example.com',
    phone: '+91 98220 12345',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    city: 'Pune (Baner & Kothrud)',
    availability: true,
    verificationStatus: 'verified',
    completedModules: [
      'Basic Community Animal Safety & First Contact',
      'Canine Body Language & De-escalation Protocol',
      'Safe Transport & Stretcher Handling',
      'Zoonotic Diseases & Rabies Red-Line Awareness'
    ],
    safetyTier: 'Certified Animal Handler',
    rating: 4.92,
    tasksCompleted: 38,
    simulatedEarnings: {
      available: 2450,
      pendingReview: 750,
      totalLifetime: 14850,
    },
  },
  {
    id: 'wrk-102',
    name: 'Anjali Deshmukh',
    email: 'anjali.d@example.com',
    phone: '+91 97631 88992',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    city: 'Pune (Viman Nagar & Kalyani Nagar)',
    availability: true,
    verificationStatus: 'pending',
    completedModules: [
      'Basic Community Animal Safety & First Contact'
    ],
    safetyTier: 'Basic Community Responder',
    rating: 4.80,
    tasksCompleted: 6,
    simulatedEarnings: {
      available: 600,
      pendingReview: 250,
      totalLifetime: 1850,
    },
  },
  {
    id: 'wrk-103',
    name: 'Sanjay Shinde',
    email: 'sanjay.shinde@example.com',
    phone: '+91 94235 66778',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    city: 'Pune (Shivajinagar & JM Road)',
    availability: false,
    verificationStatus: 'verified',
    completedModules: [
      'Basic Community Animal Safety & First Contact',
      'Avian Care & Kite Manja Rescue',
      'Wildlife Escort Coordination'
    ],
    safetyTier: 'Certified Animal Handler',
    rating: 4.95,
    tasksCompleted: 29,
    simulatedEarnings: {
      available: 1800,
      pendingReview: 600,
      totalLifetime: 12400,
    },
  },
  {
    id: 'wrk-104',
    name: 'Dr. Vikram Patil',
    email: 'dr.vikram.patil@example.com',
    phone: '+91 98811 77223',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    city: 'Pune (Hadapsar & Camp)',
    availability: true,
    verificationStatus: 'verified',
    completedModules: [
      'Basic Community Animal Safety & First Contact',
      'Canine Body Language & De-escalation Protocol',
      'Safe Transport & Stretcher Handling',
      'Zoonotic Diseases & Rabies Red-Line Awareness',
      'Clinical Field Sedation & Trauma Escort'
    ],
    safetyTier: 'Veterinary Emergency Escort',
    rating: 4.98,
    tasksCompleted: 82,
    simulatedEarnings: {
      available: 4200,
      pendingReview: 1200,
      totalLifetime: 41500,
    },
  }
];
