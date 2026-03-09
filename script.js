document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================================
       THEME MANAGEMENT
       ========================================================================= */
  const themeBtns = document.querySelectorAll(".theme-btn");
  const updateThemeUI = () => {
    const savedTheme = localStorage.getItem("theme-preference") || "system";
    themeBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.theme === savedTheme);
    });
  };

  const setTheme = (theme) => {
    localStorage.setItem("theme-preference", theme);
    document.documentElement.setAttribute("data-theme", theme);

    if (theme === "system") {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      document.documentElement.setAttribute(
        "data-theme-resolved",
        systemDark ? "dark" : "light",
      );
    } else {
      document.documentElement.setAttribute("data-theme-resolved", theme);
    }
    updateThemeUI();
  };

  themeBtns.forEach((btn) => {
    btn.addEventListener("click", () => setTheme(btn.dataset.theme));
  });

  // Listen for system theme changes if set to system
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (localStorage.getItem("theme-preference") === "system") {
        document.documentElement.setAttribute(
          "data-theme-resolved",
          e.matches ? "dark" : "light",
        );
      }
    });

  updateThemeUI();

  /* =========================================================================
       PANEL SWITCHING & SHORTCUTS
       ========================================================================= */
  const navBtns = document.querySelectorAll(".nav-btn");
  const panels = document.querySelectorAll(".panel");

  const switchPanel = (panelId) => {
    navBtns.forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.panel === panelId),
    );
    panels.forEach((panel) =>
      panel.classList.toggle("active", panel.id === `panel-${panelId}`),
    );
  };

  navBtns.forEach((btn) => {
    btn.addEventListener("click", () => switchPanel(btn.dataset.panel));
  });

  // Keyboard shortcuts (1-9)
  document.addEventListener("keydown", (e) => {
    // Ignore if focus is within an input or textarea
    if (
      ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
    ) {
      return;
    }

    const key = e.key;
    if (["1", "2", "3"].includes(key)) {
      switchPanel(key);
    }
  });

  /* =========================================================================
       ASSIGNMENTS 'API'
       ========================================================================= */
  const form = document.getElementById("assignment-form");
  const listContainer = document.getElementById("assignments-list");

  // Simulate API fetch
  const fetchAssignments = () => {
    const data = localStorage.getItem("assignments_db");
    return data
      ? JSON.parse(data)
      : [
          {
            id: 1,
            title: "Math Homework",
            desc: "Chapter 4 problems",
            due: "2026-03-05",
            link: "",
          },
          {
            id: 2,
            title: "English Essay",
            desc: "Rough draft of Gatsby essay",
            due: "2026-03-08",
            link: "https://canvas.instructure.com",
          },
        ];
  };

  const saveAssignments = (assignments) => {
    localStorage.setItem("assignments_db", JSON.stringify(assignments));
    renderAssignments();
  };

  window.deleteAssignment = (id) => {
    const assignments = fetchAssignments().filter((a) => a.id !== id);
    saveAssignments(assignments);
  };

  const renderAssignments = () => {
    const assignments = fetchAssignments();

    // Sort by closest due date
    assignments.sort((a, b) => new Date(a.due) - new Date(b.due));

    listContainer.innerHTML = "";

    if (assignments.length === 0) {
      listContainer.innerHTML =
        '<p style="color: var(--current-text-muted); padding: 1rem;">No upcoming assignments. You are all caught up!</p>';
      return;
    }

    assignments.forEach((a) => {
      const card = document.createElement("div");
      card.className = "assignment-card";

      const linkHtml = a.link
        ? `<a href="${a.link}" target="_blank" class="assignment-link">Resource Link ↗</a>`
        : "";

      // Format date nicely
      const dateObj = new Date(a.due);
      // Adjust for timezone offset to avoid it showing previous day locally if time is midnight UTC
      dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
      const dueFormatted = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      card.innerHTML = `
                <div class="assignment-info">
                    <h3>${a.title}</h3>
                    <p>${a.desc}</p>
                    <button class="delete-btn" onclick="deleteAssignment(${a.id})">Remove</button>
                </div>
                <div class="assignment-meta">
                    <span class="due-badge">Due: ${dueFormatted}</span>
                    ${linkHtml}
                </div>
            `;
      listContainer.appendChild(card);
    });
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const newAssignment = {
      id: Date.now(),
      title: document.getElementById("title").value,
      desc: document.getElementById("desc").value,
      due: document.getElementById("due").value,
      link: document.getElementById("link").value,
    };

    const assignments = fetchAssignments();
    assignments.push(newAssignment);
    saveAssignments(assignments);

    form.reset();
  });

  renderAssignments();

  /* =========================================================================
       QUICK NOTES
       ========================================================================= */
  const notesArea = document.getElementById("quick-notes");
  notesArea.value = localStorage.getItem("quick_notes_db") || "";

  notesArea.addEventListener("input", () => {
    localStorage.setItem("quick_notes_db", notesArea.value);
  });
});
