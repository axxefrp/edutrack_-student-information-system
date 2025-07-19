import React, { useContext, useState, useEffect, ChangeEvent } from 'react';
import { AppContext } from '../../App';
import { SchoolClass, DocumentResource, DocumentResourceCategory, UserRole } from '../../types';
import Button from '../Shared/Button';
import Input from '../Shared/Input';
import Modal from '../Shared/Modal';

const TeacherClassResourcesScreen: React.FC = () => {
  const context = useContext(AppContext);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingResourceId, setDeletingResourceId] = useState<string | null>(null);

  // Form state for new resource
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceCategory, setResourceCategory] = useState<DocumentResourceCategory>('Notes');
  const [resourceDescription, setResourceDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileNameDisplay, setFileNameDisplay] = useState('');

  // Validation errors
  const [titleError, setTitleError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [fileError, setFileError] = useState('');

  if (!context || !context.currentUser || context.currentUser.role !== UserRole.TEACHER || !context.currentUser.teacherId) {
    return <div className="p-6 text-gray-700">Loading teacher data or not authorized...</div>;
  }

  const { currentUser, schoolClasses, documentResources, addDocumentResource, deleteDocumentResource, addNotificationDirectly } = context;
  const teacherId = currentUser.teacherId;

  const teacherAssignedClasses = schoolClasses.filter(sc => sc.teacherId === teacherId);
  const resourcesForSelectedClass = documentResources.filter(dr => dr.classId === selectedClassId)
    .sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

  useEffect(() => {
    if (teacherAssignedClasses.length > 0 && !selectedClassId) {
      setSelectedClassId(teacherAssignedClasses[0].id);
    }
  }, [teacherAssignedClasses, selectedClassId]);

  const resetFormAndErrors = () => {
    setResourceTitle('');
    setResourceCategory('Notes');
    setResourceDescription('');
    setSelectedFile(null);
    setFileNameDisplay('');
    setTitleError('');
    setCategoryError('');
    setFileError('');
  };

  const openUploadModal = () => {
    if (!selectedClassId) {
        addNotificationDirectly("Error", "Please select a class first.", "error");
        return;
    }
    resetFormAndErrors();
    setIsModalOpen(true);
  };

  const closeUploadModal = () => {
    setIsModalOpen(false);
    resetFormAndErrors();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileNameDisplay(file.name);
      if(fileError) setFileError('');
    } else {
      setSelectedFile(null);
      setFileNameDisplay('');
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    setTitleError('');
    setCategoryError('');
    setFileError('');

    if (!resourceTitle.trim()) {
      setTitleError('Resource title is required.');
      isValid = false;
    }
    if (!resourceCategory) {
      setCategoryError('Category is required.');
      isValid = false;
    }
    if (!selectedFile) {
      setFileError('Please select a file to upload.');
      isValid = false;
    }
    return isValid;
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !selectedFile || !currentUser.teacherId) { // currentUser.teacherId check for TS
      return;
    }
    setIsSubmitting(true);

    const resourceData = {
      classId: selectedClassId,
      teacherId: currentUser.uid, // The user uid of the teacher
      title: resourceTitle,
      description: resourceDescription,
      fileName: selectedFile.name,
      fileType: selectedFile.type,
      uploadDate: new Date().toISOString(),
      category: resourceCategory,
    };

    try {
      const newResource = await addDocumentResource(resourceData, selectedFile);
      if (newResource) {
        addNotificationDirectly('Resource Uploaded', `"${resourceTitle}" has been added.`, 'success');
        closeUploadModal();
      } else {
         addNotificationDirectly('Upload Failed', 'There was an issue uploading the resource.', 'error');
      }
    } catch (error) {
      console.error("Upload error:", error);
      addNotificationDirectly('Upload Failed', 'An unexpected error occurred.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteResource = (resource: DocumentResource) => {
    if (window.confirm(`Are you sure you want to delete the resource "${resource.title}"?`)) {
        setDeletingResourceId(resource.id);
        setTimeout(() => { // Simulate API call
            deleteDocumentResource(resource.id);
            addNotificationDirectly('Resource Deleted', `"${resource.title}" has been deleted.`, 'success');
            setDeletingResourceId(null);
        }, 1000);
    }
  };
  
  const resourceCategories: DocumentResourceCategory[] = ['Notes', 'Assignment Brief', 'Reading Material', 'Other Resource'];

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Manage Class Resources</h1>
        {selectedClassId && (
            <Button onClick={openUploadModal} variant="primary" disabled={!selectedClassId}>
                Upload New Resource
            </Button>
        )}
      </div>

      {teacherAssignedClasses.length === 0 ? (
        <p className="text-gray-600 bg-white p-6 rounded-lg shadow">You are not assigned to any classes to manage resources for.</p>
      ) : (
        <div className="mb-6 max-w-sm">
          <label htmlFor="class-select-resources" className="block text-sm font-medium text-gray-700 mb-1">
            Select Class:
          </label>
          <select
            id="class-select-resources"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="block w-full px-4 py-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            {teacherAssignedClasses.map(sc => (
              <option key={sc.id} value={sc.id}>{sc.name}</option>
            ))}
          </select>
        </div>
      )}

      {selectedClassId && (
        resourcesForSelectedClass.length === 0 ? (
          <p className="text-gray-500 bg-white p-6 rounded-lg shadow">No resources uploaded for this class yet.</p>
        ) : (
          <div className="space-y-4">
            {resourcesForSelectedClass.map(resource => (
              <div key={resource.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-primary-700">{resource.title}</h3>
                  <p className="text-xs text-gray-500">File: {resource.fileName} ({resource.fileType})</p>
                  <p className="text-xs text-gray-500">Category: {resource.category}</p>
                  <p className="text-xs text-gray-500">Uploaded: {new Date(resource.uploadDate).toLocaleDateString()}</p>
                  {resource.description && <p className="text-sm text-gray-600 mt-1 italic">{resource.description}</p>}
                </div>
                <Button 
                    onClick={() => handleDeleteResource(resource)} 
                    variant="danger" 
                    size="sm"
                    loading={deletingResourceId === resource.id}
                >
                    Delete
                </Button>
              </div>
            ))}
          </div>
        )
      )}

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeUploadModal} title={`Upload Resource for ${schoolClasses.find(sc=>sc.id === selectedClassId)?.name || ''}`}>
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <Input
              label="Resource Title"
              type="text"
              value={resourceTitle}
              onChange={(e) => { setResourceTitle(e.target.value); if(titleError) setTitleError(''); }}
              placeholder="e.g., Chapter 1 Lecture Notes"
              required
              disabled={isSubmitting}
              error={titleError}
            />
             <div>
              <label htmlFor="resource-category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                id="resource-category"
                value={resourceCategory}
                onChange={(e) => {setResourceCategory(e.target.value as DocumentResourceCategory); if(categoryError) setCategoryError('');}}
                className={`mt-1 block w-full px-3 py-2 border ${categoryError ? 'border-red-500' : 'border-gray-300'} bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                required
                disabled={isSubmitting}
              >
                {resourceCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              {categoryError && <p className="mt-1 text-xs text-red-600">{categoryError}</p>}
            </div>
            <div>
              <label htmlFor="resource-description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                id="resource-description"
                value={resourceDescription}
                onChange={(e) => setResourceDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Brief description of the resource"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="resource-file" className="block text-sm font-medium text-gray-700 mb-1">Select File</label>
              <Input
                id="resource-file"
                type="file"
                onChange={handleFileChange}
                required
                disabled={isSubmitting}
                className="p-0 file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.ppt,.pptx,.xls,.xlsx" // Example accepted types
                error={fileError}
              />
              {fileNameDisplay && <p className="mt-1 text-xs text-gray-500">Selected: {fileNameDisplay}</p>}
            </div>
            <div className="flex justify-end space-x-3 pt-3">
              <Button type="button" onClick={closeUploadModal} variant="ghost" disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
                Upload Resource
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TeacherClassResourcesScreen;