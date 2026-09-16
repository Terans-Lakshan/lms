import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Popup shown when a course is opened from a degree programme: its name, code,
// credits, description and every material the lecturers have added - uploaded
// files to download and external links to open. Courses with nothing attached
// yet say so rather than showing an empty panel.
const CourseDetailsModal = ({ course, isOpen = false, onClose, userRole = '', onMaterialsChanged }) => {
  const [downloading, setDownloading] = useState({});
  const [materials, setMaterials] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editContent, setEditContent] = useState('');
  const [busyId, setBusyId] = useState(null);

  // Lecturers and admins curate the materials; students only read them
  const canManage = userRole === 'lecturer' || userRole === 'admin';

  // Kept locally so a rename or a removal shows immediately, without waiting for
  // the parent page to refetch the whole degree programme
  useEffect(() => {
    setMaterials(course?.resources || []);
    setEditingId(null);
  }, [course]);

  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const startEditing = (material) => {
    setEditingId(material._id);
    setEditName(material.filename || '');
    setEditContent(material.content || '');
  };

  const saveName = async (material) => {
    const name = editName.trim();
    if (!name) {
      toast.error('A name is required');
      return;
    }

    // A message is worth little without its text, so that travels with the rename
    if (material.type === 'message' && !editContent.trim()) {
      toast.error('A message cannot be empty');
      return;
    }

    setBusyId(material._id);
    try {
      const payload = material.type === 'message'
        ? { filename: name, content: editContent }
        : { filename: name };

      const { data } = await axios.put(
        `/api/courses/${course._id}/materials/${material._id}`,
        payload,
        { headers: authHeader() }
      );
      setMaterials((prev) => prev.map((m) => (
        m._id === material._id
          ? { ...m, filename: data.material.filename, content: data.material.content }
          : m
      )));
      setEditingId(null);
      toast.success(material.type === 'message' ? 'Message updated' : 'Material renamed');
      if (onMaterialsChanged) onMaterialsChanged();
    } catch (error) {
      console.error('Rename failed:', error);
      toast.error(error.response?.data?.message || 'Could not rename this material');
    } finally {
      setBusyId(null);
    }
  };

  const removeMaterial = async (material) => {
    const label = material.filename || 'this material';
    if (!window.confirm(`Remove ${label}? This cannot be undone.`)) return;

    setBusyId(material._id);
    try {
      const { data } = await axios.delete(
        `/api/courses/${course._id}/materials/${material._id}`,
        { headers: authHeader() }
      );
      setMaterials((prev) => prev.filter((m) => m._id !== material._id));
      toast.success(data.message || 'Material removed');
      if (onMaterialsChanged) onMaterialsChanged();
    } catch (error) {
      console.error('Remove failed:', error);
      toast.error(error.response?.data?.message || 'Could not remove this material');
    } finally {
      setBusyId(null);
    }
  };

  // Uploaded files live in a private S3 bucket, so their stored URL answers 403 in
  // the browser. The file is fetched through the server, which signs the request
  // and sends it back under its original name.
  const downloadMaterial = async (material) => {
    setDownloading((prev) => ({ ...prev, [material._id]: true }));

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/courses/${course._id}/materials/${material._id}/download`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
      );

      const objectUrl = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = material.filename || 'download';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Download failed:', error);

      // With responseType blob the error body is a blob too, so it has to be read
      // back before the server's message can be shown
      let message = 'Could not download this file. Please try again.';
      try {
        if (error.response?.data instanceof Blob) {
          const parsed = JSON.parse(await error.response.data.text());
          if (parsed.message) message = parsed.message;
        }
      } catch {
        // keep the generic message
      }

      toast.error(message);
    } finally {
      setDownloading((prev) => ({ ...prev, [material._id]: false }));
    }
  };

  if (!isOpen || !course) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">{course.title}</h2>
            <p className="text-sm text-emerald-50 mt-1">Course Code: <span className="font-semibold text-white">{course.code}</span></p>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-50 hover:text-white hover:bg-white/20 rounded p-1 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Course Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Course Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span className="text-sm text-gray-700"><span className="font-semibold">{course.credit || 0}</span> Credits</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {course.description || 'No description available.'}
                </p>
              </div>
            </div>
          </div>

          {/* Course Materials */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Course Materials
              <span className="text-sm font-normal text-gray-500">({materials.length})</span>
            </h3>

            {materials.length > 0 ? (
              <div className="space-y-2">
                {materials.map((material, index) => (
                  <div
                    key={material._id || index}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Icon based on material type */}
                        {material.type === 'message' ? (
                          <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        ) : material.type === 'link' ? (
                          <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-teal-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        )}
                    
                        <div className="flex-1 min-w-0">
                          {editingId === material._id ? (
                            <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && material.type !== 'message') saveName(material);
                                  if (e.key === 'Escape') setEditingId(null);
                                }}
                                autoFocus
                                className="flex-1 min-w-0 px-2 py-1 border border-teal-300 rounded text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => saveName(material)}
                                disabled={busyId === material._id}
                                className="px-2 py-1 bg-teal-600 text-white rounded text-xs font-medium hover:bg-teal-700 disabled:opacity-60"
                              >
                                {busyId === material._id ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200"
                              >
                                Cancel
                              </button>
                            </div>

                            {material.type === 'message' && (
                              <textarea
                                rows={4}
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                placeholder="Write the message..."
                                className="w-full px-2 py-1 border border-teal-300 rounded text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-y"
                              />
                            )}
                            </div>
                          ) : (
                            <p className="font-medium text-gray-800 truncate">
                              {material.filename || material.url}
                            </p>
                          )}

                          {material.type === 'message' && material.content && (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap mt-1">
                              {material.content}
                            </p>
                          )}

                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                              {material.type === 'message' ? 'Message' : material.type === 'link' ? 'External Link' : 'File'}
                            </span>
                            {material.createdAt && (
                              <span>
                                {new Date(material.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions: everyone gets the file itself, lecturers also get to
                          rename it or take it down */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                      {material.type === 'message' ? null : material.type === 'link' ? (
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-teal-600 hover:to-emerald-600 transition whitespace-nowrap"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Open
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => downloadMaterial(material)}
                          disabled={downloading[material._id]}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-teal-600 hover:to-emerald-600 transition whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          {downloading[material._id] ? 'Downloading...' : 'Download'}
                        </button>
                      )}

                      {canManage && editingId !== material._id && (
                        <>
                          <button
                            type="button"
                            onClick={() => startEditing(material)}
                            disabled={busyId === material._id}
                            title="Rename this material"
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition whitespace-nowrap disabled:opacity-60"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeMaterial(material)}
                            disabled={busyId === material._id}
                            title="Remove this material"
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition whitespace-nowrap disabled:opacity-60"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {busyId === material._id ? 'Removing...' : 'Remove'}
                          </button>
                        </>
                      )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-sm">No materials available yet</p>
                <p className="text-gray-400 text-xs mt-1">Check back later for course materials</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsModal;
