export const MOCK_ANALYTICS = {
  overview: {
    totalReports: 1482,
    activeTasks: 18,
    resolvedIncidents: 1396,
    resolutionRate: 94.2,
    averageResponseMinutes: 38,
    verifiedWorkers: 74,
    totalSimulatedDisbursements: 342800,
    activeOrganisations: 12,
  },
  byCategory: [
    { label: 'Dogs (Indie Canines)', count: 912, percentage: 61.5, color: '#2D6E54' },
    { label: 'Cats & Kittens', count: 284, percentage: 19.2, color: '#3D8C6D' },
    { label: 'Cattle & Equines', count: 148, percentage: 10.0, color: '#E08E15' },
    { label: 'Birds & Raptors', count: 112, percentage: 7.6, color: '#5FAA8B' },
    { label: 'Urban Wildlife', count: 26, percentage: 1.7, color: '#C4700E' },
  ],
  byUrgency: [
    { label: 'Low (Feeding/Checks)', count: 420, color: '#3D8C6D' },
    { label: 'Medium (Minor injury/Litter)', count: 680, color: '#F1AC38' },
    { label: 'High (Severe trauma/Entanglement)', count: 320, color: '#E07A5F' },
    { label: 'Critical (Rabies/Escalation)', count: 62, color: '#DC2626' },
  ],
  monthlyTrend: [
    { month: 'May 2026', reports: 180, resolved: 168 },
    { month: 'Jun 2026', reports: 220, resolved: 205 },
    { month: 'Jul 2026', reports: 295, resolved: 280 },
    { month: 'Aug 2026', reports: 310, resolved: 298 },
    { month: 'Sep 2026', reports: 265, resolved: 254 },
    { month: 'Oct 2026 (MTD)', reports: 212, resolved: 191 },
  ],
  zones: [
    { zone: 'Baner & Balewadi', reports: 340, avgTime: '32 min', activeWorkers: 18 },
    { zone: 'Kothrud & Karvenagar', reports: 290, avgTime: '36 min', activeWorkers: 15 },
    { zone: 'Shivajinagar & FC Road', reports: 245, avgTime: '28 min', activeWorkers: 14 },
    { zone: 'Hinjawadi IT Corridor', reports: 220, avgTime: '45 min', activeWorkers: 11 },
    { zone: 'Hadapsar & Magarpatta', reports: 210, avgTime: '42 min', activeWorkers: 10 },
    { zone: 'Viman Nagar & Kalyani Nagar', reports: 177, avgTime: '34 min', activeWorkers: 9 },
  ]
};
