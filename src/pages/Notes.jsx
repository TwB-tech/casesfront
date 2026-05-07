import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import axiosInstance from '../axiosConfig';
import { useTheme } from '../contexts/ThemeContext';
import { Plus, Search, Edit2, Trash2, Save, X } from 'lucide-react';

export default function Notes() {
  const { user } = useAuth();
  const { isFuturistic } = useTheme();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const titleRef = useRef(null);

  // Fetch notes
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/notes/');
      setNotes(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

   useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  // Expose saveToNotes method for external calls (Reya, Chat)
  useEffect(() => {
    window.saveToNotes = async (title, content) => {
      if (!user) {
        console.error('Cannot save note: user not logged in');
        return false;
      }
      try {
        await axiosInstance.post('/notes/', { title, content });
        fetchNotes(); // Refresh notes list
        return true;
      } catch (error) {
        console.error('Error saving note via window.saveToNotes:', error);
        return false;
      }
    };

    return () => {
      delete window.saveToNotes;
    };
  }, [user]);

  // Listen for note-saved events to refresh list
  useEffect(() => {
    const handleNoteSaved = () => fetchNotes();
    window.addEventListener('note-saved', handleNoteSaved);
    return () => window.removeEventListener('note-saved', handleNoteSaved);
  }, []);

  // Filter notes by search
  const filteredNotes = searchQuery
    ? notes.filter(
        (note) =>
          note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notes;

  // Create/update note
  const saveNote = async () => {
    if (!title.trim()) {
      return;
    }

    try {
      if (editingNote) {
        // Update
        await axiosInstance.post('/notes/', {
          id: editingNote.id,
          title,
          content,
        });
      } else {
        // Create
        await axiosInstance.post('/notes/', {
          title,
          content,
        });
      }

      setTitle('');
      setContent('');
      setShowEditor(false);
      setEditingNote(null);
      fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  // Edit note
  const editNote = (note) => {
    setEditingNote(note);
    setTitle(note.title || '');
    setContent(note.content || '');
    setShowEditor(true);
    setTimeout(() => titleRef.current?.focus(), 0);
  };

  // Delete note
  const deleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/notes/${noteId}/`);
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) {
      return '';
    }
    const date = new Date(dateStr);
    return date.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`p-6 h-screen ${isFuturistic ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${isFuturistic ? 'text-white' : 'text-gray-900'}`}>Notes</h1>
            <p className={`text-sm ${isFuturistic ? 'text-gray-400' : 'text-gray-500'}`}>
              {notes.length} note{notes.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => {
              setEditingNote(null);
              setTitle('');
              setContent('');
              setShowEditor(true);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isFuturistic 
                ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white hover:opacity-90' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${
              isFuturistic 
                ? 'bg-[#1a1a2f] border-purple-800 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/50' 
                : 'bg-white border-gray-300 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/50'
            }`}
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: '1px solid' }}
          />
        </div>

        {/* Editor Modal */}
        {showEditor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl rounded-xl shadow-2xl ${
              isFuturistic ? 'bg-[#1a1a2f] border border-purple-800' : 'bg-white'
            }`}>
              <div className={`flex justify-between items-center p-6 border-b ${
                isFuturistic ? 'border-purple-800' : 'border-gray-200'
              }`}>
                <h2 className={`text-xl font-bold ${isFuturistic ? 'text-white' : 'text-gray-900'}`}>
                  {editingNote ? 'Edit Note' : 'New Note'}
                </h2>
                <button
                  onClick={() => {
                    setShowEditor(false);
                    setEditingNote(null);
                  }}
                  className={`p-1 rounded-lg transition-colors ${
                    isFuturistic ? 'hover:bg-purple-900/50 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <input
                  ref={titleRef}
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none ${
                    isFuturistic 
                      ? 'bg-[#0a0a0f] border-purple-800 text-white placeholder-gray-500 focus:border-purple-500' 
                      : 'bg-gray-50 border-gray-300 placeholder-gray-400 focus:border-blue-500'
                  }`}
                  placeholder="Note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ border: '1px solid' }}
                />
                <textarea
                  className={`w-full px-4 py-2 rounded-lg border focus:outline-none min-h-[200px] resize-y ${
                    isFuturistic 
                      ? 'bg-[#0a0a0f] border-purple-800 text-white placeholder-gray-500 focus:border-purple-500' 
                      : 'bg-gray-50 border-gray-300 placeholder-gray-400 focus:border-blue-500'
                  }`}
                  placeholder="Write your note here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{ border: '1px solid' }}
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowEditor(false);
                      setEditingNote(null);
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      isFuturistic 
                        ? 'text-gray-300 hover:bg-purple-900/50' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveNote}
                    disabled={!title.trim()}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                      isFuturistic 
                        ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white hover:opacity-90' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes List */}
        {loading ? (
            <div className="text-center py-12">
              <p className={`text-lg ${isFuturistic ? 'text-gray-400' : 'text-gray-500'}`}>Loading notes...</p>
            </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-lg ${isFuturistic ? 'text-gray-300' : 'text-gray-500'}`}>
              {searchQuery ? 'No notes match your search' : 'No notes yet'}
            </p>
            {!searchQuery && (
              <p className={`text-sm mt-2 ${isFuturistic ? 'text-gray-400' : 'text-gray-400'}`}>
                Click "New Note" to create your first note
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer ${
                  isFuturistic 
                    ? 'bg-[#1a1a2f] border-purple-800 hover:border-purple-600' 
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-semibold truncate flex-1 ${isFuturistic ? 'text-white' : 'text-gray-900'}`}>
                    {note.title || 'Untitled'}
                  </h3>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        editNote(note);
                      }}
                      className={`p-1 rounded transition-colors ${
                        isFuturistic ? 'hover:bg-purple-900/50 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                      }`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                      className={`p-1 rounded transition-colors ${
                        isFuturistic ? 'hover:bg-red-900/50 text-gray-400' : 'hover:bg-red-50 text-gray-500'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className={`text-sm line-clamp-3 mb-3 ${isFuturistic ? 'text-gray-400' : 'text-gray-600'}`}>
                  {note.content || 'No content'}
                </p>
                <p className={`text-xs ${isFuturistic ? 'text-gray-500' : 'text-gray-400'}`}>
                  {formatDate(note.updated_at || note.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
