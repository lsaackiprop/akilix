export type UploadType = "Notes" | "Video" | "Book" | "Practical" | "Paper";

export interface LatestUpload {
  id: string;
  title: string;
  type: UploadType;
  subject: string;
  author: string;
  uploaded: string;
  size: string;
  level: string;
  tone: "blue" | "green" | "amber" | "violet" | "rose";
}

export const latestUploads: LatestUpload[] = [
  {
    id: "lu-201",
    title: "Grade 8 Mathematics — Algebra Complete Notes",
    type: "Notes",
    subject: "Mathematics",
    author: "Mr. Kiprono",
    uploaded: "Today",
    size: "12.4 MB",
    level: "CBC Grade 8",
    tone: "blue",
  },
  {
    id: "lu-202",
    title: "KCSE Chemistry Practical Demo (Video Series)",
    type: "Video",
    subject: "Chemistry",
    author: "Dr. Atieno",
    uploaded: "2 days ago",
    size: "186 MB",
    level: "Form 4 KCSE",
    tone: "green",
  },
  {
    id: "lu-203",
    title: "Schemes of Work — Form 1 Term 2 (All Subjects)",
    type: "Book",
    subject: "Teacher Resources",
    author: "TSC Curriculum",
    uploaded: "2 days ago",
    size: "8.2 MB",
    level: "High School",
    tone: "amber",
  },
  {
    id: "lu-204",
    title: "CBC Grade 7 — Integrated Science Lesson Plan",
    type: "Paper",
    subject: "Integrated Science",
    author: "Madam Nyambura",
    uploaded: "4 days ago",
    size: "3.7 MB",
    level: "JSS Grade 7",
    tone: "violet",
  },
  {
    id: "lu-205",
    title: "TVET Automotive Engineering Practical Kit",
    type: "Practical",
    subject: "Automotive",
    author: "Instructor Kamau",
    uploaded: "1 week ago",
    size: "54 MB",
    level: "TVET Diploma",
    tone: "rose",
  },
  {
    id: "lu-206",
    title: "University — Microbiology Exam Revision Notes",
    type: "Notes",
    subject: "Biological Sciences",
    author: "Prof. Wanjiru",
    uploaded: "1 week ago",
    size: "22.8 MB",
    level: "University",
    tone: "green",
  },
] as const;
