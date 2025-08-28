import React, { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import PageLayout from './PageLayout';

const Inbox = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [sortBy, setSortBy] = useState('due_date');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterTag] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  
  // Modal form states
  const [modalForm, setModalForm] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 4,
    selectedTags: [],
    existingSubtasks: []
  });

  const priorityLabels = {
    1: { label: '緊急且重要', color: 'bg-red-500', textColor: 'text-red-800', bgColor: 'bg-red-100' },
    2: { label: '重要但不緊急', color: 'bg-yellow-500', textColor: 'text-yellow-800', bgColor: 'bg-yellow-100' },
    3: { label: '緊急但不重要', color: 'bg-blue-500', textColor: 'text-blue-800', bgColor: 'bg-blue-100' },
    4: { label: '不緊急也不重要', color: 'bg-gray-500', textColor: 'text-gray-800', bgColor: 'bg-gray-100' }
  };

  const fetchTasks = async () => {
    if (!user || !user.id) {
      console.log('No user available for fetching tasks');
      return;
    }

    console.log('Fetching tasks for user:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          subtasks (*),
          task_tags (
            tags (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        // 如果是因為表不存在，給出更具體的提示
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.error('Tasks table does not exist. Please run the SQL setup first.');
        }
      } else {
        console.log('Fetched tasks:', data);
        setTasks(data || []);
      }
    } catch (error) {
      console.error('Unexpected error fetching tasks:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching tags:', error);
      } else {
        setTags(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async () => {
    if (!quickTaskTitle.trim()) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .insert([{
          user_id: user.id,
          title: quickTaskTitle.trim(),
          priority: 4
        }]);

      if (error) {
        console.error('Error adding task:', error);
      } else {
        setQuickTaskTitle('');
        fetchTasks();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleTaskComplete = async (taskId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: !currentStatus })
        .eq('id', taskId);

      if (error) {
        console.error('Error updating task:', error);
      } else {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleSubtaskComplete = async (subtaskId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('subtasks')
        .update({ is_completed: !currentStatus })
        .eq('id', subtaskId);

      if (error) {
        console.error('Error updating subtask:', error);
      } else {
        fetchTasks(); // 重新獲取任務以更新顯示
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('確定要刪除這個任務嗎？這個操作無法撤銷。')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        alert(`刪除任務失敗: ${error.message}`);
      } else {
        console.log('Task deleted successfully');
        fetchTasks(); // 重新獲取任務列表
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`刪除任務時發生錯誤: ${error.message}`);
    }
  };

  const [editingTask, setEditingTask] = useState(null);

  const startEditTask = (task) => {
    console.log('Starting edit for task:', task);
    setEditingTask(task);
    setModalForm({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      priority: task.priority,
      selectedTags: task.task_tags?.map(tt => tt.tags.id) || [],
      existingSubtasks: task.subtasks || [] // 傳遞現有子任務
    });
    setShowModal(true);
  };

  // 測試Supabase連接
  const testSupabaseConnection = async () => {
    console.log('Testing Supabase connection...');
    try {
      const { error } = await supabase
        .from('tasks')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Supabase connection test failed:', error);
        alert(`Supabase連接測試失敗: ${error.message}\n\n請確保：\n1. 已在Supabase中創建資料表\n2. 環境變數設置正確\n3. RLS政策已啟用`);
      } else {
        console.log('Supabase connection test successful');
      }
    } catch (error) {
      console.error('Connection test error:', error);
    }
  };

  useEffect(() => {
    if (user) {
      testSupabaseConnection();
      fetchTasks();
      fetchTags();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    if (filterPriority && task.priority !== parseInt(filterPriority)) return false;
    if (filterTag && !task.task_tags?.some(tt => tt.tags.id === filterTag)) return false;
    return !task.is_completed || showCompleted;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'due_date':
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      case 'created_at':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'custom_order':
        return a.custom_order - b.custom_order;
      default:
        return 0;
    }
  });

  const completedTasks = tasks.filter(task => task.is_completed);

  const handleModalSave = async (taskData) => {
    console.log('Attempting to save task:', taskData);
    console.log('Current user:', user);
    console.log('Editing task:', editingTask);
    
    if (!user || !user.id) {
      console.error('No user logged in');
      alert('請先登入後再添加任務');
      return;
    }

    if (!taskData.title || !taskData.title.trim()) {
      console.error('Task title is required');
      alert('請輸入任務標題');
      return;
    }

    try {
      const taskUpsert = {
        title: taskData.title.trim(),
        description: taskData.description?.trim() || null,
        due_date: taskData.due_date || null,
        priority: taskData.priority || 4
      };

      let data;
      
      if (editingTask) {
        // 編輯現有任務
        console.log('Updating existing task:', editingTask.id, taskUpsert);
        
        const { data: updateData, error } = await supabase
          .from('tasks')
          .update(taskUpsert)
          .eq('id', editingTask.id)
          .select()
          .single();

        if (error) {
          console.error('Supabase error details:', error);
          alert(`更新任務失敗: ${error.message}`);
          return;
        }

        data = updateData;
        console.log('Task updated successfully:', data);
      } else {
        // 創建新任務
        taskUpsert.user_id = user.id;
        console.log('Inserting new task:', taskUpsert);

        const { data: insertData, error } = await supabase
          .from('tasks')
          .insert([taskUpsert])
          .select()
          .single();

        if (error) {
          console.error('Supabase error details:', error);
          alert(`添加任務失敗: ${error.message}`);
          return;
        }

        data = insertData;
        console.log('Task created successfully:', data);
      }

      // 處理子任務
      if (taskData.subtasks && taskData.subtasks.length >= 0) {
        if (editingTask) {
          // 編輯模式：先刪除原有子任務，再插入新的
          console.log('Updating subtasks for task:', data.id);
          
          // 刪除原有子任務
          const { error: deleteError } = await supabase
            .from('subtasks')
            .delete()
            .eq('task_id', data.id);

          if (deleteError) {
            console.error('Error deleting old subtasks:', deleteError);
          }
        }

        // 插入新子任務（如果有的話）
        if (taskData.subtasks.length > 0) {
          const filteredSubtasks = taskData.subtasks.filter(subtask => subtask.trim() !== '');
          if (filteredSubtasks.length > 0) {
            console.log('Adding/updating subtasks:', filteredSubtasks);
            const subtaskInserts = filteredSubtasks.map((subtask, index) => ({
              task_id: data.id,
              title: subtask.trim(),
              order_index: index
            }));

            const { error: subtaskError } = await supabase
              .from('subtasks')
              .insert(subtaskInserts);

            if (subtaskError) {
              console.error('Error adding subtasks:', subtaskError);
            }
          }
        }
      }

      // 處理標籤（稍後實現）
      if (taskData.selectedTags && taskData.selectedTags.length > 0) {
        console.log('Tags will be implemented later');
      }

      // 成功後重置表單並刷新
      setShowModal(false);
      setEditingTask(null);
      setModalForm({
        title: '',
        description: '',
        due_date: '',
        priority: 4,
        selectedTags: [],
        existingSubtasks: []
      });
      
      console.log('Refreshing task list...');
      await fetchTasks();
      
    } catch (error) {
      console.error('Unexpected error:', error);
      alert(`發生未預期的錯誤: ${error.message}`);
    }
  };

  return (
    <PageLayout>
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">收集箱</h2>
              <p className="text-gray-600 mt-1">管理您的所有待辦事項</p>
              {/* 調試信息 */}
              <div className="text-xs text-gray-400 mt-1">
                用戶: {user?.email} | 任務數量: {tasks.length}
              </div>
            </div>
            
            {/* View Controls */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 pr-8"
                >
                  <option value="due_date">截止日期</option>
                  <option value="created_at">建立日期</option>
                  <option value="custom_order">自訂順序</option>
                </select>
                <i className="fas fa-sort absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
              </div>
              <div className="relative">
                <select 
                  value={filterPriority} 
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="appearance-none px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 pr-8"
                >
                  <option value="">所有優先級</option>
                  <option value="1">緊急且重要</option>
                  <option value="2">重要但不緊急</option>
                  <option value="3">緊急但不重要</option>
                  <option value="4">不緊急也不重要</option>
                </select>
                <i className="fas fa-filter absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
              </div>
            </div>
          </div>

          {/* Quick Add */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
              <input 
                type="text" 
                placeholder="添加任務..." 
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleQuickAdd()}
                className="flex-1 text-gray-700 placeholder-gray-500 focus:outline-none"
              />
              <button className="text-gray-400 hover:text-orange-500">
                <i className="fas fa-calendar"></i>
              </button>
              <button className="text-gray-400 hover:text-orange-500">
                <i className="fas fa-flag"></i>
              </button>
              <button className="text-gray-400 hover:text-orange-500">
                <i className="fas fa-tag"></i>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span className="text-gray-600">載入中...</span>
            </div>
          ) : (
            <div>
              {/* Tasks List */}
              {sortedTasks.length > 0 ? (
                <div className="space-y-3">
                  {sortedTasks.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onToggleComplete={toggleTaskComplete}
                      onToggleSubtaskComplete={toggleSubtaskComplete}
                      onEditTask={startEditTask}
                      onDeleteTask={deleteTask}
                      priorityLabels={priorityLabels}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <i className="fas fa-inbox text-6xl mb-4"></i>
                  <p className="text-lg">還沒有任務，開始添加一些吧！</p>
                </div>
              )}

              {/* Completed Tasks Section */}
              {completedTasks.length > 0 && (
                <div className="mt-8">
                  <button 
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 mb-4"
                  >
                    <i className={`fas fa-chevron-${showCompleted ? 'down' : 'right'} text-xs`}></i>
                    <span className="font-medium">已完成 ({completedTasks.length})</span>
                  </button>
                  
                  {showCompleted && (
                    <div className="space-y-3">
                      {completedTasks.map(task => (
                        <TaskCard 
                          key={task.id} 
                          task={task} 
                          onToggleComplete={toggleTaskComplete}
                          onToggleSubtaskComplete={toggleSubtaskComplete}
                          onEditTask={startEditTask}
                          onDeleteTask={deleteTask}
                          priorityLabels={priorityLabels}
                          isCompleted={true}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center z-50"
        style={{
          background: 'linear-gradient(135deg, #FF6B35, #FF8A50)',
          boxShadow: '0 4px 20px rgba(255, 107, 53, 0.4)'
        }}
      >
        <i className="fas fa-plus text-xl"></i>
      </button>

      {/* Add Task Modal */}
      {showModal && (
        <TaskModal 
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingTask(null);
            setModalForm(prev => ({ ...prev, existingSubtasks: [] }));
          }}
          onSave={handleModalSave}
          form={modalForm}
          setForm={setModalForm}
          tags={tags}
          priorityLabels={priorityLabels}
          isEditing={!!editingTask}
        />
      )}
    </PageLayout>
  );
};

// TaskCard Component
const TaskCard = ({ task, onToggleComplete, onToggleSubtaskComplete, onEditTask, onDeleteTask, priorityLabels, isCompleted = false }) => {
  const priority = priorityLabels[task.priority];
  const taskTags = task.task_tags?.map(tt => tt.tags) || [];
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter(st => st.is_completed).length;

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `逾期 ${Math.abs(diffDays)} 天`, className: 'text-red-600' };
    } else if (diffDays === 0) {
      return { text: '今天', className: 'text-orange-600' };
    } else if (diffDays === 1) {
      return { text: '明天', className: 'text-orange-600' };
    } else if (diffDays <= 7) {
      return { text: `${diffDays} 天後`, className: 'text-gray-500' };
    } else {
      return { text: date.toLocaleDateString('zh-TW'), className: 'text-gray-500' };
    }
  };

  const dueDateInfo = formatDate(task.due_date);

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 transition-all hover:shadow-md ${
      isCompleted ? 'opacity-60 bg-gray-50' : ''
    } ${task.priority === 1 ? 'border-l-4 border-l-red-500' : 'border-gray-200'}`}>
      <div className="flex items-start space-x-3">
        <button
          onClick={() => onToggleComplete(task.id, task.is_completed)}
          className={`w-5 h-5 border-2 rounded-full mt-0.5 flex items-center justify-center transition-colors ${
            task.is_completed 
              ? 'bg-green-500 border-green-500 text-white' 
              : 'border-gray-300 hover:border-orange-500'
          }`}
        >
          {task.is_completed && <i className="fas fa-check text-xs"></i>}
        </button>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`font-medium ${
              task.is_completed ? 'line-through text-gray-500' : 'text-gray-800'
            }`}>
              {task.title}
            </h3>
            <div className="flex items-center space-x-2">
              {task.priority <= 2 && (
                <i className={`fas fa-flag text-sm ${
                  task.priority === 1 ? 'text-red-500' : 'text-yellow-500'
                }`}></i>
              )}
              <span className={`px-2 py-1 text-xs rounded-full ${priority.bgColor} ${priority.textColor}`}>
                {priority.label}
              </span>
              <button 
                onClick={() => onEditTask(task)}
                className="text-gray-400 hover:text-orange-500 transition-colors"
                title="編輯任務"
              >
                <i className="fas fa-edit"></i>
              </button>
            </div>
          </div>
          
          {task.description && (
            <p className={`text-sm mt-1 ${
              task.is_completed ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {task.description}
            </p>
          )}

          {/* Subtasks */}
          {subtasks.length > 0 && (
            <div className="mt-3 ml-2 space-y-2">
              {subtasks.map(subtask => (
                <div key={subtask.id} className="flex items-center space-x-2 text-sm">
                  <button
                    onClick={() => onToggleSubtaskComplete(subtask.id, subtask.is_completed)}
                    className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-colors ${
                      subtask.is_completed 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-gray-300 hover:border-orange-500'
                    }`}
                  >
                    {subtask.is_completed && <i className="fas fa-check text-xs"></i>}
                  </button>
                  <span className={subtask.is_completed ? 'line-through text-gray-500' : 'text-gray-700'}>
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              {dueDateInfo && (
                <span className={`flex items-center space-x-1 ${dueDateInfo.className}`}>
                  <i className="far fa-clock"></i>
                  <span>{dueDateInfo.text}</span>
                </span>
              )}
              
              {subtasks.length > 0 && (
                <span className="flex items-center space-x-1">
                  <i className="fas fa-list"></i>
                  <span>{completedSubtasks}/{subtasks.length} 完成</span>
                </span>
              )}
              
              {taskTags.length > 0 && (
                <div className="flex items-center space-x-1">
                  <i className="fas fa-tag"></i>
                  <div className="flex space-x-1">
                    {taskTags.slice(0, 3).map(tag => (
                      <span
                        key={tag.id}
                        className="px-2 py-0.5 text-xs rounded-full"
                        style={{ 
                          backgroundColor: tag.color + '20', 
                          color: tag.color 
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                    {taskTags.length > 3 && (
                      <span className="text-gray-400">+{taskTags.length - 3}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Delete Button */}
            <button
              onClick={() => onDeleteTask(task.id)}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
              title="刪除任務"
            >
              <i className="fas fa-trash text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// TaskModal Component
const TaskModal = ({ isOpen, onClose, onSave, form, setForm, tags, priorityLabels, isEditing = false }) => {
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState('');

  // 當編輯模式時，載入現有子任務
  useEffect(() => {
    if (isEditing && form.existingSubtasks) {
      console.log('Loading existing subtasks:', form.existingSubtasks);
      const subtaskTitles = form.existingSubtasks.map(subtask => subtask.title);
      setSubtasks(subtaskTitles);
    } else if (!isEditing) {
      // 新建模式時清空子任務
      setSubtasks([]);
    }
  }, [isEditing, form.existingSubtasks]);

  // 當Modal關閉時重置子任務
  useEffect(() => {
    if (!isOpen) {
      setSubtasks([]);
      setNewSubtask('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    
    onSave({
      ...form,
      subtasks: subtasks
    });
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, newSubtask.trim()]);
      setNewSubtask('');
    }
  };

  const removeSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const updateSubtask = (index, newValue) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index] = newValue;
    setSubtasks(updatedSubtasks);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {isEditing ? '編輯任務' : '快速添加任務'}
              </h3>
              <button 
                type="button" 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="任務標題..." 
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                autoFocus
              />
              
              <textarea 
                placeholder="詳細描述..."
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows="3"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
                  <input 
                    type="date" 
                    value={form.due_date}
                    onChange={(e) => setForm({...form, due_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">重要程度</label>
                  <select 
                    value={form.priority}
                    onChange={(e) => setForm({...form, priority: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {Object.entries(priorityLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">標籤</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <label key={tag.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={form.selectedTags.includes(tag.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({...form, selectedTags: [...form.selectedTags, tag.id]});
                            } else {
                              setForm({...form, selectedTags: form.selectedTags.filter(id => id !== tag.id)});
                            }
                          }}
                          className="sr-only"
                        />
                        <span 
                          className={`px-3 py-1 text-sm rounded-full cursor-pointer transition-colors ${
                            form.selectedTags.includes(tag.id) 
                              ? 'bg-orange-100 text-orange-800 border-2 border-orange-500' 
                              : 'bg-gray-100 text-gray-700 border-2 border-transparent'
                          }`}
                          style={form.selectedTags.includes(tag.id) ? { 
                            backgroundColor: tag.color + '30', 
                            color: tag.color,
                            borderColor: tag.color 
                          } : {}}
                        >
                          {tag.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtasks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">子任務</label>
                <div className="space-y-2">
                  {subtasks.map((subtask, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={subtask}
                        onChange={(e) => updateSubtask(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="子任務內容..."
                      />
                      <button 
                        type="button"
                        onClick={() => removeSubtask(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="添加子任務..."
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button 
                      type="button"
                      onClick={addSubtask}
                      className="px-3 py-2 text-orange-500 hover:text-orange-700"
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-xl">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              取消
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
            >
              {isEditing ? '保存修改' : '添加任務'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Inbox;
