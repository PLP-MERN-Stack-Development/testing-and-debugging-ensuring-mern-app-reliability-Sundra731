import React, { useState, useEffect } from 'react';
import './App.css';
import BugForm from './components/BugForm';
import BugList from './components/BugList';
import ErrorBoundary from './components/ErrorBoundary';
import { getBugs, createBug, updateBug, deleteBug, updateBugStatus } from './services/api';

function App() {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBug, setEditingBug] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Load bugs on component mount
  useEffect(() => {
    loadBugs();
  }, []);

  const loadBugs = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading bugs from API...');
      const response = await getBugs();
      setBugs(response.bugs || []);
      console.log(`Loaded ${response.bugs?.length || 0} bugs`);
    } catch (err) {
      console.error('Error loading bugs:', err);
      setError('Failed to load bugs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBug = async (bugData) => {
    try {
      console.log('Creating new bug:', bugData);
      const newBug = await createBug(bugData);
      setBugs(prev => [newBug, ...prev]);
      setShowForm(false);
      console.log('Bug created successfully:', newBug._id);
    } catch (err) {
      console.error('Error creating bug:', err);
      throw err; // Let the form handle the error display
    }
  };

  const handleUpdateBug = async (bugData) => {
    try {
      console.log('Updating bug:', editingBug._id, bugData);
      const updatedBug = await updateBug(editingBug._id, bugData);
      setBugs(prev => prev.map(bug =>
        bug._id === editingBug._id ? updatedBug : bug
      ));
      setEditingBug(null);
      setShowForm(false);
      console.log('Bug updated successfully:', updatedBug._id);
    } catch (err) {
      console.error('Error updating bug:', err);
      throw err; // Let the form handle the error display
    }
  };

  const handleDeleteBug = async (bugId) => {
    try {
      console.log('Deleting bug:', bugId);
      await deleteBug(bugId);
      setBugs(prev => prev.filter(bug => bug._id !== bugId));
      console.log('Bug deleted successfully:', bugId);
    } catch (err) {
      console.error('Error deleting bug:', err);
      alert('Failed to delete bug. Please try again.');
    }
  };

  const handleStatusChange = async (bugId, newStatus) => {
    try {
      console.log('Changing bug status:', bugId, 'to', newStatus);
      const updatedBug = await updateBugStatus(bugId, newStatus);
      setBugs(prev => prev.map(bug =>
        bug._id === bugId ? updatedBug : bug
      ));
      console.log('Bug status updated successfully:', bugId);
    } catch (err) {
      console.error('Error updating bug status:', err);
      alert('Failed to update bug status. Please try again.');
    }
  };

  const handleEditBug = (bug) => {
    console.log('Editing bug:', bug._id);
    setEditingBug(bug);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setEditingBug(null);
    setShowForm(false);
  };

  const handleFormSubmit = (bugData) => {
    if (editingBug) {
      return handleUpdateBug(bugData);
    } else {
      return handleCreateBug(bugData);
    }
  };

  return (
    <ErrorBoundary>
      <div className="App">
        <header className="App-header">
          <h1>Bug Tracker</h1>
          <p>A comprehensive bug tracking system with testing and debugging features</p>
        </header>

        <main className="App-main">
          <div className="container">
            <div className="actions">
              <button
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
                disabled={showForm}
              >
                {showForm ? 'Form Open' : 'Report New Bug'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={loadBugs}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {showForm && (
              <div className="form-section">
                <h2>{editingBug ? 'Edit Bug' : 'Report New Bug'}</h2>
                <BugForm
                  onSubmit={handleFormSubmit}
                  initialData={editingBug}
                  onCancel={handleCancelForm}
                />
              </div>
            )}

            <BugList
              bugs={bugs}
              onEdit={handleEditBug}
              onDelete={handleDeleteBug}
              onStatusChange={handleStatusChange}
              isLoading={loading}
              error={error}
            />
          </div>
        </main>

        <footer className="App-footer">
          <p>&copy; 2024 Bug Tracker - MERN Application with Comprehensive Testing</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;