/**
 * Local Campus Demo Engine
 * 
 * Kept strictly isolated from the Supabase client.
 * Provides realistic Navotas Polytechnic College (NPC) student marketplace data
 * when live Supabase credentials are not connected, ensuring full platform evaluation.
 */

export const DEMO_PROFILES = {
  buyer: {
    id: 'demo-buyer-001',
    student_id: '2023-10492',
    full_name: 'Juan Dela Cruz',
    email: 'j.delacruz@sample.student.test',
    role: 'buyer',
    college_program: 'BS Information Technology (BSIT)',
    avatar_url: null,
    phone_number: '0917-555-1234',
    campus_status: 'Enrolled',
  },
  seller: {
    id: 'demo-seller-001',
    student_id: '2022-08819',
    full_name: 'Maria Santos',
    email: 'm.santos@sample.student.test',
    role: 'seller',
    store_name: "Maria's NPC Campus Hub",
    college_program: 'BS Business Administration (BSBA)',
    avatar_url: null,
    phone_number: '0918-777-4321',
    campus_status: 'Enrolled',
    rating: 4.9,
    total_sales: 42,
  },
  admin: {
    id: 'demo-admin-001',
    student_id: 'FAC-2019-012',
    full_name: 'Engr. Aris Bautista',
    email: 'a.bautista@sample.faculty.test',
    role: 'admin',
    college_program: 'College of Computer Studies / Technopreneurship Faculty',
    avatar_url: null,
    phone_number: '0920-888-9900',
    campus_status: 'Faculty Staff',
  },
};

const STORAGE_KEY_ROLE = 'navpc_demo_active_role';

export const mockEngine = {
  getActiveRole() {
    return localStorage.getItem(STORAGE_KEY_ROLE) || 'buyer';
  },

  setActiveRole(role) {
    if (DEMO_PROFILES[role]) {
      localStorage.setItem(STORAGE_KEY_ROLE, role);
      return DEMO_PROFILES[role];
    }
    return DEMO_PROFILES.buyer;
  },

  getCurrentProfile() {
    const role = this.getActiveRole();
    return DEMO_PROFILES[role] || DEMO_PROFILES.buyer;
  },
};
