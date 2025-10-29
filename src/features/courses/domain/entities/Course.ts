export type Course = {
  _id: string;
  name: string;
  code: string;
  teacher_id: string;
  max_students: number;
  created_at: string; // ISO string
};

export type NewCourse = Omit<Course, "_id">;