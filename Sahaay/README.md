# SevaConnect

A community-service platform connecting citizens reporting street-animal welfare and public-safety concerns with eligible community workers and animal rescue organisations.

## Project Purpose
SevaConnect combines community service with flexible earning opportunities. Workers can toggle their availability on a flexible schedule to accept suitable tasks rather than being required to work full-time, while dangerous emergencies and suspected rabies cases are immediately routed to municipal veterinary ambulances under a strict zero-touch safety protocol.

## Tech Stack
- **Frontend Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS with custom palette (Deep Forest Green, Warm Ivory, Soft Sage, Mint, Gold)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Maps**: Leaflet + OpenStreetMap
- **State & Theme**: ThemeContext (Light/Dark mode with persistence) & AuthContext (Role-based personas)

## Getting Started (Windows PowerShell)

Ensure Node.js is installed, then run:

```powershell
# 1. Navigate to the project directory
cd "c:\Users\Samruddhi Kolhe\OneDrive\Desktop\SevaConnect"

# 2. Start the development server
npm run dev
```

Open your browser at: `http://localhost:5173/`

To test production build:
```powershell
npm run build
npm run preview
```

## Demo Personas & Role Navigation
The application features a prototype role switcher bar at the top of every page for 1-click preview:
1. **Public Portal**: Home, How It Works, About, Login, Register
2. **Citizen Portal (`Priya Sharma`)**: Citizen Dashboard, Report an Animal (with live photo preview & rabies check), My Reports, Report Details Timeline, Assisted Help
3. **Worker Console (`Rahul Verma`)**: Worker Dashboard with interactive Availability Toggle, Available Tasks, My Active Tasks, Task Details & Proof Upload, Simulated Earnings, Profile, Training & Verification
4. **Organisation Console (`Dr. Sunita Kulkarni - Pune AWA`)**: Operations Dashboard, Manage Reports & Triage, Interactive OpenStreetMap, Tasks & Dispatch, Review Completion Proofs, Simulated Payments, Worker Management, Impact Analytics

*Note: All payment records, emergency dispatch dispatches, and financial statistics in this frontend prototype are simulated for demonstration purposes.*
