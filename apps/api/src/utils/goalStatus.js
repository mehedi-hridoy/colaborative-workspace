export const calculateGoalProgress = (milestones = []) => {
  if (!milestones.length) return 0;

  const completed = milestones.filter((milestone) => milestone.completed).length;
  return Math.round((completed / milestones.length) * 100);
};

export const isGoalOverdue = (dueDate) => {
  if (!dueDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  return due < today;
};

export const getGoalStatus = (goal) => {
  const progress = calculateGoalProgress(goal.milestones || []);

  if (progress === 100) return "completed";
  if (isGoalOverdue(goal.dueDate)) return "overdue";
  return "open";
};
