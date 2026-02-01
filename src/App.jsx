import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Check,
  Clock,
  FileText,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";

export default function StudentPlanner() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // No password needed
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [motivationalQuote, setMotivationalQuote] = useState("");
  const [currentDate, setCurrentDate] = useState(() => {
    const saved = localStorage.getItem("aether-current-date");
    return saved ? new Date(saved) : new Date();
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    const saved = localStorage.getItem("aether-selected-date");
    return saved ? new Date(saved) : new Date();
  });

  // Load from localStorage or use empty arrays
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("aether-tasks");
    return saved ? JSON.parse(saved) : [];
  });
  const [taskGroups, setTaskGroups] = useState(() => {
    const saved = localStorage.getItem("aether-task-groups");
    return saved ? JSON.parse(saved) : {};
  });
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem("aether-events");
    return saved ? JSON.parse(saved) : [];
  });
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("aether-notes");
    return saved ? JSON.parse(saved) : [];
  });
  const [flashcards, setFlashcards] = useState(() => {
    const saved = localStorage.getItem("aether-flashcards");
    return saved ? JSON.parse(saved) : [];
  });
  const [archivedTasks, setArchivedTasks] = useState(() => {
    const saved = localStorage.getItem("aether-archived-tasks");
    return saved ? JSON.parse(saved) : [];
  });
  const [newTask, setNewTask] = useState({
    text: "",
    subject: "all",
    dueDate: "",
    notes: "",
    priority: "medium",
    recurring: "none",
    recurringDays: [],
  });
  const [newEvent, setNewEvent] = useState({
    title: "",
    time: "",
    endTime: "",
    recurring: "none",
    recurringDays: [],
    notes: "",
    subject: "all",
    showInAllTabs: false,
    customTime: false,
    customTimeValue: "",
  });
  const [editingTask, setEditingTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [view, setView] = useState("month");
  const [showEventModal, setShowEventModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [currentNote, setCurrentNote] = useState({
    title: "",
    content: "",
    subject: "all",
  });
  const [currentFlashcard, setCurrentFlashcard] = useState({
    front: "",
    back: "",
    subject: "all",
  });
  const [activeSubjectTab, setActiveSubjectTab] = useState("all");
  const [viewingNotes, setViewingNotes] = useState(false);
  const [viewingFlashcards, setViewingFlashcards] = useState(false);
  const [viewingArchived, setViewingArchived] = useState(false);
  const [viewingEventId, setViewingEventId] = useState(null);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [flashcardMastery, setFlashcardMastery] = useState({});
  const [calendarView, setCalendarView] = useState("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [studyMode, setStudyMode] = useState(false);

  // Timer state
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState("timer"); // 'timer' or 'stopwatch'
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState("work"); // 'work' or 'break'
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [pomodoroSubject, setPomodoroSubject] = useState("all");
  const [draggedTask, setDraggedTask] = useState(null);
  const [showDashboard, setShowDashboard] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [editingTaskFull, setEditingTaskFull] = useState(null);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [lastBreakReminder, setLastBreakReminder] = useState(null);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'high', 'overdue'
  const [viewMode, setViewMode] = useState("calendar"); // 'calendar' or 'daily'

  const PASSWORD = "Golden50%";

  const motivationalQuotes = [
    "Success is the sum of small efforts repeated day in and day out.",
    "The expert in anything was once a beginner.",
    "Education is not preparation for life; education is life itself.",
    "The only way to do great work is to love what you do.",
    "Believe you can and you're halfway there.",
    "Start where you are. Use what you have. Do what you can.",
    "Don't watch the clock; do what it does. Keep going.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "You don't have to be great to start, but you have to start to be great.",
  ];

  // Set random quote on mount
  useEffect(() => {
    const randomQuote =
      motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setMotivationalQuote(randomQuote);
  }, []);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-reset daily recurring tasks at midnight
  useEffect(() => {
    const checkMidnight = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        setTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (task.recurring === "daily" && task.completed) {
              return { ...task, completed: false };
            }
            return task;
          })
        );
      }
    }, 60000); // Check every minute
    return () => clearInterval(checkMidnight);
  }, []);

  // Smart Break Reminder - tracks study time
  useEffect(() => {
    let interval;
    if (isTimerRunning && pomodoroMode === "work") {
      interval = setInterval(() => {
        setTotalStudyTime((prev) => prev + 1);

        // Remind every 2 hours (7200 seconds)
        if (totalStudyTime > 0 && totalStudyTime % 7200 === 0) {
          const now = Date.now();
          if (!lastBreakReminder || now - lastBreakReminder > 7000000) {
            alert(
              "⏰ You've been studying for 2 hours! Consider taking a longer break to stay fresh."
            );
            setLastBreakReminder(now);
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pomodoroMode, totalStudyTime, lastBreakReminder]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("aether-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("aether-task-groups", JSON.stringify(taskGroups));
  }, [taskGroups]);

  useEffect(() => {
    localStorage.setItem("aether-events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem("aether-notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("aether-flashcards", JSON.stringify(flashcards));
  }, [flashcards]);

  useEffect(() => {
    localStorage.setItem(
      "aether-archived-tasks",
      JSON.stringify(archivedTasks)
    );
  }, [archivedTasks]);

  // Save current and selected dates
  useEffect(() => {
    localStorage.setItem("aether-current-date", currentDate.toISOString());
  }, [currentDate]);

  useEffect(() => {
    localStorage.setItem("aether-selected-date", selectedDate.toISOString());
  }, [selectedDate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Check if user is typing in an input/textarea
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      // Ctrl/Cmd + E: Add Event
      if ((e.ctrlKey || e.metaKey) && e.key === "e") {
        e.preventDefault();
        setShowEventModal(true);
      }

      // Ctrl/Cmd + T: Add Task
      if ((e.ctrlKey || e.metaKey) && e.key === "t") {
        e.preventDefault();
        setNewTask({
          text: "",
          subject: activeSubjectTab,
          dueDate: "",
          notes: "",
          priority: "medium",
          recurring: "none",
          recurringDays: [],
        });
        setShowTaskModal(true);
      }

      // Ctrl/Cmd + N: Add Note
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        setCurrentNote({ title: "", content: "", subject: activeSubjectTab });
        setShowNotesModal(true);
      }

      // Ctrl/Cmd + K: Add Flashcard
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCurrentFlashcard({ front: "", back: "", subject: activeSubjectTab });
        setShowFlashcardModal(true);
      }

      // Ctrl/Cmd + D: Toggle Daily/Calendar View
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        setViewMode(viewMode === "calendar" ? "daily" : "calendar");
      }

      // Arrow keys for date navigation (only in daily view and not in modals)
      if (
        !showEventModal &&
        !showTaskModal &&
        !showNotesModal &&
        !showFlashcardModal &&
        !showEditTaskModal
      ) {
        if (e.key === "ArrowLeft") {
          const newDate = new Date(selectedDate);
          newDate.setDate(newDate.getDate() - 1);
          setSelectedDate(newDate);
        }
        if (e.key === "ArrowRight") {
          const newDate = new Date(selectedDate);
          newDate.setDate(newDate.getDate() + 1);
          setSelectedDate(newDate);
        }
      }

      // Escape: Close any open modal
      if (e.key === "Escape") {
        setShowEventModal(false);
        setShowTaskModal(false);
        setShowNotesModal(false);
        setShowFlashcardModal(false);
        setShowEditTaskModal(false);
      }

      // T: Jump to today
      if (e.key === "t" && !e.ctrlKey && !e.metaKey) {
        setSelectedDate(new Date());
      }

      // Space: Toggle timer/stopwatch
      if (e.key === " " && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (timerMode === "timer") {
          setIsTimerRunning(!isTimerRunning);
        } else {
          setIsStopwatchRunning(!isStopwatchRunning);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    activeSubjectTab,
    selectedDate,
    viewMode,
    showEventModal,
    showTaskModal,
    showNotesModal,
    showFlashcardModal,
    showEditTaskModal,
    timerMode,
    isTimerRunning,
    isStopwatchRunning,
  ]);

  const subjects = [
    "all",
    "math",
    "history",
    "french",
    "english",
    "debate",
    "science",
    "robotics",
  ];

  const subjectColors = {
    all: "rgb(127, 29, 29)", // Dark red
    math: "rgb(153, 27, 27)", // Deep red
    history: "rgb(185, 28, 28)", // Crimson
    french: "rgb(220, 38, 38)", // Bright red
    english: "rgb(239, 68, 68)", // Light red
    debate: "rgb(248, 113, 113)", // Lighter red
    science: "rgb(254, 202, 202)", // Very pale red
    robotics: "rgb(254, 226, 226)", // Palest red
  };

  const subjectLinks = {
    math: [
      {
        label: "Schoology",
        url: "https://westminster.schoology.com/course/7921103142/materials",
      },
      {
        label: "Amplify",
        url: "https://learning.amplify.com/home/student/?state=5651ebbb-78f7-4eb3-8893-90986a34ee05&session_state=1ceb78b1-7990-411a-85d4-551ddd7e4d6d&code=3774c300-9353-48aa-b617-0759aac30ac8.1ceb78b1-7990-411a-85d4-551ddd7e4d6d.844899f7-1da4-4b86-8db7-37048b20bd57",
      },
      {
        label: "Formative",
        url: "https://app.formative.com/home/classes/695d55c615e21f08f50c40b2?show-formatives=to-do",
      },
      {
        label: "Sadlier",
        url: "https://www.sadlierconnect.com/library/product?productId=737&programId=29&subjectId=2&gradeId=12&programTocId=452&lessonDay=&productType=All+Components&edition=SE&language=English&pathway=&model=&programTocCode=&week=WEEKALL&hash=NTcxMjUxNg==",
      },
    ],
    debate: [
      {
        label: "Schoology",
        url: "https://westminster.schoology.com/group/7969324687",
      },
    ],
    french: [
      {
        label: "Schoology",
        url: "https://westminster.schoology.com/course/7921103088/materials",
      },
      { label: "Klett", url: "https://klettlp.com/v3/library" },
    ],
    english: [
      {
        label: "Schoology",
        url: "https://westminster.schoology.com/course/7921164323/materials",
      },
    ],
    history: [
      {
        label: "Schoology",
        url: "https://westminster.schoology.com/course/7921103320/materials",
      },
    ],
    robotics: [
      {
        label: "Schoology",
        url: "https://westminster.schoology.com/course/1629867397/materials",
      },
    ],
    science: [{ label: "Science Bowl", url: "https://sciencebowlprep.com/" }],
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Timer effect with Pomodoro
  useEffect(() => {
    let interval;
    if (timerMode === "timer" && isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Pomodoro cycle
      if (pomodoroMode === "work") {
        setPomodoroMode("break");
        setPomodoroCount((prev) => prev + 1);
        setTimerMinutes(5);
        setTimeRemaining(5 * 60);
        alert("Work session complete! Take a 5-minute break.");
      } else {
        setPomodoroMode("work");
        setTimerMinutes(25);
        setTimeRemaining(25 * 60);
        alert("Break complete! Ready for another work session.");
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining, timerMode, pomodoroMode]);

  // Stopwatch effect
  useEffect(() => {
    let interval;
    if (timerMode === "stopwatch" && isStopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStopwatchRunning, timerMode]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeRemaining(timerMinutes * 60);
    setPomodoroMode("work");
    setPomodoroCount(0);
  };

  const resetStopwatch = () => {
    setIsStopwatchRunning(false);
    setStopwatchTime(0);
  };

  const handlePasswordSubmit = (e) => {
    // Password removed - no longer needed
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const isSameDay = (date1, date2) => {
    return formatDate(date1) === formatDate(date2);
  };

  const addTask = () => {
    if (newTask.text.trim()) {
      const groupId = Date.now(); // Unique identifier for this group of recurring tasks

      const baseTask = {
        id: Date.now(),
        text: newTask.text,
        date: formatDate(selectedDate),
        completed: false,
        subject: newTask.subject,
        dueDate: newTask.dueDate,
        notes: newTask.notes,
        priority: newTask.priority,
        recurring: newTask.recurring,
        recurringDays: newTask.recurringDays,
        groupId: groupId,
      };

      const newTasks = [baseTask];
      const endDate = newTask.dueDate ? new Date(newTask.dueDate) : null;

      // Add recurring tasks
      if (newTask.recurring === "daily") {
        const startDate = new Date(selectedDate);
        const maxIterations = endDate
          ? Math.min(
              365,
              Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
            )
          : 30;

        for (let i = 1; i <= maxIterations; i++) {
          const recurringDate = new Date(startDate);
          recurringDate.setDate(startDate.getDate() + i);

          // Stop if we've reached the end date
          if (endDate && recurringDate > endDate) break;

          newTasks.push({
            ...baseTask,
            id: Date.now() + i,
            date: formatDate(recurringDate),
            groupId: groupId,
          });
        }
      } else if (newTask.recurring === "weekly") {
        const startDate = new Date(selectedDate);
        const maxWeeks = endDate
          ? Math.min(
              52,
              Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24 * 7))
            )
          : 12;

        for (let i = 1; i <= maxWeeks; i++) {
          const recurringDate = new Date(startDate);
          recurringDate.setDate(startDate.getDate() + i * 7);

          // Stop if we've reached the end date
          if (endDate && recurringDate > endDate) break;

          newTasks.push({
            ...baseTask,
            id: Date.now() + i,
            date: formatDate(recurringDate),
            groupId: groupId,
          });
        }
      } else if (newTask.recurring === "biweekly") {
        const startDate = new Date(selectedDate);
        const maxIterations = endDate
          ? Math.min(
              26,
              Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24 * 14))
            )
          : 12;

        for (let i = 1; i <= maxIterations; i++) {
          const recurringDate = new Date(startDate);
          recurringDate.setDate(startDate.getDate() + i * 14);

          // Stop if we've reached the end date
          if (endDate && recurringDate > endDate) break;

          newTasks.push({
            ...baseTask,
            id: Date.now() + i,
            date: formatDate(recurringDate),
            groupId: groupId,
          });
        }
      } else if (
        newTask.recurring === "custom" &&
        newTask.recurringDays.length > 0
      ) {
        const startDate = new Date(selectedDate);
        const maxWeeks = endDate
          ? Math.min(
              52,
              Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24 * 7))
            )
          : 12;

        for (let week = 0; week < maxWeeks; week++) {
          for (let day of newTask.recurringDays) {
            const recurringDate = new Date(startDate);
            recurringDate.setDate(
              startDate.getDate() + week * 7 + (day - startDate.getDay())
            );

            // Only add if date is in the future and before end date
            if (
              recurringDate >= startDate &&
              (!endDate || recurringDate <= endDate)
            ) {
              newTasks.push({
                ...baseTask,
                id: Date.now() + week * 7 + day,
                date: formatDate(recurringDate),
                groupId: groupId,
              });
            }
          }
        }
      }

      setTasks([...tasks, ...newTasks]);

      // Store the group info if it's recurring
      if (newTask.recurring !== "none") {
        setTaskGroups({
          ...taskGroups,
          [groupId]: {
            text: newTask.text,
            subject: newTask.subject,
            recurring: newTask.recurring,
            taskIds: newTasks.map((t) => t.id),
          },
        });
      }

      setNewTask({
        text: "",
        subject: "all",
        dueDate: "",
        notes: "",
        priority: "medium",
        recurring: "none",
        recurringDays: [],
      });
      setShowTaskModal(false);
    }
  };

  const addEvent = (e) => {
    e.preventDefault();
    if (newEvent.title.trim() && newEvent.time.trim()) {
      const baseEvent = {
        id: Date.now(),
        title: newEvent.title,
        time: newEvent.time,
        endTime: newEvent.endTime,
        date: formatDate(selectedDate),
        recurring: newEvent.recurring,
        recurringDays: newEvent.recurringDays,
        notes: newEvent.notes,
        subject: newEvent.subject,
        showInAllTabs: newEvent.showInAllTabs,
      };

      const newEvents = [baseEvent];

      if (newEvent.recurring === "daily") {
        const startDate = new Date(selectedDate);
        for (let i = 1; i <= 30; i++) {
          const recurringDate = new Date(startDate);
          recurringDate.setDate(startDate.getDate() + i);
          newEvents.push({
            ...baseEvent,
            id: Date.now() + i,
            date: formatDate(recurringDate),
          });
        }
      } else if (newEvent.recurring === "weekly") {
        const startDate = new Date(selectedDate);
        for (let i = 1; i <= 12; i++) {
          const recurringDate = new Date(startDate);
          recurringDate.setDate(startDate.getDate() + i * 7);
          newEvents.push({
            ...baseEvent,
            id: Date.now() + i,
            date: formatDate(recurringDate),
          });
        }
      } else if (newEvent.recurring === "biweekly") {
        const startDate = new Date(selectedDate);
        for (let i = 1; i <= 12; i++) {
          const recurringDate = new Date(startDate);
          recurringDate.setDate(startDate.getDate() + i * 14);
          newEvents.push({
            ...baseEvent,
            id: Date.now() + i,
            date: formatDate(recurringDate),
          });
        }
      } else if (
        newEvent.recurring === "custom" &&
        newEvent.recurringDays.length > 0
      ) {
        const startDate = new Date(selectedDate);
        for (let week = 0; week < 12; week++) {
          for (let day of newEvent.recurringDays) {
            const recurringDate = new Date(startDate);
            recurringDate.setDate(
              startDate.getDate() + week * 7 + (day - startDate.getDay())
            );

            if (recurringDate >= startDate) {
              newEvents.push({
                ...baseEvent,
                id: Date.now() + week * 7 + day,
                date: formatDate(recurringDate),
              });
            }
          }
        }
      }

      setEvents([...events, ...newEvents]);
      setNewEvent({
        title: "",
        time: "",
        endTime: "",
        recurring: "none",
        recurringDays: [],
        notes: "",
        subject: "all",
        showInAllTabs: false,
      });
      setShowEventModal(false);
    }
  };

  const saveNote = () => {
    if (currentNote.title.trim() && currentNote.content.trim()) {
      setNotes([
        ...notes,
        {
          id: Date.now(),
          title: currentNote.title,
          content: currentNote.content,
          subject: currentNote.subject,
          date: new Date().toISOString(),
        },
      ]);
      setCurrentNote({ title: "", content: "", subject: "all" });
      setShowNotesModal(false);
    }
  };

  const saveFlashcard = () => {
    if (currentFlashcard.front.trim() && currentFlashcard.back.trim()) {
      setFlashcards([
        ...flashcards,
        {
          id: Date.now(),
          front: currentFlashcard.front,
          back: currentFlashcard.back,
          subject: currentFlashcard.subject,
          date: new Date().toISOString(),
        },
      ]);
      setCurrentFlashcard({ front: "", back: "", subject: "all" });
      setShowFlashcardModal(false);
    }
  };

  const deleteNote = (id) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const deleteFlashcard = (id) => {
    setFlashcards(flashcards.filter((f) => f.id !== id));
    // Reset view if no cards left
    if (flashcards.filter((f) => f.id !== id).length === 0) {
      setViewingFlashcards(false);
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const deleteAllRecurringInstances = (task) => {
    console.log("Delete all clicked for task:", task);

    // If task has a groupId, use that
    if (task.groupId) {
      console.log("Deleting by groupId:", task.groupId);
      const tasksToKeep = tasks.filter((t) => t.groupId !== task.groupId);
      console.log(
        "Tasks before:",
        tasks.length,
        "Tasks after:",
        tasksToKeep.length
      );
      setTasks(tasksToKeep);

      // Remove the group info
      const newGroups = { ...taskGroups };
      delete newGroups[task.groupId];
      setTaskGroups(newGroups);
      return;
    }

    // Fallback: If no groupId (old tasks), match by properties
    if (task.recurring && task.recurring !== "none") {
      console.log("Deleting by matching properties (no groupId)");
      const tasksToKeep = tasks.filter(
        (t) =>
          !(
            t.text === task.text &&
            t.subject === task.subject &&
            t.recurring === task.recurring &&
            t.priority === task.priority
          )
      );
      console.log(
        "Tasks before:",
        tasks.length,
        "Tasks after:",
        tasksToKeep.length
      );
      setTasks(tasksToKeep);
      return;
    }

    // If not recurring, just delete the single task
    console.log("Not recurring, deleting single task");
    deleteTask(task.id);
  };

  const archiveTask = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setArchivedTasks([
        ...archivedTasks,
        { ...task, archivedDate: new Date().toISOString() },
      ]);
      setTasks(tasks.filter((t) => t.id !== id));
    }
  };

  const unarchiveTask = (id) => {
    const task = archivedTasks.find((t) => t.id === id);
    if (task) {
      const { archivedDate, ...taskWithoutArchive } = task;
      setTasks([...tasks, taskWithoutArchive]);
      setArchivedTasks(archivedTasks.filter((t) => t.id !== id));
    }
  };

  const markFlashcardMastery = (id, mastered) => {
    setFlashcardMastery({ ...flashcardMastery, [id]: mastered });
  };

  // Drag and drop handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetTask) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.id === targetTask.id) return;

    const allTasks = [...tasks];
    const draggedIndex = allTasks.findIndex((t) => t.id === draggedTask.id);
    const targetIndex = allTasks.findIndex((t) => t.id === targetTask.id);

    // Remove dragged task
    const [removed] = allTasks.splice(draggedIndex, 1);
    // Insert at target position
    allTasks.splice(targetIndex, 0, removed);

    setTasks(allTasks);
    setDraggedTask(null);
  };

  // Calculate progress
  const getSubjectProgress = (subject) => {
    const subjectTasks =
      subject === "all" ? tasks : tasks.filter((t) => t.subject === subject);
    const completed = subjectTasks.filter((t) => t.completed).length;
    const total = subjectTasks.length;
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-l-4 border-red-600";
      case "medium":
        return "border-l-4 border-red-400";
      case "low":
        return "border-l-4 border-red-200";
      default:
        return "";
    }
  };

  const convertTo12Hour = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    const todayStr = formatDate(now);
    const currentTime = now.getHours() * 60 + now.getMinutes();

    return events
      .filter((e) => e.date === todayStr)
      .filter((e) => {
        const [hours, minutes] = e.time.includes(":")
          ? e.time.split(/[: ]/)
          : [0, 0];
        const eventHour =
          parseInt(hours) + (e.time.includes("PM") && hours !== "12" ? 12 : 0);
        const eventMinutes = eventHour * 60 + parseInt(minutes || 0);
        return eventMinutes > currentTime;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const upcomingEvents = getUpcomingEvents();

  const deleteEvent = (id) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const updateTask = (id, newText) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, text: newText } : t)));
    setEditingTask(null);
  };

  const updateTaskFull = () => {
    if (editingTaskFull && editingTaskFull.text.trim()) {
      // If recurring was changed, we need to handle it
      const originalTask = tasks.find((t) => t.id === editingTaskFull.id);

      // If the task is now recurring and wasn't before, OR recurring settings changed
      if (
        editingTaskFull.recurring !== "none" &&
        (originalTask.recurring !== editingTaskFull.recurring ||
          JSON.stringify(originalTask.recurringDays) !==
            JSON.stringify(editingTaskFull.recurringDays))
      ) {
        // Remove old task
        const otherTasks = tasks.filter((t) => t.id !== editingTaskFull.id);

        // Create new recurring tasks
        const baseTask = {
          ...editingTaskFull,
          id: Date.now(),
          date: originalTask.date,
        };

        const newTasks = [baseTask];
        const startDate = new Date(originalTask.date);

        if (editingTaskFull.recurring === "daily") {
          for (let i = 1; i <= 30; i++) {
            const recurringDate = new Date(startDate);
            recurringDate.setDate(startDate.getDate() + i);
            newTasks.push({
              ...baseTask,
              id: Date.now() + i,
              date: formatDate(recurringDate),
            });
          }
        } else if (editingTaskFull.recurring === "weekly") {
          for (let i = 1; i <= 12; i++) {
            const recurringDate = new Date(startDate);
            recurringDate.setDate(startDate.getDate() + i * 7);
            newTasks.push({
              ...baseTask,
              id: Date.now() + i,
              date: formatDate(recurringDate),
            });
          }
        } else if (editingTaskFull.recurring === "biweekly") {
          for (let i = 1; i <= 12; i++) {
            const recurringDate = new Date(startDate);
            recurringDate.setDate(startDate.getDate() + i * 14);
            newTasks.push({
              ...baseTask,
              id: Date.now() + i,
              date: formatDate(recurringDate),
            });
          }
        } else if (
          editingTaskFull.recurring === "custom" &&
          editingTaskFull.recurringDays.length > 0
        ) {
          for (let week = 0; week < 12; week++) {
            for (let day of editingTaskFull.recurringDays) {
              const recurringDate = new Date(startDate);
              recurringDate.setDate(
                startDate.getDate() + week * 7 + (day - startDate.getDay())
              );

              if (recurringDate >= startDate) {
                newTasks.push({
                  ...baseTask,
                  id: Date.now() + week * 7 + day,
                  date: formatDate(recurringDate),
                });
              }
            }
          }
        }

        setTasks([...otherTasks, ...newTasks]);
      } else {
        // Just update the single task
        setTasks(
          tasks.map((t) => (t.id === editingTaskFull.id ? editingTaskFull : t))
        );
      }

      setShowEditTaskModal(false);
      setEditingTaskFull(null);
    }
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate);

  const selectedTasks = tasks
    .filter((t) => {
      // For tasks without a due date, only show on the specific date they were added
      if (!t.dueDate) {
        return t.date === formatDate(selectedDate);
      }

      // For tasks with a due date, show them from their start date until the due date
      const taskStartDate = t.date;
      const selectedDateStr = formatDate(selectedDate);
      const dueDateStr = t.dueDate;

      // Show task if: selected date >= task start date AND selected date <= due date
      return selectedDateStr >= taskStartDate && selectedDateStr <= dueDateStr;
    })
    .filter((t) =>
      activeSubjectTab === "all" ? true : t.subject === activeSubjectTab
    )
    .filter(
      (t) =>
        searchQuery === "" ||
        t.text.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const selectedEvents = events
    .filter((e) => e.date === formatDate(selectedDate))
    .filter((e) => {
      if (activeSubjectTab === "all") {
        return true; // Show all events in 'all' tab
      } else {
        return e.subject === activeSubjectTab || e.showInAllTabs;
      }
    })
    .filter(
      (e) =>
        searchQuery === "" ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.time.localeCompare(b.time));

  const filteredTasks = selectedTasks
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .filter((task) => {
      if (activeFilter === "high") {
        return task.priority === "high";
      } else if (activeFilter === "overdue") {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dueDate < today && !task.completed;
      }
      return true; // 'all' filter
    });

  const filteredNotes =
    activeSubjectTab === "all"
      ? notes.filter(
          (n) =>
            searchQuery === "" ||
            n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : notes
          .filter((n) => n.subject === activeSubjectTab)
          .filter(
            (n) =>
              searchQuery === "" ||
              n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              n.content.toLowerCase().includes(searchQuery.toLowerCase())
          );

  const filteredFlashcards =
    activeSubjectTab === "all"
      ? flashcards.filter((f) => !studyMode || !flashcardMastery[f.id])
      : flashcards
          .filter((f) => f.subject === activeSubjectTab)
          .filter((f) => !studyMode || !flashcardMastery[f.id]);

  const filteredArchivedTasks =
    activeSubjectTab === "all"
      ? archivedTasks
      : archivedTasks.filter((t) => t.subject === activeSubjectTab);

  const getTasksForDate = (date) => {
    return tasks.filter((t) => t.date === formatDate(date));
  };

  const getEventsForDate = (date) => {
    return events.filter((e) => e.date === formatDate(date));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-lg p-8 max-w-md w-full border border-red-900">
          <h1 className="text-3xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
            <Calendar className="text-red-500" />
            _Planner
          </h1>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-red-400 mb-2 text-sm font-semibold">
                Enter Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
                placeholder="Password"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-black rounded-2xl shadow-lg p-6 mb-6 border border-red-800">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  <Calendar className="text-red-500" />
                  Planner
                </h1>
                <p className="text-gray-400 text-xs mt-1">Aether</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Digital Clock */}
                <div className="text-white text-lg font-mono">
                  {currentTime.toLocaleTimeString("en-US", {
                    timeZone: "America/New_York",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </div>

                <a
                  href="https://westminster.schoology.com/calendar/131730035/2025-11"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 text-xs hover:text-red-400 transition whitespace-nowrap select-none"
                >
                  Check Schoology Calendar
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <a
                href="https://westminster.schoology.com/home"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Schoology <ExternalLink size={16} />
              </a>
              <a
                href="https://westminster.schoology.com/grades/grades"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Grades <ExternalLink size={16} />
              </a>
              <a
                href="https://www.youtube.com/@LofiGirl"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Lofi <ExternalLink size={16} />
              </a>
              <a
                href="https://portals.veracross.com/westminster/student"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition"
              >
                Veracross <ExternalLink size={16} />
              </a>
            </div>
            <div>
              <a
                href="https://mail.google.com/mail/u/0/?tab=rm&ogbl#inbox"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-900 transition w-full"
              >
                Gmail <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Dashboard */}
        {showDashboard && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-lg p-6 mb-6 border border-red-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Dashboard</h2>
              <button
                onClick={() => setShowDashboard(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Left Column - Today's Overview */}
              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-red-400 font-semibold mb-3">
                    Today's Overview
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Tasks</span>
                      <span className="text-white font-bold">
                        {selectedTasks.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Completed</span>
                      <span className="text-white font-bold">
                        {selectedTasks.filter((t) => t.completed).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Pomodoros</span>
                      <span className="text-white font-bold">
                        {pomodoroCount}
                      </span>
                    </div>
                    {pomodoroSubject !== "all" && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Current Subject</span>
                        <span className="text-red-400">
                          {capitalizeFirst(pomodoroSubject)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Next Event & Tasks */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-red-400 font-semibold mb-3">Coming Up</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Next Event */}
                    <div>
                      <h4 className="text-gray-300 text-xs font-semibold mb-2">
                        Next Event
                      </h4>
                      {upcomingEvents.length > 0 ? (
                        <div className="space-y-1">
                          <div className="text-white text-sm font-semibold">
                            {upcomingEvents[0].title}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {convertTo12Hour(upcomingEvents[0].time)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-xs">
                          No upcoming events
                        </div>
                      )}
                    </div>

                    {/* Next Tasks */}
                    <div>
                      <h4 className="text-gray-300 text-xs font-semibold mb-2">
                        Today's Tasks
                      </h4>
                      {selectedTasks.filter((t) => !t.completed).length > 0 ? (
                        <div className="space-y-1">
                          {selectedTasks
                            .filter((t) => !t.completed)
                            .slice(0, 3)
                            .map((task) => (
                              <div
                                key={task.id}
                                className="text-white text-xs truncate"
                              >
                                • {task.text}
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-xs">
                          All done! 🎉
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Subject Progress */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-red-400 font-semibold mb-3">
                  Subject Progress
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {subjects
                    .filter((s) => s !== "all")
                    .map((subject) => {
                      const progress = getSubjectProgress(subject);
                      return (
                        <div key={subject} className="text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white capitalize text-xs">
                              {subject}
                            </span>
                            <span className="text-red-400 text-xs font-bold">
                              {progress}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}

        {!showDashboard && (
          <button
            onClick={() => setShowDashboard(true)}
            className="w-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-lg p-4 mb-6 border border-red-900 hover:border-red-700 transition text-white font-semibold"
          >
            Show Dashboard
          </button>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar or Daily View */}
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-lg p-6 border border-red-900">
            {/* View Toggle */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  viewMode === "calendar"
                    ? "bg-red-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                📅 Month View
              </button>
              <button
                onClick={() => setViewMode("daily")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  viewMode === "daily"
                    ? "bg-red-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                📋 Daily View
              </button>
            </div>

            {viewMode === "calendar" ? (
              /* Month Calendar View */
              <>
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={previousMonth}
                    className="p-2 hover:bg-red-900 rounded-lg text-white transition"
                  >
                    <ChevronLeft />
                  </button>
                  <h2 className="text-2xl font-bold text-white">
                    {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-red-900 rounded-lg text-white transition"
                  >
                    <ChevronRight />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-2">
                  {days.map((day) => (
                    <div
                      key={day}
                      className="text-center font-semibold text-red-400 py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {[...Array(firstDay)].map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square"></div>
                  ))}
                  {[...Array(daysInMonth)].map((_, i) => {
                    const date = new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      i + 1
                    );
                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, new Date());
                    const dateTasks = getTasksForDate(date);
                    const dateEvents = getEventsForDate(date);
                    const hasItems =
                      dateTasks.length > 0 || dateEvents.length > 0;

                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(date)}
                        className={`aspect-square rounded-lg p-2 transition relative ${
                          isSelected
                            ? "bg-red-600 text-white shadow-lg"
                            : isToday
                            ? "bg-red-900 text-red-100 font-bold border border-red-500"
                            : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                        }`}
                      >
                        <div className="text-sm">{i + 1}</div>
                        {hasItems && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                            {dateEvents.length > 0 && (
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected ? "bg-red-300" : "bg-red-400"
                                }`}
                              ></div>
                            )}
                            {dateTasks.slice(0, 2).map((_, idx) => (
                              <div
                                key={idx}
                                className={`w-1 h-1 rounded-full ${
                                  isSelected ? "bg-white" : "bg-red-400"
                                }`}
                              ></div>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              /* Daily Timeline View */
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(newDate.getDate() - 1);
                      setSelectedDate(newDate);
                    }}
                    className="p-2 hover:bg-red-900 rounded-lg text-white transition"
                  >
                    <ChevronLeft />
                  </button>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white">
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                      })}
                    </h2>
                    <p className="text-gray-400">
                      {selectedDate.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(newDate.getDate() + 1);
                      setSelectedDate(newDate);
                    }}
                    className="p-2 hover:bg-red-900 rounded-lg text-white transition"
                  >
                    <ChevronRight />
                  </button>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setShowEventModal(true)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition text-sm flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Add Event
                  </button>
                  <button
                    onClick={() => {
                      setNewTask({
                        text: "",
                        subject: activeSubjectTab,
                        dueDate: "",
                        notes: "",
                        priority: "medium",
                        recurring: "none",
                        recurringDays: [],
                      });
                      setShowTaskModal(true);
                    }}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition text-sm flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Add Task
                  </button>
                </div>

                {!isSameDay(selectedDate, new Date()) && (
                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className="w-full bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition text-sm mb-4"
                  >
                    Jump to Today
                  </button>
                )}

                {/* Timeline */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {/* Morning Section */}
                  <div>
                    <div className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                      Morning
                    </div>
                    <div className="space-y-2 pl-4">
                      {selectedEvents
                        .filter((e) => {
                          const hour = parseInt(e.time.split(":")[0]);
                          const isPM = e.time.includes("PM");
                          const hour24 = isPM && hour !== 12 ? hour + 12 : hour;
                          return hour24 < 12;
                        })
                        .map((event) => (
                          <div
                            key={event.id}
                            className="p-3 rounded-lg bg-red-900 bg-opacity-30 border-l-4 border-red-500"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="text-red-400 font-semibold text-sm mb-1">
                                  {event.time}
                                  {event.endTime && ` - ${event.endTime}`}
                                </div>
                                <div className="text-white font-medium">
                                  {event.title}
                                </div>
                                {event.notes && (
                                  <div className="text-gray-300 text-sm mt-1">
                                    {event.notes}
                                  </div>
                                )}
                                {event.subject && event.subject !== "all" && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-red-600 text-white mt-2 inline-block">
                                    {capitalizeFirst(event.subject)}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => deleteEvent(event.id)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Afternoon Section */}
                  <div>
                    <div className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                      Afternoon
                    </div>
                    <div className="space-y-2 pl-4">
                      {selectedEvents
                        .filter((e) => {
                          const hour = parseInt(e.time.split(":")[0]);
                          const isPM = e.time.includes("PM");
                          const hour24 = isPM && hour !== 12 ? hour + 12 : hour;
                          return hour24 >= 12 && hour24 < 17;
                        })
                        .map((event) => (
                          <div
                            key={event.id}
                            className="p-3 rounded-lg bg-red-900 bg-opacity-30 border-l-4 border-red-500"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="text-red-400 font-semibold text-sm mb-1">
                                  {event.time}
                                  {event.endTime && ` - ${event.endTime}`}
                                </div>
                                <div className="text-white font-medium">
                                  {event.title}
                                </div>
                                {event.notes && (
                                  <div className="text-gray-300 text-sm mt-1">
                                    {event.notes}
                                  </div>
                                )}
                                {event.subject && event.subject !== "all" && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-red-600 text-white mt-2 inline-block">
                                    {capitalizeFirst(event.subject)}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => deleteEvent(event.id)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Evening Section */}
                  <div>
                    <div className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                      Evening
                    </div>
                    <div className="space-y-2 pl-4">
                      {selectedEvents
                        .filter((e) => {
                          const hour = parseInt(e.time.split(":")[0]);
                          const isPM = e.time.includes("PM");
                          const hour24 = isPM && hour !== 12 ? hour + 12 : hour;
                          return hour24 >= 17;
                        })
                        .map((event) => (
                          <div
                            key={event.id}
                            className="p-3 rounded-lg bg-red-900 bg-opacity-30 border-l-4 border-red-500"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="text-red-400 font-semibold text-sm mb-1">
                                  {event.time}
                                  {event.endTime && ` - ${event.endTime}`}
                                </div>
                                <div className="text-white font-medium">
                                  {event.title}
                                </div>
                                {event.notes && (
                                  <div className="text-gray-300 text-sm mt-1">
                                    {event.notes}
                                  </div>
                                )}
                                {event.subject && event.subject !== "all" && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-red-600 text-white mt-2 inline-block">
                                    {capitalizeFirst(event.subject)}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => deleteEvent(event.id)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Tasks Section */}
                  <div className="pt-4 border-t border-gray-700">
                    <div className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                      Tasks ({selectedTasks.filter((t) => !t.completed).length}{" "}
                      remaining)
                    </div>
                    <div className="space-y-2 pl-4">
                      {selectedTasks
                        .filter((t) =>
                          activeSubjectTab === "all"
                            ? true
                            : t.subject === activeSubjectTab
                        )
                        .sort((a, b) => {
                          // Incomplete first
                          if (a.completed !== b.completed)
                            return a.completed ? 1 : -1;
                          // Then by priority
                          const priorityOrder = { high: 0, medium: 1, low: 2 };
                          return (
                            priorityOrder[a.priority] -
                            priorityOrder[b.priority]
                          );
                        })
                        .map((task) => (
                          <div
                            key={task.id}
                            className={`p-3 rounded-lg border ${getPriorityColor(
                              task.priority
                            )} ${
                              task.completed
                                ? "bg-gray-700 bg-opacity-50 border-gray-600"
                                : "bg-gray-700 border-gray-600"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTask(task.id)}
                                className="w-5 h-5 mt-1 rounded border-2 border-red-600 bg-gray-700 checked:bg-red-600 checked:border-red-600 focus:ring-red-500 focus:ring-2 cursor-pointer appearance-none flex items-center justify-center"
                                style={{
                                  backgroundImage: task.completed
                                    ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E")`
                                    : "none",
                                  backgroundSize: "100% 100%",
                                  backgroundPosition: "center",
                                  backgroundRepeat: "no-repeat",
                                }}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`${
                                      task.completed
                                        ? "line-through text-gray-500"
                                        : "text-gray-200"
                                    }`}
                                  >
                                    {task.text}
                                  </span>
                                  {task.subject !== "all" && (
                                    <span className="text-xs px-2 py-0.5 rounded bg-red-600 text-white">
                                      {capitalizeFirst(task.subject)}
                                    </span>
                                  )}
                                  <span className="text-xs px-2 py-0.5 rounded bg-gray-600 text-white">
                                    {capitalizeFirst(task.priority)}
                                  </span>
                                </div>
                                {task.dueDate && task.recurring === "none" && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    Due:{" "}
                                    {new Date(
                                      task.dueDate
                                    ).toLocaleDateString()}
                                  </div>
                                )}
                                {task.recurring !== "none" && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    🔁{" "}
                                    {task.recurring === "daily"
                                      ? "Daily"
                                      : task.recurring === "weekly"
                                      ? "Weekly"
                                      : task.recurring === "biweekly"
                                      ? "Biweekly"
                                      : "Custom"}
                                    {task.dueDate &&
                                      ` until ${new Date(
                                        task.dueDate
                                      ).toLocaleDateString()}`}
                                  </div>
                                )}
                                {task.notes && (
                                  <div className="text-xs text-gray-400 italic mt-1">
                                    {task.notes}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2 items-center">
                                <button
                                  onClick={() => {
                                    setEditingTaskFull(task);
                                    setShowEditTaskModal(true);
                                  }}
                                  className="text-gray-400 hover:text-red-400 p-1"
                                  title="Edit task"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => deleteTask(task.id)}
                                  className="text-gray-400 hover:text-red-500 p-1"
                                  title="Delete this instance"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                              {task.recurring && task.recurring !== "none" && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const confirmed = window.confirm(
                                      `Delete ALL "${task.text}"?`
                                    );
                                    if (confirmed) {
                                      deleteAllRecurringInstances(task);
                                    }
                                  }}
                                  className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded font-semibold text-sm"
                                >
                                  🗑️ Delete All Recurring Instances
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                      {selectedTasks.length === 0 && (
                        <p className="text-gray-500 text-sm text-center py-4">
                          No tasks for this day
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tasks & Events Panel */}
          <div className="lg:col-span-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-lg p-6 border border-red-900">
            <h3 className="text-xl font-bold text-white mb-4">
              {selectedDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h3>

            {/* Events Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                  <Clock size={18} />
                  Events
                </h4>
                <button
                  onClick={() => setShowEventModal(true)}
                  className="bg-red-600 text-white p-1.5 rounded-lg hover:bg-red-700 transition"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {selectedEvents.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-2">
                    No events
                  </p>
                ) : (
                  selectedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg bg-red-900 bg-opacity-30 border border-red-800"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-red-400 font-semibold text-sm mb-1">
                            {event.time}
                            {event.endTime && ` - ${event.endTime}`}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="text-white">{event.title}</div>
                            {event.subject && event.subject !== "all" && (
                              <span className="text-xs px-2 py-0.5 rounded bg-red-600 text-white">
                                {capitalizeFirst(event.subject)}
                              </span>
                            )}
                          </div>
                          {event.notes && (
                            <div className="text-gray-300 text-sm mt-2">
                              <div className="text-gray-400 italic">
                                {event.notes.split("\n")[0]}
                              </div>
                              {(event.notes.split("\n").length > 1 ||
                                event.notes.split("\n")[0].length > 50) &&
                                viewingEventId === event.id && (
                                  <div className="mt-1 p-2 bg-gray-800 bg-opacity-50 rounded">
                                    {event.notes
                                      .split("\n")
                                      .slice(1)
                                      .join("\n")}
                                  </div>
                                )}
                            </div>
                          )}
                          {event.recurring === "daily" && (
                            <div className="text-gray-400 text-xs mt-1">
                              🔁 Daily
                            </div>
                          )}
                          {event.recurring === "weekly" && (
                            <div className="text-gray-400 text-xs mt-1">
                              🔁 Weekly
                            </div>
                          )}
                          {event.recurring === "custom" &&
                            event.recurringDays && (
                              <div className="text-gray-400 text-xs mt-1">
                                🔁{" "}
                                {event.recurringDays
                                  .map(
                                    (d) =>
                                      [
                                        "Sun",
                                        "Mon",
                                        "Tue",
                                        "Wed",
                                        "Thu",
                                        "Fri",
                                        "Sat",
                                      ][d]
                                  )
                                  .join(", ")}
                              </div>
                            )}
                        </div>
                        <div className="flex gap-1">
                          {event.notes &&
                            (event.notes.split("\n").length > 1 ||
                              event.notes.split("\n")[0].length > 50) && (
                              <button
                                onClick={() =>
                                  setViewingEventId(
                                    viewingEventId === event.id
                                      ? null
                                      : event.id
                                  )
                                }
                                className="text-gray-400 hover:text-blue-400"
                                title={
                                  viewingEventId === event.id
                                    ? "Hide full notes"
                                    : "Show full notes"
                                }
                              >
                                <FileText size={16} />
                              </button>
                            )}
                          <button
                            onClick={() => deleteEvent(event.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tasks Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-red-400">Tasks</h4>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setCurrentNote({
                        title: "",
                        content: "",
                        subject: activeSubjectTab,
                      });
                      setShowNotesModal(true);
                    }}
                    className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    <Plus size={14} />
                    Note
                  </button>
                  <button
                    onClick={() => {
                      setNewTask({
                        text: "",
                        subject: activeSubjectTab,
                        dueDate: "",
                        notes: "",
                        priority: "medium",
                        recurring: "none",
                        recurringDays: [],
                      });
                      setShowTaskModal(true);
                    }}
                    className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    <Plus size={14} />
                    Recurring
                  </button>
                  <button
                    onClick={() => {
                      setCurrentFlashcard({
                        front: "",
                        back: "",
                        subject: activeSubjectTab,
                      });
                      setShowFlashcardModal(true);
                    }}
                    className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    <Plus size={14} />
                    Card
                  </button>
                  {activeSubjectTab !== "all" &&
                    subjectLinks[activeSubjectTab] && (
                      <>
                        {subjectLinks[activeSubjectTab].map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition text-sm"
                          >
                            {link.label} <ExternalLink size={14} />
                          </a>
                        ))}
                      </>
                    )}
                  {filteredNotes.length > 0 && (
                    <button
                      onClick={() => {
                        setViewingNotes(!viewingNotes);
                        setViewingFlashcards(false);
                      }}
                      className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      <FileText size={14} />
                      {viewingNotes ? "Tasks" : "Notes"}
                    </button>
                  )}
                  {filteredFlashcards.length > 0 && (
                    <button
                      onClick={() => {
                        setViewingFlashcards(!viewingFlashcards);
                        setViewingNotes(false);
                        setCurrentFlashcardIndex(0);
                        setShowFlashcardAnswer(false);
                      }}
                      className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      <FileText size={14} />
                      {viewingFlashcards ? "Tasks" : "Cards"}
                    </button>
                  )}
                </div>
              </div>

              {viewingNotes ? (
                // Notes View
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="text-white font-semibold">
                      {capitalizeFirst(activeSubjectTab)} Notes
                    </h5>
                    <button
                      onClick={() => setViewingNotes(false)}
                      className="text-gray-400 hover:text-white text-sm"
                    >
                      Back to Tasks
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentNote({
                        title: "",
                        content: "",
                        subject: activeSubjectTab,
                      });
                      setShowNotesModal(true);
                    }}
                    className="w-full mb-4 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    New Note
                  </button>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredNotes.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">
                        No notes
                      </p>
                    ) : (
                      filteredNotes.map((note) => (
                        <div
                          key={note.id}
                          className="p-3 rounded-lg bg-gray-700 border border-gray-600"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h6 className="text-white font-semibold">
                              {note.title}
                            </h6>
                            <button
                              onClick={() => deleteNote(note.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <p className="text-gray-300 text-sm whitespace-pre-wrap">
                            {note.content}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">
                              {new Date(note.date).toLocaleDateString()}
                            </span>
                            {note.subject !== "all" && (
                              <span className="text-xs px-2 py-0.5 rounded bg-red-600 text-white capitalize">
                                {capitalizeFirst(note.subject)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : viewingFlashcards ? (
                // Flashcards View
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="text-white font-semibold">
                      {capitalizeFirst(activeSubjectTab)} Flashcards
                    </h5>
                    <button
                      onClick={() => {
                        setViewingFlashcards(false);
                        setCurrentFlashcardIndex(0);
                        setShowFlashcardAnswer(false);
                      }}
                      className="text-gray-400 hover:text-white text-sm"
                    >
                      Back to Tasks
                    </button>
                  </div>

                  {filteredFlashcards.length === 0 ? (
                    <div>
                      <p className="text-gray-500 text-sm text-center py-4 mb-4">
                        No flashcards
                      </p>
                      <button
                        onClick={() => {
                          setCurrentFlashcard({
                            front: "",
                            back: "",
                            subject: activeSubjectTab,
                          });
                          setShowFlashcardModal(true);
                        }}
                        className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                      >
                        <Plus size={16} />
                        Create First Flashcard
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4 text-center text-gray-400 text-sm">
                        Card {currentFlashcardIndex + 1} of{" "}
                        {filteredFlashcards.length}
                      </div>

                      <div
                        onClick={() =>
                          setShowFlashcardAnswer(!showFlashcardAnswer)
                        }
                        className="bg-gray-700 border border-gray-600 rounded-lg p-6 mb-4 min-h-48 flex items-center justify-center cursor-pointer hover:bg-gray-650 transition"
                      >
                        <div className="text-center">
                          <div className="text-gray-400 text-xs mb-2">
                            {showFlashcardAnswer ? "Answer" : "Question"}
                          </div>
                          <p className="text-white text-lg">
                            {showFlashcardAnswer
                              ? filteredFlashcards[currentFlashcardIndex].back
                              : filteredFlashcards[currentFlashcardIndex].front}
                          </p>
                          <div className="text-gray-500 text-xs mt-4">
                            Click to {showFlashcardAnswer ? "hide" : "reveal"}{" "}
                            answer
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={() => {
                            setCurrentFlashcardIndex(
                              (currentFlashcardIndex -
                                1 +
                                filteredFlashcards.length) %
                                filteredFlashcards.length
                            );
                            setShowFlashcardAnswer(false);
                          }}
                          className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => {
                            setCurrentFlashcardIndex(
                              (currentFlashcardIndex + 1) %
                                filteredFlashcards.length
                            );
                            setShowFlashcardAnswer(false);
                          }}
                          className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition"
                        >
                          Next
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setCurrentFlashcard({
                              front: "",
                              back: "",
                              subject: activeSubjectTab,
                            });
                            setShowFlashcardModal(true);
                          }}
                          className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                        >
                          <Plus size={16} />
                          Add Card
                        </button>
                        <button
                          onClick={() => {
                            const card =
                              filteredFlashcards[currentFlashcardIndex];
                            if (card) {
                              deleteFlashcard(card.id);
                              if (currentFlashcardIndex > 0) {
                                setCurrentFlashcardIndex(
                                  currentFlashcardIndex - 1
                                );
                              }
                              setShowFlashcardAnswer(false);
                            }
                          }}
                          className="bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-900 transition flex items-center gap-2"
                        >
                          <X size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Tasks View
                <>
                  {/* Subject Tabs */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {subjects.map((subject) => (
                      <button
                        key={subject}
                        onClick={() => setActiveSubjectTab(subject)}
                        className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition ${
                          activeSubjectTab === subject
                            ? "bg-red-600 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                      >
                        {capitalizeFirst(subject)}
                      </button>
                    ))}
                  </div>

                  {/* Quick Filters */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setActiveFilter("all")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        activeFilter === "all"
                          ? "bg-red-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setActiveFilter("high")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        activeFilter === "high"
                          ? "bg-red-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      High Priority
                    </button>
                    <button
                      onClick={() => setActiveFilter("overdue")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        activeFilter === "overdue"
                          ? "bg-red-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      Overdue
                    </button>
                  </div>

                  {/* Add Task Input */}
                  <div className="space-y-2 mb-4">
                    <input
                      type="text"
                      value={newTask.text}
                      onChange={(e) =>
                        setNewTask({ ...newTask, text: e.target.value })
                      }
                      onKeyPress={(e) => e.key === "Enter" && addTask()}
                      placeholder="Add a task..."
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white placeholder-gray-400"
                    />
                    <div className="flex gap-2">
                      <select
                        value={newTask.subject}
                        onChange={(e) =>
                          setNewTask({ ...newTask, subject: e.target.value })
                        }
                        className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white appearance-none cursor-pointer text-sm"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ef4444' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 1rem center",
                        }}
                      >
                        <option value="all">General</option>
                        <option value="math">Math</option>
                        <option value="history">History</option>
                        <option value="french">French</option>
                        <option value="english">English</option>
                        <option value="debate">Debate</option>
                        <option value="science">Science</option>
                        <option value="robotics">Robotics</option>
                      </select>
                      <select
                        value={newTask.priority}
                        onChange={(e) =>
                          setNewTask({ ...newTask, priority: e.target.value })
                        }
                        className="w-20 px-2 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white appearance-none cursor-pointer text-sm"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ef4444' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 0.5rem center",
                        }}
                      >
                        <option value="high">High</option>
                        <option value="medium">Med</option>
                        <option value="low">Low</option>
                      </select>
                      <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) =>
                          setNewTask({ ...newTask, dueDate: e.target.value })
                        }
                        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white text-sm"
                        placeholder="End date"
                        title={
                          newTask.recurring !== "none"
                            ? "End date for recurring task"
                            : "Due date"
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={newTask.recurring}
                        onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            recurring: e.target.value,
                            recurringDays: [],
                          })
                        }
                        className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white appearance-none cursor-pointer text-sm"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ef4444' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 1rem center",
                        }}
                      >
                        <option value="none">No repeat</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Biweekly</option>
                        <option value="custom">Custom</option>
                      </select>
                      <input
                        type="text"
                        value={newTask.notes}
                        onChange={(e) =>
                          setNewTask({ ...newTask, notes: e.target.value })
                        }
                        placeholder="Notes..."
                        className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white placeholder-gray-400 text-sm"
                      />
                      <button
                        onClick={addTask}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    {newTask.recurring === "custom" && (
                      <div>
                        <label className="block text-red-400 mb-2 text-xs font-semibold">
                          Select Days
                        </label>
                        <div className="grid grid-cols-7 gap-2">
                          {[
                            "Sun",
                            "Mon",
                            "Tue",
                            "Wed",
                            "Thu",
                            "Fri",
                            "Sat",
                          ].map((day, index) => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                const days = newTask.recurringDays.includes(
                                  index
                                )
                                  ? newTask.recurringDays.filter(
                                      (d) => d !== index
                                    )
                                  : [...newTask.recurringDays, index].sort(
                                      (a, b) => a - b
                                    );
                                setNewTask({ ...newTask, recurringDays: days });
                              }}
                              className={`px-2 py-1 rounded-lg text-xs font-semibold transition ${
                                newTask.recurringDays.includes(index)
                                  ? "bg-red-600 text-white"
                                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tasks List with Drag & Drop */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredTasks.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">
                        No tasks
                      </p>
                    ) : (
                      filteredTasks.map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, task)}
                          className={`p-3 rounded-lg border cursor-move ${getPriorityColor(
                            task.priority
                          )} ${
                            task.completed
                              ? "bg-gray-700 bg-opacity-50 border-gray-600"
                              : "bg-gray-700 border-gray-600"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => toggleTask(task.id)}
                              className="w-5 h-5 mt-1 rounded border-2 border-red-600 bg-gray-700 checked:bg-red-600 checked:border-red-600 focus:ring-red-500 focus:ring-2 cursor-pointer appearance-none flex items-center justify-center"
                              style={{
                                backgroundImage: task.completed
                                  ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E")`
                                  : "none",
                                backgroundSize: "100% 100%",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                              }}
                            />
                            <div className="flex-1">
                              {editingTask === task.id ? (
                                <input
                                  type="text"
                                  defaultValue={task.text}
                                  onBlur={(e) =>
                                    updateTask(task.id, e.target.value)
                                  }
                                  onKeyPress={(e) =>
                                    e.key === "Enter" &&
                                    updateTask(task.id, e.target.value)
                                  }
                                  className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
                                  autoFocus
                                />
                              ) : (
                                <>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                      className={`${
                                        task.completed
                                          ? "line-through text-gray-500"
                                          : "text-gray-200"
                                      }`}
                                    >
                                      {task.text}
                                    </span>
                                    {task.subject !== "all" && (
                                      <span className="text-xs px-2 py-0.5 rounded bg-red-600 text-white">
                                        {capitalizeFirst(task.subject)}
                                      </span>
                                    )}
                                  </div>
                                  {task.dueDate && (
                                    <div className="text-xs text-gray-400 mt-1">
                                      Due:{" "}
                                      {new Date(
                                        task.dueDate
                                      ).toLocaleDateString()}
                                    </div>
                                  )}
                                  {task.notes && (
                                    <div className="text-xs text-gray-400 italic mt-1">
                                      {task.notes}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setEditingTaskFull(task);
                                  setShowEditTaskModal(true);
                                }}
                                className="text-gray-400 hover:text-red-400"
                                title="Edit task"
                              >
                                <Edit2 size={16} />
                              </button>
                              {task.recurring && task.recurring !== "none" && (
                                <button
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        "Delete all instances of this recurring task?"
                                      )
                                    ) {
                                      deleteAllRecurringInstances(task);
                                    }
                                  }}
                                  className="text-gray-400 hover:text-red-700 text-lg leading-none"
                                  title="Delete all recurring instances"
                                >
                                  ✕✕
                                </button>
                              )}
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="text-gray-400 hover:text-red-500"
                                title="Delete this instance"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Timer/Stopwatch Section */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                  <Clock size={18} />
                  {timerMode === "timer" ? "Timer" : "Stopwatch"}
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setTimerMode("timer");
                      setIsStopwatchRunning(false);
                      setIsTimerRunning(false);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      timerMode === "timer"
                        ? "bg-red-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Timer
                  </button>
                  <button
                    onClick={() => {
                      setTimerMode("stopwatch");
                      setIsStopwatchRunning(false);
                      setIsTimerRunning(false);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      timerMode === "stopwatch"
                        ? "bg-red-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Stopwatch
                  </button>
                </div>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  {timerMode === "timer"
                    ? formatTime(timeRemaining)
                    : formatTime(stopwatchTime)}
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  {pomodoroMode === "work"
                    ? "🎯 Work Session"
                    : "☕ Break Time"}
                </div>

                {timerMode === "timer" && !isTimerRunning && (
                  <div className="mb-4 space-y-2">
                    <select
                      value={pomodoroSubject}
                      onChange={(e) => setPomodoroSubject(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white text-sm mb-2"
                    >
                      <option value="all">Select Subject</option>
                      <option value="math">Math</option>
                      <option value="history">History</option>
                      <option value="french">French</option>
                      <option value="english">English</option>
                      <option value="debate">Debate</option>
                      <option value="bible">Bible</option>
                      <option value="science">Science</option>
                      <option value="robotics">Robotics</option>
                    </select>
                    <select
                      value={timerMinutes}
                      onChange={(e) => {
                        const mins = parseInt(e.target.value);
                        setTimerMinutes(mins);
                        setTimeRemaining(mins * 60);
                      }}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white text-sm"
                    >
                      {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map(
                        (min) => (
                          <option key={min} value={min}>
                            {min} minutes
                          </option>
                        )
                      )}
                    </select>
                  </div>
                )}

                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      if (timerMode === "timer") {
                        setIsTimerRunning(!isTimerRunning);
                      } else {
                        setIsStopwatchRunning(!isStopwatchRunning);
                      }
                    }}
                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition"
                  >
                    {(
                      timerMode === "timer"
                        ? isTimerRunning
                        : isStopwatchRunning
                    ) ? (
                      <Pause size={18} />
                    ) : (
                      <Play size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (timerMode === "timer") {
                        resetTimer();
                      } else {
                        resetStopwatch();
                      }
                    }}
                    className="bg-gray-700 text-white p-2 rounded-lg hover:bg-gray-600 transition"
                  >
                    <RotateCcw size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-md w-full border border-red-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Add Event</h3>
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setNewEvent({
                    title: "",
                    time: "",
                    endTime: "",
                    recurring: "none",
                    recurringDays: [],
                    notes: "",
                    subject: "all",
                    showInAllTabs: false,
                    customTime: false,
                    customTimeValue: "",
                  });
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-red-400 mb-2 text-sm font-semibold">
                  Event Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  placeholder="e.g., Math Test"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-red-400 mb-2 text-sm font-semibold">
                  Subject
                </label>
                <select
                  value={newEvent.subject}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, subject: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ef4444' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1rem center",
                  }}
                >
                  <option value="all">General</option>
                  <option value="math">Math</option>
                  <option value="history">History</option>
                  <option value="french">French</option>
                  <option value="english">English</option>
                  <option value="debate">Debate</option>
                  <option value="science">Science</option>
                  <option value="robotics">Robotics</option>
                </select>
              </div>

              <div>
                <label className="block text-red-400 mb-2 text-sm font-semibold">
                  Start Time
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() =>
                      setNewEvent({ ...newEvent, customTime: false })
                    }
                    className={`flex-1 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      !newEvent.customTime
                        ? "bg-red-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Preset
                  </button>
                  <button
                    onClick={() =>
                      setNewEvent({ ...newEvent, customTime: true })
                    }
                    className={`flex-1 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      newEvent.customTime
                        ? "bg-red-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    Custom
                  </button>
                </div>
                {newEvent.customTime ? (
                  <input
                    type="time"
                    value={newEvent.customTimeValue}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        customTimeValue: e.target.value,
                        time: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
                  />
                ) : (
                  <select
                    value={newEvent.time}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, time: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ef4444' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 1rem center",
                    }}
                  >
                    <option value="">Select time</option>
                    <option value="12:00 AM">12:00 AM</option>
                    <option value="1:00 AM">1:00 AM</option>
                    <option value="2:00 AM">2:00 AM</option>
                    <option value="3:00 AM">3:00 AM</option>
                    <option value="4:00 AM">4:00 AM</option>
                    <option value="5:00 AM">5:00 AM</option>
                    <option value="6:00 AM">6:00 AM</option>
                    <option value="7:00 AM">7:00 AM</option>
                    <option value="8:00 AM">8:00 AM</option>
                    <option value="9:00 AM">9:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="3:00 PM">3:00 PM</option>
                    <option value="4:00 PM">4:00 PM</option>
                    <option value="5:00 PM">5:00 PM</option>
                    <option value="6:00 PM">6:00 PM</option>
                    <option value="7:00 PM">7:00 PM</option>
                    <option value="8:00 PM">8:00 PM</option>
                    <option value="9:00 PM">9:00 PM</option>
                    <option value="10:00 PM">10:00 PM</option>
                    <option value="11:00 PM">11:00 PM</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-red-400 mb-2 text-sm font-semibold">
                  End Time (Optional)
                </label>
                <select
                  value={newEvent.endTime}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, endTime: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ef4444' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1rem center",
                  }}
                >
                  <option value="">No end time</option>
                  <option value="12:00 AM">12:00 AM</option>
                  <option value="1:00 AM">1:00 AM</option>
                  <option value="2:00 AM">2:00 AM</option>
                  <option value="3:00 AM">3:00 AM</option>
                  <option value="4:00 AM">4:00 AM</option>
                  <option value="5:00 AM">5:00 AM</option>
                  <option value="6:00 AM">6:00 AM</option>
                  <option value="7:00 AM">7:00 AM</option>
                  <option value="8:00 AM">8:00 AM</option>
                  <option value="9:00 AM">9:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="1:00 PM">1:00 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="5:00 PM">5:00 PM</option>
                  <option value="6:00 PM">6:00 PM</option>
                  <option value="7:00 PM">7:00 PM</option>
                  <option value="8:00 PM">8:00 PM</option>
                  <option value="9:00 PM">9:00 PM</option>
                  <option value="10:00 PM">10:00 PM</option>
                  <option value="11:00 PM">11:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-red-400 mb-2 text-sm font-semibold">
                  Repeat
                </label>
                <select
                  value={newEvent.recurring}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      recurring: e.target.value,
                      recurringDays: [],
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ef4444' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1rem center",
                  }}
                >
                  <option value="none">Does not repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Every other week</option>
                  <option value="custom">Custom days</option>
                </select>
              </div>

              {newEvent.recurring === "custom" && (
                <div>
                  <label className="block text-red-400 mb-2 text-sm font-semibold">
                    Select Days
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day, index) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const days = newEvent.recurringDays.includes(index)
                              ? newEvent.recurringDays.filter(
                                  (d) => d !== index
                                )
                              : [...newEvent.recurringDays, index].sort(
                                  (a, b) => a - b
                                );
                            setNewEvent({ ...newEvent, recurringDays: days });
                          }}
                          className={`px-2 py-2 rounded-lg text-xs font-semibold transition ${
                            newEvent.recurringDays.includes(index)
                              ? "bg-red-600 text-white"
                              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          }`}
                        >
                          {day}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-red-400 mb-2 text-sm font-semibold">
                  Notes (Optional)
                </label>
                <textarea
                  value={newEvent.notes}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, notes: e.target.value })
                  }
                  placeholder="Add details, location, or reminders..."
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white placeholder-gray-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-red-400 mb-2 text-sm font-semibold">
                  Visibility
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={newEvent.showInAllTabs}
                      onChange={() =>
                        setNewEvent({ ...newEvent, showInAllTabs: true })
                      }
                      className="w-4 h-4 text-red-600"
                    />
                    <span className="text-white text-sm">Show in all tabs</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!newEvent.showInAllTabs}
                      onChange={() =>
                        setNewEvent({ ...newEvent, showInAllTabs: false })
                      }
                      className="w-4 h-4 text-red-600"
                    />
                    <span className="text-white text-sm">
                      Only in subject tab
                    </span>
                  </label>
                </div>
              </div>

              <button
                onClick={addEvent}
                disabled={
                  !newEvent.title.trim() ||
                  !newEvent.time.trim() ||
                  (newEvent.recurring === "custom" &&
                    newEvent.recurringDays.length === 0)
                }
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-2xl w-full border border-red-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">New Note</h3>
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  setCurrentNote({ title: "", content: "", subject: "all" });
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-red-400 mb-2 text-sm font-semibold">
                  Title
                </label>
                <input
                  type="text"
                  value={currentNote.title}
                  onChange={(e) =>
                    setCurrentNote({ ...currentNote, title: e.target.value })
                  }
                  placeholder="Note title"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-red-400 mb-2 text-sm font-semibold">
                  Subject
                </label>
                <select
                  value={currentNote.subject}
                  onChange={(e) =>
                    setCurrentNote({ ...currentNote, subject: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ef4444' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1rem center",
                  }}
                >
                  <option value="all">General</option>
                  <option value="math">Math</option>
                  <option value="history">History</option>
                  <option value="french">French</option>
                  <option value="english">English</option>
                  <option value="debate">Debate</option>
                  <option value="science">Science</option>
                  <option value="robotics">Robotics</option>
                </select>
              </div>

              <div>
                <label className="block text-red-400 mb-2 text-sm font-semibold">
                  Content
                </label>
                <textarea
                  value={currentNote.content}
                  onChange={(e) =>
                    setCurrentNote({ ...currentNote, content: e.target.value })
                  }
                  placeholder="Write your notes here..."
                  rows="10"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white placeholder-gray-400 resize-none"
                />
              </div>

              <button
                onClick={saveNote}
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-md w-full border border-red-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                Add Recurring Task
              </h3>
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  setNewTask({
                    text: "",
                    subject: "all",
                    dueDate: "",
                    notes: "",
                    priority: "medium",
                    recurring: "none",
                    recurringDays: [],
                  });
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-red-400 mb-2 text-sm font-semibold">
                  Task
                </label>
                <input
                  type="text"
                  value={newTask.text}
                  onChange={(e) =>
                    setNewTask({ ...newTask, text: e.target.value })
                  }
                  placeholder="e.g., Complete homework"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-red-400 mb-2 text-sm font-semibold">
                  Subject
                </label>
                <select
                  value={newTask.subject}
                  onChange={(e) =>
                    setNewTask({ ...newTask, subject: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ef4444' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1rem center",
                  }}
                >
                  <option value="all">General</option>
                  <option value="math">Math</option>
                  <option value="history">History</option>
                  <option value="french">French</option>
                  <option value="english">English</option>
                  <option value="debate">Debate</option>
                  <option value="science">Science</option>
                  <option value="robotics">Robotics</option>
                </select>
              </div>

              <div>
                <label className="block text-red-400 mb-2 text-sm font-semibold">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({ ...newTask, priority: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ef4444' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1rem center",
                  }}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-red-400 mb-2 text-sm font-semibold">
                  Repeat
                </label>
                <select
                  value={newTask.recurring}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      recurring: e.target.value,
                      recurringDays: [],
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ef4444' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1rem center",
                  }}
                >
                  <option value="none">Does not repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Every other week</option>
                  <option value="custom">Custom days</option>
                </select>
              </div>

              {newTask.recurring === "custom" && (
                <div>
                  <label className="block text-red-400 mb-2 text-sm font-semibold">
                    Select Days
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day, index) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const days = newTask.recurringDays.includes(index)
                              ? newTask.recurringDays.filter((d) => d !== index)
                              : [...newTask.recurringDays, index].sort(
                                  (a, b) => a - b
                                );
                            setNewTask({ ...newTask, recurringDays: days });
                          }}
                          className={`px-2 py-2 rounded-lg text-xs font-semibold transition ${
                            newTask.recurringDays.includes(index)
                              ? "bg-red-600 text-white"
                              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          }`}
                        >
                          {day}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-red-400 mb-2 text-sm font-semibold">
                  Notes (Optional)
                </label>
                <textarea
                  value={newTask.notes}
                  onChange={(e) =>
                    setNewTask({ ...newTask, notes: e.target.value })
                  }
                  placeholder="Add details..."
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white placeholder-gray-400 resize-none"
                />
              </div>

              <button
                onClick={addTask}
                disabled={
                  !newTask.text.trim() ||
                  (newTask.recurring === "custom" &&
                    newTask.recurringDays.length === 0)
                }
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditTaskModal && editingTaskFull && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-md w-full border border-red-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Edit Task</h3>
              <button
                onClick={() => {
                  setShowEditTaskModal(false);
                  setEditingTaskFull(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-red-400 mb-2 text-sm font-semibold">
                  Task
                </label>
                <input
                  type="text"
                  value={editingTaskFull.text}
                  onChange={(e) =>
                    setEditingTaskFull({
                      ...editingTaskFull,
                      text: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
                />
              </div>

              <div>
                <label className="block text-red-400 mb-2 text-sm font-semibold">
                  Subject
                </label>
                <select
                  value={editingTaskFull.subject}
                  onChange={(e) =>
                    setEditingTaskFull({
                      ...editingTaskFull,
                      subject: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ef4444' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1rem center",
                  }}
                >
                  <option value="all">General</option>
                  <option value="math">Math</option>
                  <option value="history">History</option>
                  <option value="french">French</option>
                  <option value="english">English</option>
                  <option value="debate">Debate</option>
                  <option value="science">Science</option>
                  <option value="robotics">Robotics</option>
                </select>
              </div>

              <div>
                <label className="block text-red-400 mb-2 text-sm font-semibold">
                  Priority
                </label>
                <select
                  value={editingTaskFull.priority}
                  onChange={(e) =>
                    setEditingTaskFull({
                      ...editingTaskFull,
                      priority: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ef4444' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1rem center",
                  }}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-red-400 mb-2 text-sm font-semibold">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editingTaskFull.dueDate || ""}
                  onChange={(e) =>
                    setEditingTaskFull({
                      ...editingTaskFull,
                      dueDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white"
                />
              </div>

              <div>
                <label className="block text-red-400 mb-2 text-sm font-semibold">
                  Repeat
                </label>
                <select
                  value={editingTaskFull.recurring || "none"}
                  onChange={(e) =>
                    setEditingTaskFull({
                      ...editingTaskFull,
                      recurring: e.target.value,
                      recurringDays: [],
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ef4444' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1rem center",
                  }}
                >
                  <option value="none">Does not repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Every other week</option>
                  <option value="custom">Custom days</option>
                </select>
              </div>

              {editingTaskFull.recurring === "custom" && (
                <div>
                  <label className="block text-red-400 mb-2 text-sm font-semibold">
                    Select Days
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day, index) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const days = (
                              editingTaskFull.recurringDays || []
                            ).includes(index)
                              ? editingTaskFull.recurringDays.filter(
                                  (d) => d !== index
                                )
                              : [
                                  ...(editingTaskFull.recurringDays || []),
                                  index,
                                ].sort((a, b) => a - b);
                            setEditingTaskFull({
                              ...editingTaskFull,
                              recurringDays: days,
                            });
                          }}
                          className={`px-2 py-2 rounded-lg text-xs font-semibold transition ${
                            (editingTaskFull.recurringDays || []).includes(
                              index
                            )
                              ? "bg-red-600 text-white"
                              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          }`}
                        >
                          {day}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-red-400 mb-2 text-sm font-semibold">
                  Notes
                </label>
                <textarea
                  value={editingTaskFull.notes || ""}
                  onChange={(e) =>
                    setEditingTaskFull({
                      ...editingTaskFull,
                      notes: e.target.value,
                    })
                  }
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white placeholder-gray-400 resize-none"
                />
              </div>

              <button
                onClick={updateTaskFull}
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flashcard Modal */}
      {showFlashcardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-2xl w-full border border-red-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">New Flashcard</h3>
              <button
                onClick={() => {
                  setShowFlashcardModal(false);
                  setCurrentFlashcard({ front: "", back: "", subject: "all" });
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-red-400 mb-2 text-sm font-semibold">
                  Subject
                </label>
                <select
                  value={currentFlashcard.subject}
                  onChange={(e) =>
                    setCurrentFlashcard({
                      ...currentFlashcard,
                      subject: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ef4444' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1rem center",
                  }}
                >
                  <option value="all">General</option>
                  <option value="math">Math</option>
                  <option value="history">History</option>
                  <option value="french">French</option>
                  <option value="english">English</option>
                  <option value="debate">Debate</option>
                  <option value="science">Science</option>
                  <option value="robotics">Robotics</option>
                </select>
              </div>

              <div>
                <label className="block text-red-400 mb-2 text-sm font-semibold">
                  Question (Front)
                </label>
                <textarea
                  value={currentFlashcard.front}
                  onChange={(e) =>
                    setCurrentFlashcard({
                      ...currentFlashcard,
                      front: e.target.value,
                    })
                  }
                  placeholder="Enter the question..."
                  rows="4"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white placeholder-gray-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-red-400 mb-2 text-sm font-semibold">
                  Answer (Back)
                </label>
                <textarea
                  value={currentFlashcard.back}
                  onChange={(e) =>
                    setCurrentFlashcard({
                      ...currentFlashcard,
                      back: e.target.value,
                    })
                  }
                  placeholder="Enter the answer..."
                  rows="4"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-white placeholder-gray-400 resize-none"
                />
              </div>

              <button
                onClick={saveFlashcard}
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Save Flashcard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
