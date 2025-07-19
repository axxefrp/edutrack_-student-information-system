
import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../App';
import { Subject } from '../../types';
import Button from '../Shared/Button';
import Input from '../Shared/Input';
import Modal from '../Shared/Modal';

type SortableSubjectKey = 'name' | 'linkedClassCount';
type SortDirection = 'ascending' | 'descending';

interface SortConfig {
  key: SortableSubjectKey;
  direction: SortDirection;
}

const AdminSubjectManagement: React.FC = () => {
  const context = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  
  const [subjectName, setSubjectName] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);

  const [nameError, setNameError] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'name', direction: 'ascending' });

  if (!context) return null;

  const { subjects, schoolClasses, addSubject, updateSubject, deleteSubject, addNotificationDirectly } = context;

  const sortedSubjects = useMemo(() => {
    let mappedSubjects = subjects.map(subject => ({
      ...subject,
      linkedClassCount: schoolClasses.filter(sc => sc.subjectIds && sc.subjectIds.includes(subject.id)).length,
    }));

    if (sortConfig !== null) {
      mappedSubjects.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return 0;
      });
    }
    return mappedSubjects;
  }, [subjects, schoolClasses, sortConfig]);

  const requestSort = (key: SortableSubjectKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: SortableSubjectKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <span className="ml-1 opacity-40">↕</span>;
    }
    return sortConfig.direction === 'ascending' ? <span className="ml-1">▲</span> : <span className="ml-1">▼</span>;
  };

  const validateForm = (): boolean => {
    setNameError('');
    if (!subjectName.trim()) {
      setNameError('Subject name is required.');
      return false;
    }
    return true;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    if (editingSubject) {
      await updateSubject({ ...editingSubject, name: subjectName, description: subjectDescription });
      addNotificationDirectly('Subject Updated', `Subject "${subjectName}" has been updated.`, 'success');
    } else {
      await addSubject(subjectName, subjectDescription);
      addNotificationDirectly('Subject Added', `Subject "${subjectName}" has been added.`, 'success');
    }
    setIsSubmitting(false);
    closeModalAndResetForm();
  };
  
  const resetFormFieldsAndErrors = () => {
    setSubjectName('');
    setSubjectDescription('');
    setNameError('');
  };

  const openAddModal = () => {
    setEditingSubject(null);
    resetFormFieldsAndErrors();
    setIsModalOpen(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectName(subject.name);
    setSubjectDescription(subject.description || '');
    setNameError('');
    setIsModalOpen(true);
  };

  const closeModalAndResetForm = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
    resetFormFieldsAndErrors();
  };

  const handleDeleteSubject = (subjectToDelete: Subject) => {
    const isSubjectLinked = schoolClasses.some(sc => sc.subjectIds && sc.subjectIds.includes(subjectToDelete.id));
    let confirmMessage = `Are you sure you want to delete the subject "${subjectToDelete.name}"?`;
    if (isSubjectLinked) {
      confirmMessage += `\n\nWarning: This subject is currently linked to one or more classes. Deleting it will unlink it from these classes.`;
    }

    if (window.confirm(confirmMessage)) {
      setDeletingSubjectId(subjectToDelete.id);
      setTimeout(() => {
        deleteSubject(subjectToDelete.id);
        addNotificationDirectly('Subject Deleted', `Subject "${subjectToDelete.name}" has been deleted.`, 'success');
        setDeletingSubjectId(null);
      }, 1000); 
    }
  };
  
  const SortableHeader: React.FC<{ sortKey: SortableSubjectKey; label: string; className?: string }> = ({ sortKey, label, className }) => (
    <th 
        scope="col" 
        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${className || ''}`}
        onClick={() => requestSort(sortKey)}
        title={`Sort by ${label}`}
        aria-sort={sortConfig?.key === sortKey ? (sortConfig.direction === 'ascending' ? 'ascending' : 'descending') : 'none'}
    >
        <div className="flex items-center">
            {label}
            {getSortIndicator(sortKey)}
        </div>
    </th>
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Manage Subjects</h1>
        <Button onClick={openAddModal} variant="primary">Add New Subject</Button>
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader sortKey="name" label="Name" />
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <SortableHeader sortKey="linkedClassCount" label="Linked Classes" />
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedSubjects.map((subject) => (
                <tr key={subject.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.name}</td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 max-w-md truncate">{subject.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.linkedClassCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button 
                      onClick={() => openEditModal(subject)} 
                      variant="secondary" 
                      size="sm" 
                      className="mr-2"
                      disabled={deletingSubjectId === subject.id}
                    >
                      Edit
                    </Button>
                    <Button 
                      onClick={() => handleDeleteSubject(subject)} 
                      variant="danger" 
                      size="sm"
                      loading={deletingSubjectId === subject.id}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
             {sortedSubjects.length === 0 && (
                <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        No subjects found. Add a new subject to get started.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModalAndResetForm} title={editingSubject ? "Edit Subject" : "Add New Subject"}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Subject Name"
            type="text"
            value={subjectName}
            onChange={(e) => { setSubjectName(e.target.value); if (nameError) setNameError(''); }}
            placeholder="e.g., Language Arts (English)"
            required
            disabled={isSubmitting}
            error={nameError}
          />
          <div>
            <label htmlFor="subject-description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
                id="subject-description"
                value={subjectDescription}
                onChange={(e) => setSubjectDescription(e.target.value)}
                placeholder="Briefly describe the subject"
                rows={3}
                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <Button type="button" onClick={closeModalAndResetForm} variant="ghost" disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
              {editingSubject ? "Save Changes" : "Add Subject"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminSubjectManagement;
