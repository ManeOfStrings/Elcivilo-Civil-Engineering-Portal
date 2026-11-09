import {
  AcademicDocument,
  AcademicNotification,
  Assignment,
  ReferenceCode,
  Subject,
  User,
  AuditLog,
} from '../types';

export const initialAdminUser: User = {
  id: 'usr_admin_01',
  name: 'Head of Civil Department',
  email: 'admin@elcivilo.edu',
  role: 'admin',
  title: 'Administrator & Professor of Structural Analysis',
};

export const initialUser: User = {
  id: 'usr_guest_01',
  name: 'Civil Engineering Student',
  email: 'student@elcivilo.edu',
  role: 'student',
  title: 'Civil Engineering Scholar',
  department: 'Civil Engineering',
};

export const initialStudentRoster: User[] = [
  initialUser,
  {
    id: 'usr_stu_02',
    name: 'Priya Sharma',
    email: 'priya.ce@elcivilo.edu',
    role: 'student',
    rollNumber: 'CE2023-014',
    department: 'Civil Engineering',
  },
  {
    id: 'usr_stu_03',
    name: 'Karthik Raja',
    email: 'karthik.ce@elcivilo.edu',
    role: 'student',
    rollNumber: 'CE2023-028',
    department: 'Civil Engineering',
  },
];

export interface SemesterInfo {
  semester: number;
  roman: string;
  title: string;
  description: string;
  courseCount: number;
}

export const semestersData: SemesterInfo[] = [
  { semester: 1, roman: 'Sem 1', title: 'Semester 1', description: 'Academic Curriculum for Semester 1', courseCount: 0 },
  { semester: 2, roman: 'Sem 2', title: 'Semester 2', description: 'Academic Curriculum for Semester 2', courseCount: 0 },
  { semester: 3, roman: 'Sem 3', title: 'Semester 3', description: 'Academic Curriculum for Semester 3', courseCount: 0 },
  { semester: 4, roman: 'Sem 4', title: 'Semester 4', description: 'Academic Curriculum for Semester 4', courseCount: 0 },
  { semester: 5, roman: 'Sem 5', title: 'Semester 5', description: 'Academic Curriculum for Semester 5', courseCount: 0 },
  { semester: 6, roman: 'Sem 6', title: 'Semester 6', description: 'Academic Curriculum for Semester 6', courseCount: 0 },
  { semester: 7, roman: 'Sem 7', title: 'Semester 7', description: 'Academic Curriculum for Semester 7', courseCount: 0 },
  { semester: 8, roman: 'Sem 8', title: 'Semester 8', description: 'Academic Curriculum for Semester 8', courseCount: 0 },
];

/**
 * Dynamic subject repository: completely free of hardcoded mock course data.
 * Subjects are dynamically populated by the department admin or Supabase.
 */
export const civilSubjects: Subject[] = [];

/**
 * Dynamic academic documents: completely free of hardcoded mock records.
 */
export const initialDocuments: AcademicDocument[] = [];

/**
 * Dynamic assignments: populated dynamically by department instructors.
 */
export const initialAssignments: Assignment[] = [];

/**
 * Dynamic notifications: published dynamically by department faculty/admin.
 */
export const initialNotifications: AcademicNotification[] = [];

export const initialReferenceCodes: ReferenceCode[] = [
  {
    id: 'code_01',
    codeNumber: 'IS 456:2000',
    title: 'Plain and Reinforced Concrete - Code of Practice',
    category: 'Concrete',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '8.4 MB',
    description: 'The mandatory Indian Standard design code for all reinforced concrete structures, flexural limits, shear tables, and durability criteria.',
    year: 2000,
  },
  {
    id: 'code_02',
    codeNumber: 'IS 800:2007',
    title: 'General Construction in Steel - Code of Practice',
    category: 'Steel',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '6.9 MB',
    description: 'Limit state design specification for hot-rolled steel members, bolted and welded connections, tension/compression members, and plate girders.',
    year: 2007,
  },
  {
    id: 'code_03',
    codeNumber: 'IS 1893:2016 (Part 1)',
    title: 'Criteria for Earthquake Resistant Design of Structures',
    category: 'Structural',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '5.2 MB',
    description: 'Seismic zoning of India, design response spectrum, base shear calculations, and structural irregularity definitions.',
    year: 2016,
  },
  {
    id: 'code_04',
    codeNumber: 'SP 16:1980',
    title: 'Design Aids for Reinforced Concrete to IS: 456-1978',
    category: 'Tables & Charts',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '12.1 MB',
    description: 'Comprehensive design charts and tables for singly reinforced, doubly reinforced, flanged beams, and interaction curves for columns under axial load and moment.',
    year: 1980,
  },
  {
    id: 'code_05',
    codeNumber: 'IS 10262:2019',
    title: 'Concrete Mix Proportioning - Guidelines',
    category: 'Concrete',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '3.1 MB',
    description: 'Procedures for designing ordinary, standard, and high-strength concrete mixes using mineral and chemical admixtures.',
    year: 2019,
  },
  {
    id: 'code_06',
    codeNumber: 'IS 1200 (Part 1-28)',
    title: 'Methods of Measurement of Building and Civil Engineering Works',
    category: 'General',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '4.8 MB',
    description: 'Standard rules for measurement of earthwork, concrete work, brickwork, steelwork, and finishes for preparing bills of quantities.',
    year: 1992,
  },
  {
    id: 'code_07',
    codeNumber: 'Steel Tables (SP 6: Part 1)',
    title: 'Properties of Rolled Steel Beams, Channels & Angles',
    category: 'Tables & Charts',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '4.5 MB',
    description: 'Digital reference handbook of cross-sectional properties, section modulus (Zz, Zy), moment of inertia, and radii of gyration for Indian Standard steel shapes (ISMB, ISMC, ISA).',
    year: 1964,
  },
  {
    id: 'code_08',
    codeNumber: 'IS 2720 Soil Classification Chart',
    title: 'Indian Standard Soil Classification & Plasticity Chart',
    category: 'Geotechnical',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '2.2 MB',
    description: 'A-Line plasticity chart (Ip vs wL), particle size distribution criteria for gravels, sands, silts, and clays.',
    year: 1983,
  },
  {
    id: 'code_09',
    codeNumber: 'Civil Engineering Unit Conversion Chart',
    title: 'Standard Units & Metric Conversion Cheat Sheet',
    category: 'Tables & Charts',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileSize: '1.4 MB',
    description: 'Handy engineering conversion factors for stress (MPa to kg/cm²), moment (kNm to kg-m), density, flow rate (cumecs to cusecs), and hydraulic head.',
    year: 2024,
  },
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log_01',
    action: 'System Ready',
    target: 'Elcivilo Civil Engineering Repository Initialized',
    user: 'Administrator',
    timestamp: '2026-11-03T16:20:00Z',
    details: 'Clean dynamic repository ready for subject & curriculum uploads',
  },
];
