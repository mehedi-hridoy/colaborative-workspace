"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import {useGoalStore} from "../../store/goalStore";


export default function Dashboard() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [creatingGoal, setCreatingGoal] = useState(false);

  const { user, loading, fetchUser, logout } = useAuthStore();
  const { workspaces, setWorkspaces, addWorkspace, currentWorkspace, setCurrentWorkspace, loadWorkspace } = useWorkspaceStore();
  const { goals, setGoals, addGoal } = useGoalStore();

  // auth check
  useEffect(() => {
    fetchUser();
  }, []);

  // load saved workspace from localStorage
  useEffect(() => {
    loadWorkspace();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // fetch workspaces
  useEffect(() => {
    if (user) {
      const fetchWorkspaces = async () => {
        const res = await fetch("http://localhost:5000/api/workspaces", {
          credentials: "include",
        });

        const data = await res.json();
        setWorkspaces(data);
      };

      fetchWorkspaces();
    }
  }, [user]);

  // fetch goals when workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      const fetchGoals = async () => {
        const res = await fetch(
          `http://localhost:5000/api/goals/${currentWorkspace.id}`,
          {
            credentials: "include",
          }
        );

        const data = await res.json();
        setGoals(data);
      };

      fetchGoals();
    }
  }, [currentWorkspace]);

  const handleCreateWorkspace = async () => {
    if (!name) return alert("Name required");

    setCreating(true);
    try {
      const res = await fetch("http://localhost:5000/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          description,
          color: "#0a3d33",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create workspace");
      }

      const newWorkspace = await res.json();
      addWorkspace(newWorkspace);
      setName("");
      setDescription("");
    } catch (error) {
      alert("Error creating workspace: " + error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!goalTitle || !currentWorkspace) return alert("Select workspace and enter goal title");

    setCreatingGoal(true);
    try {
      const res = await fetch("http://localhost:5000/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: goalTitle,
          workspaceId: currentWorkspace.id,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create goal");
      }

      const newGoal = await res.json();
      addGoal(newGoal);
      setGoalTitle("");
    } catch (error) {
      alert("Error creating goal: " + error.message);
    } finally {
      setCreatingGoal(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Unauthorized. Redirecting...</div>;

  return (
    <div>
      <h1>Dashboard</h1>

      {/* USER INFO */}
      <h2>User Info</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>

      {/* CREATE WORKSPACE */}
      <h2>Create Workspace</h2>
      <div style={{ marginBottom: "20px", padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
        <input
          placeholder="Workspace name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <button
          onClick={handleCreateWorkspace}
          disabled={creating}
          style={{
            padding: "8px 16px",
            backgroundColor: creating ? "#ccc" : "#0a3d33",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: creating ? "not-allowed" : "pointer",
          }}
        >
          {creating ? "Creating..." : "Create"}
        </button>
      </div>

      {/* WORKSPACES */}
      <h2>Workspaces</h2>
      {workspaces.length === 0 ? (
        <p>No workspaces found</p>
      ) : (
        workspaces.map((ws) => (
          <div
            key={ws.id}
            onClick={() => setCurrentWorkspace(ws)}
            style={{
              border: currentWorkspace?.id === ws.id ? "2px solid green" : "1px solid gray",
              padding: "10px",
              margin: "5px",
              cursor: "pointer",
              borderRadius: "4px",
              backgroundColor: currentWorkspace?.id === ws.id ? "#f0f8f0" : "#f9f9f9",
            }}
          >
            <h3>{ws.name}</h3>
            <p>{ws.description}</p>
            {currentWorkspace?.id === ws.id && <p style={{ color: "green", fontWeight: "bold" }}>✓ Active</p>}
          </div>
        ))
      )}

      {/* GOALS */}
      <h2>Goals</h2>
      {!currentWorkspace ? (
        <p style={{ color: "#999", fontStyle: "italic" }}>Select a workspace first</p>
      ) : (
        <>
          <div style={{ marginBottom: "20px", padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
            <h3>Create Goal</h3>
            <input
              placeholder="Goal title"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              style={{ width: "100%", padding: "8px", marginBottom: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
            <button
              onClick={handleCreateGoal}
              disabled={creatingGoal}
              style={{
                padding: "8px 16px",
                backgroundColor: creatingGoal ? "#ccc" : "#0a3d33",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: creatingGoal ? "not-allowed" : "pointer",
              }}
            >
              {creatingGoal ? "Adding..." : "Add Goal"}
            </button>
          </div>

          {goals.length === 0 ? (
            <p style={{ color: "#999", fontStyle: "italic" }}>No goals yet</p>
          ) : (
            goals.map((goal) => (
              <div
                key={goal.id}
                style={{
                  padding: "10px",
                  margin: "5px 0",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "#fafafa",
                }}
              >
                <h3>{goal.title}</h3>
                <p>Status: <strong>{goal.status}</strong></p>
              </div>
            ))
          )}
        </>
      )}

      <button onClick={handleLogout} style={{ marginTop: "20px", padding: "8px 16px", backgroundColor: "#d32f2f", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Logout</button>
    </div>
  );
}