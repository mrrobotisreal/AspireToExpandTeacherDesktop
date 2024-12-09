export interface LessonPackage {
  id: string;
  name: string;
  price: number;
}

export const lessonPackages: LessonPackage[] = [
  { id: "1_lesson", name: "1 Lesson", price: 40 }, // $40 per lesson
  { id: "3_lessons", name: "3 Lessons", price: 114 }, // $38 per lesson
  { id: "6_lessons", name: "6 Lessons", price: 210 }, // $35 per lesson
  { id: "12_lessons", name: "12 Lessons", price: 360 }, // $30 per lesson
];

export const STRIPE_PUBLISHABLE_KEY =
  window.electronAPI.getStripePublishableKey();
