"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Calendar, CalendarDays, Check, Edit, Filter, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate: string | null;
  completed: boolean;
  priority: string;
  categoryId?: string;
};

type Category = {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
};

export default function UpcomingPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Record<string, Task[]>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateGroups, setDateGroups] = useState<string[]>([]);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch tasks
        const tasksResponse = await fetch("/api/tasks");
        if (!tasksResponse.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);
        
        // Fetch categories
        const categoriesResponse = await fetch("/api/categories");
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Group tasks by date
    const groupedTasks: Record<string, Task[]> = {};
    const dates: string[] = [];
    
    // Filter tasks and group them by due date
    const filtered = tasks.filter(task => {
      if (!task.dueDate) return false;

      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);

      const matchesCategory = selectedCategory ? task.categoryId === selectedCategory : true;

      return taskDate.getTime() > today.getTime() && matchesCategory;
    });

    // Sort tasks by date
    filtered.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    // Group tasks by date
    filtered.forEach(task => {
      if (!task.dueDate) return;
      
      const date = new Date(task.dueDate);
      const dateStr = date.toISOString().split('T')[0];
      
      if (!groupedTasks[dateStr]) {
        groupedTasks[dateStr] = [];
        dates.push(dateStr);
      }
      
      groupedTasks[dateStr].push(task);
    });

    setUpcomingTasks(groupedTasks);
    setDateGroups(dates);
  }, [tasks, selectedCategory]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    
    if (date.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    } else if (date.getTime() === dayAfterTomorrow.getTime()) {
      return "Day after tomorrow";
    } else {
      return dateFormatter.format(date);
    }
  };

  const getDayDifference = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const taskDate = new Date(dateString);
    taskDate.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(taskDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getDateClassName = (dateString: string) => {
    const days = getDayDifference(dateString);
    
    if (days <= 2) {
      return "text-blue-600";
    } else if (days <= 7) {
      return "text-purple-600";
    } else {
      return "text-gray-600";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "NORMAL":
        return "bg-green-100 text-green-800 border-green-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "URGENT":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryById = (id: string | undefined) => {
    if (!id) return null;
    return categories.find(category => category.id === id);
  };

  const handleToggleComplete = async (id: string) => {
    try {
      const taskToUpdate = tasks.find(task => task.id === id);
      if (!taskToUpdate) return;

      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !taskToUpdate.completed
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task completion status');
      }

      const updatedTask = await response.json();
      
      // Update the task in the state
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
    } catch (err) {
      console.error('Error updating task completion:', err);
      setError('Failed to update task. Please try again.');
    }
  };

  const handleEditClick = (task: Task) => {
    setEditTask(task);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTask = async () => {
    if (!editTask) return;
    
    try {
      const taskData = {
        title: editTask.title,
        description: editTask.description,
        priority: editTask.priority,
        dueDate: editTask.dueDate ? editTask.dueDate : null,
        categoryId: editTask.categoryId || undefined,
      };

      const response = await fetch(`/api/tasks/${editTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      
      // Update the task in the state
      setTasks((prev) =>
        prev.map((task) => (task.id === editTask.id ? updatedTask : task))
      );
      
      setIsEditDialogOpen(false);
      setEditTask(null);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      // Remove the task from the state
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editTask) {
      setEditTask({ ...editTask, [name]: value });
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-md max-w-3xl mx-auto mt-8">
        <h3 className="text-lg font-semibold mb-2">Error</h3>
        <p>{error}</p>
        <Button 
          variant="outline" 
          className="mt-4 cursor-pointer"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <CalendarDays className="h-8 w-8 text-primary" />
          Upcoming Tasks
        </h1>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Plan ahead and stay organized with your upcoming tasks
          </p>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="cursor-pointer flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>{selectedCategory 
                    ? getCategoryById(selectedCategory)?.name 
                    : "All Categories"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem 
                  onClick={() => setSelectedCategory(null)}
                  className="cursor-pointer"
                >
                  All Categories
                </DropdownMenuItem>
                {categories.map(category => (
                  <DropdownMenuItem 
                    key={category.id} 
                    onClick={() => setSelectedCategory(category.id)}
                    className="cursor-pointer"
                  >
                    {category.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center">
          <div className="inline-block">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : dateGroups.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">No upcoming tasks</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
            {selectedCategory
              ? "Try selecting a different category to see tasks"
              : "You have no tasks scheduled for the future"}
          </p>
          <Button asChild className="cursor-pointer">
            <Link href="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {dateGroups.map((dateStr) => (
            <div key={dateStr} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${getDateClassName(dateStr)}`}>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">
                    {formatDate(dateStr)}
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    ({upcomingTasks[dateStr].length} {upcomingTasks[dateStr].length === 1 ? 'task' : 'tasks'})
                  </span>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {upcomingTasks[dateStr].map((task) => (
                  <div key={task.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={task.completed}
                          onCheckedChange={() => handleToggleComplete(task.id)}
                          className="mt-1 cursor-pointer"
                        />
                        <div>
                          <h3 className={`font-medium ${task.completed ? "line-through text-gray-500" : "text-gray-900 dark:text-white"}`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className={`text-sm mt-1 ${task.completed ? "line-through text-gray-400" : "text-gray-600 dark:text-gray-300"}`}>
                              {task.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {task.categoryId && (
                              <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full">
                                {getCategoryById(task.categoryId)?.name || "Category"}
                              </span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(task)} className="cursor-pointer">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleComplete(task.id)} className="cursor-pointer">
                              <Check className="h-4 w-4 mr-2" />
                              Mark as {task.completed ? 'incomplete' : 'complete'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-red-600 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Task Dialog */}
      {editTask && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium">Title</label>
                <Input
                  id="title"
                  name="title"
                  value={editTask.title}
                  onChange={handleEditChange}
                  className="w-full"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">Description (optional)</label>
                <Input
                  id="description"
                  name="description"
                  value={editTask.description || ""}
                  onChange={handleEditChange}
                  className="w-full"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="dueDate" className="text-sm font-medium">Due Date</label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={editTask.dueDate ? new Date(editTask.dueDate).toISOString().split('T')[0] : ""}
                  onChange={handleEditChange}
                  className="w-full"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={editTask.priority}
                  onChange={handleEditChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="categoryId" className="text-sm font-medium">Category (optional)</label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={editTask.categoryId || ""}
                  onChange={handleEditChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                >
                  <option value="">-- No Category --</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="cursor-pointer">
                Cancel
              </Button>
              <Button onClick={handleUpdateTask} className="cursor-pointer">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}