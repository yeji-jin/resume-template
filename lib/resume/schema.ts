import { z } from "zod";

export const experienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  team: z.string(),
  role: z.string(),
  start: z.string(),
  end: z.string(),
  description: z.string(),
});

export const educationSchema = z.object({
  id: z.string(),
  school: z.string(),
  major: z.string(),
  degree: z.string(),
  status: z.string(),
  gpa: z.string(),
  start: z.string(),
  end: z.string(),
});

export const skillSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.enum(["상", "중", "하"]),
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  start: z.string(),
  end: z.string(),
  description: z.string(),
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+\-() ]{7,20}$/;

export const resumeDataSchema = z.object({
  name: z.string().min(1, "이름을 입력해 주세요."),
  phone: z
    .string()
    .min(1, "연락처를 입력해 주세요.")
    .refine((v) => PHONE_PATTERN.test(v), {
      message: "올바른 연락처 형식이 아닙니다. (숫자, -, +, 공백만 가능)",
    }),
  email: z.string().refine((v) => v === "" || EMAIL_PATTERN.test(v), {
    message: "올바른 이메일 형식이 아닙니다.",
  }),
  birth: z.string(),
  address: z.string(),
  photo: z.string(),
  summary: z.string(),
  experiences: z.array(experienceSchema),
  educations: z.array(educationSchema),
  skills: z.array(skillSchema),
  projects: z.array(projectSchema),
});

export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Project = z.infer<typeof projectSchema>;
export type ResumeData = z.infer<typeof resumeDataSchema>;
